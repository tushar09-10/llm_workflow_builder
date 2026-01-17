"use client";

import { useCallback, useRef, useEffect } from "react";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    useReactFlow,
    Connection,
    OnSelectionChangeParams,
} from "reactflow";
import "reactflow/dist/style.css";

import { useWorkflowStore } from "@/lib/store";
import { nodeTypes, handleTypes } from "@/components/nodes";
import { WorkflowNode } from "@/lib/types";

function WorkflowCanvasInner() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    const nodes = useWorkflowStore((s) => s.nodes);
    const edges = useWorkflowStore((s) => s.edges);
    const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
    const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
    const onConnect = useWorkflowStore((s) => s.onConnect);
    const setSelectedNodes = useWorkflowStore((s) => s.setSelectedNodes);
    const addNode = useWorkflowStore((s) => s.addNode);
    const deleteSelectedNodes = useWorkflowStore((s) => s.deleteSelectedNodes);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                // Don't delete if we're typing in an input
                if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") {
                    return;
                }
                deleteSelectedNodes();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [deleteSelectedNodes]);

    // Validate connections based on handle types
    const isValidConnection = useCallback((connection: Connection) => {
        if (!connection.sourceHandle || !connection.targetHandle) return false;

        const sourceType = handleTypes[connection.sourceHandle];
        const targetType = handleTypes[connection.targetHandle];

        // Types must match
        return sourceType === targetType;
    }, []);

    // Handle selection changes
    const onSelectionChange = useCallback(
        ({ nodes }: OnSelectionChangeParams) => {
            setSelectedNodes(nodes.map((n) => n.id));
        },
        [setSelectedNodes]
    );

    // Handle drag and drop from sidebar
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const data = event.dataTransfer.getData("application/reactflow");
            if (!data) return;

            const { type, data: nodeData } = JSON.parse(data);
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: WorkflowNode = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: nodeData,
            };

            addNode(newNode);
        },
        [screenToFlowPosition, addNode]
    );

    return (
        <div ref={reactFlowWrapper} className="flex-1 h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onSelectionChange={onSelectionChange}
                isValidConnection={isValidConnection}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid
                snapGrid={[16, 16]}
                defaultEdgeOptions={{
                    animated: true,
                    className: "animated-edge",
                }}
            >
                <Background
                    gap={16}
                    size={1}
                    color="rgba(255,255,255,0.05)"
                />
                <Controls />
                <MiniMap
                    nodeStrokeColor="#a855f7"
                    nodeColor="#18181f"
                    maskColor="rgba(0,0,0,0.8)"
                />
            </ReactFlow>
        </div>
    );
}

export function WorkflowCanvas() {
    return (
        <ReactFlowProvider>
            <WorkflowCanvasInner />
        </ReactFlowProvider>
    );
}
