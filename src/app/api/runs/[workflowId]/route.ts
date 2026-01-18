import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/runs/[workflowId] - get execution history for a workflow
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ workflowId: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workflowId } = await params;

    const runs = await prisma.executionRun.findMany({
        where: { workflowId, userId },
        include: {
            nodeExecutions: {
                select: {
                    nodeId: true,
                    nodeType: true,
                    status: true,
                    inputs: true,
                    outputs: true,
                    duration: true,
                },
            },
        },
        orderBy: { startedAt: "desc" },
        take: 50,
    });

    return NextResponse.json({ runs });
}
