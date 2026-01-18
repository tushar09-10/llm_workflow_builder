import { NextRequest, NextResponse } from "next/server";

// POST /api/upload - upload file via Transloadit
export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "image" or "video"

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    try {
        // Create Transloadit assembly
        const transloaditKey = process.env.TRANSLOADIT_AUTH_KEY;
        const transloaditSecret = process.env.TRANSLOADIT_AUTH_SECRET;

        if (!transloaditKey || !transloaditSecret) {
            // Fallback: return a data URL for development
            const buffer = Buffer.from(await file.arrayBuffer());
            const base64 = buffer.toString("base64");
            const mimeType = file.type || (type === "video" ? "video/mp4" : "image/png");
            const dataUrl = `data:${mimeType};base64,${base64}`;

            return NextResponse.json({ url: dataUrl });
        }

        // Create assembly params
        const assemblyData = new FormData();

        const params = {
            auth: { key: transloaditKey },
            steps: {
                upload: {
                    robot: "/upload/handle",
                },
                store: {
                    robot: "/s3/store",
                    use: "upload",
                    credentials: "MY_S3_CREDENTIALS",
                },
            },
        };

        assemblyData.append("params", JSON.stringify(params));
        assemblyData.append("file", file);

        const res = await fetch("https://api2.transloadit.com/assemblies", {
            method: "POST",
            body: assemblyData,
        });

        const result = await res.json();

        if (result.error) {
            throw new Error(result.error);
        }

        // For simplicity, return the Transloadit URL
        // In production, you'd poll for completion or use webhooks
        const uploadedUrl = result.uploads?.[0]?.ssl_url || result.assembly_ssl_url;

        return NextResponse.json({ url: uploadedUrl });
    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 }
        );
    }
}
