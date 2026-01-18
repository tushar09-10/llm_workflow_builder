import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/workflows/[id] - get single workflow
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const workflow = await db.workflow.findFirst({
        where: { id, userId },
    });

    if (!workflow) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(workflow);
}

// DELETE /api/workflows/[id] - delete workflow
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const workflow = await db.workflow.findFirst({
        where: { id, userId },
    });

    if (!workflow) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.workflow.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
