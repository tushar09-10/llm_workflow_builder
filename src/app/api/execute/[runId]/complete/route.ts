import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// POST /api/execute/[runId]/complete - mark run as complete
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ runId: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { runId } = await params;
    const body = await req.json();
    const { status } = body;

    const run = await db.executionRun.findFirst({
        where: { id: runId, userId },
    });

    if (!run) {
        return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    const endedAt = new Date();
    const duration = endedAt.getTime() - run.startedAt.getTime();

    await db.executionRun.update({
        where: { id: runId },
        data: {
            status,
            endedAt,
            duration,
        },
    });

    return NextResponse.json({ success: true });
}
