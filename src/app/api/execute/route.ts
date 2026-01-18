import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/execute - start an execution run
export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { workflowId, scope, nodes } = body;

    // Create execution run record
    const run = await prisma.executionRun.create({
        data: {
            workflowId: workflowId || "unsaved",
            userId,
            scope, // "full" | "partial" | "single"
            status: "running",
        },
    });

    // Create pending node executions
    for (const node of nodes) {
        await prisma.nodeExecution.create({
            data: {
                runId: run.id,
                nodeId: node.id,
                nodeType: node.type,
                status: "pending",
            },
        });
    }

    return NextResponse.json({ runId: run.id });
}
