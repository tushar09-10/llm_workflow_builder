import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/workflows - list user's workflows
export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workflows = await prisma.workflow.findMany({
        where: { userId },
        select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ workflows });
}

// POST /api/workflows - create or update workflow
export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, nodes, edges } = body;

    if (id) {
        // Update existing
        const existing = await prisma.workflow.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
        }

        const updated = await prisma.workflow.update({
            where: { id },
            data: {
                name,
                nodes: nodes,
                edges: edges,
            },
        });

        return NextResponse.json({ id: updated.id });
    } else {
        // Create new
        const created = await prisma.workflow.create({
            data: {
                userId,
                name: name || "Untitled Workflow",
                nodes: nodes || [],
                edges: edges || [],
            },
        });

        return NextResponse.json({ id: created.id });
    }
}
