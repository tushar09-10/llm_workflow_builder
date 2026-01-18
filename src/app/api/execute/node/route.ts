import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// POST /api/execute/node - execute a single node
export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { runId, nodeId, nodeType, nodeData, inputs } = body;

    const startedAt = new Date();

    try {
        let output: unknown = null;

        // Update node execution to running
        await prisma.nodeExecution.updateMany({
            where: { runId, nodeId },
            data: { status: "running", startedAt, inputs: inputs },
        });

        switch (nodeType) {
            case "textNode": {
                // Text nodes just pass through their text
                output = nodeData.text || "";
                break;
            }

            case "uploadImageNode": {
                // Image nodes output their URL
                output = nodeData.imageUrl || "";
                break;
            }

            case "uploadVideoNode": {
                // Video nodes output their URL
                output = nodeData.videoUrl || "";
                break;
            }

            case "llmNode": {
                // Run LLM via Trigger.dev
                const systemPrompt = inputs["system-in"] || nodeData.systemPrompt || "";
                const userMessage = inputs["user-in"] || nodeData.userMessage || "";
                const imageUrls = inputs["images-in"] ? [inputs["images-in"]] : [];

                if (!userMessage) {
                    throw new Error("User message is required");
                }

                // For now, call Gemini directly (Trigger.dev integration below)
                const model = genAI.getGenerativeModel({ model: nodeData.model || "gemini-2.0-flash" });

                const parts: { text: string }[] = [];
                if (systemPrompt) {
                    parts.push({ text: `System: ${systemPrompt}` });
                }
                parts.push({ text: userMessage });

                // Note: For images, we'd need to fetch and convert to base64
                // Simplified for now
                const result = await model.generateContent(parts.map(p => p.text).join("\n\n"));
                output = result.response.text();
                break;
            }

            case "cropImageNode": {
                // Crop via FFmpeg/Transloadit
                const imageUrl = inputs["image-in"];
                if (!imageUrl) {
                    throw new Error("No input image");
                }

                // For now, just pass through (actual FFmpeg integration via Trigger.dev)
                // In production, this would call a Trigger.dev task
                output = imageUrl; // Placeholder - would be cropped URL
                break;
            }

            case "extractFrameNode": {
                // Extract frame via FFmpeg
                const videoUrl = inputs["video-in"];
                if (!videoUrl) {
                    throw new Error("No input video");
                }

                // For now, pass through (actual FFmpeg integration via Trigger.dev)
                output = videoUrl; // Placeholder - would be frame URL
                break;
            }

            default:
                throw new Error(`Unknown node type: ${nodeType}`);
        }

        const endedAt = new Date();
        const duration = endedAt.getTime() - startedAt.getTime();

        // Update node execution
        await prisma.nodeExecution.updateMany({
            where: { runId, nodeId },
            data: {
                status: "success",
                outputs: { result: output as any },
                endedAt,
                duration,
            },
        });

        return NextResponse.json({ output });
    } catch (err) {
        const error = (err as Error).message;

        await prisma.nodeExecution.updateMany({
            where: { runId, nodeId },
            data: {
                status: "failed",
                error,
                endedAt: new Date(),
            },
        });

        return NextResponse.json({ error }, { status: 500 });
    }
}
