"use client";

import { ChevronLeft, ChevronRight, Type, Image, Video, Sparkles, Crop, Film } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { nodeDefinitions } from "@/components/nodes";
import { createSampleWorkflow } from "@/lib/sample-workflow";
import { NodeData } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
    Type,
    Image,
    Video,
    Sparkles,
    Crop,
    Film,
};

export function LeftSidebar() {
    const leftSidebarOpen = useWorkflowStore((s) => s.leftSidebarOpen);
    const toggleLeftSidebar = useWorkflowStore((s) => s.toggleLeftSidebar);
    const addNode = useWorkflowStore((s) => s.addNode);
    const nodes = useWorkflowStore((s) => s.nodes);
    const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);

    const handleDragStart = (e: React.DragEvent, nodeType: string, defaultData: unknown) => {
        e.dataTransfer.setData("application/reactflow", JSON.stringify({ type: nodeType, data: defaultData }));
        e.dataTransfer.effectAllowed = "move";
    };

    const handleAddNode = (type: string, defaultData: unknown) => {
        const offset = nodes.length * 20;
        addNode({
            id: `${type}-${Date.now()}`,
            type,
            position: { x: 250 + offset, y: 100 + offset },
            data: defaultData as NodeData,
        });
    };

    const handleLoadSample = () => {
        const { nodes: sampleNodes, edges: sampleEdges } = createSampleWorkflow();
        loadWorkflow(sampleNodes, sampleEdges, {
            id: null,
            name: "Product Marketing Kit Generator",
            savedAt: null,
        });
    };

    return (
        <div
            className={`h-full bg-card border-r border-border flex flex-col transition-all duration-200 ${leftSidebarOpen ? "w-60" : "w-10"
                }`}
        >
            <button
                onClick={toggleLeftSidebar}
                className="p-2 hover:bg-card-hover border-b border-border flex items-center justify-center"
            >
                {leftSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>

            {leftSidebarOpen && (
                <div className="p-3 flex-1 overflow-y-auto">
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                        Nodes
                    </h3>

                    <div className="space-y-2">
                        {nodeDefinitions.map((node) => {
                            const Icon = iconMap[node.icon];
                            return (
                                <div
                                    key={node.type}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, node.type, node.defaultData)}
                                    onClick={() => handleAddNode(node.type, node.defaultData)}
                                    className="p-2 bg-background border border-border rounded-lg cursor-grab hover:border-accent hover:bg-card-hover transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon size={16} className={node.color} />
                                        <span className="text-sm font-medium">{node.label}</span>
                                    </div>
                                    <p className="text-xs text-muted mt-1">{node.description}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 pt-4 border-t border-border">
                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                            Templates
                        </h3>
                        <button
                            onClick={handleLoadSample}
                            className="w-full p-2 bg-accent/10 border border-accent/30 rounded-lg hover:bg-accent/20 transition-colors text-left"
                        >
                            <div className="text-sm font-medium text-accent">Marketing Kit</div>
                            <p className="text-xs text-muted mt-0.5">Sample workflow with all node types</p>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
