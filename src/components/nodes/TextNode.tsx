import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Type } from "lucide-react";
import { TextNodeData } from "@/lib/types";
import { useWorkflowStore } from "@/lib/store";

function TextNode({ id, data, selected }: NodeProps<TextNodeData>) {
    const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
    const edges = useWorkflowStore((s) => s.edges);

    // Check if this node has an incoming connection (disabled if connected)
    const hasIncomingConnection = edges.some((e) => e.target === id);

    return (
        <div
            className={`bg-card border rounded-lg p-3 min-w-[200px] transition-all ${selected ? "border-accent ring-2 ring-accent/30" : "border-border"
                }`}
        >
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-foreground">
                <Type size={14} className="text-accent" />
                <span>Text</span>
            </div>

            <textarea
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm resize-none focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                rows={3}
                placeholder="Enter your text..."
                value={data.text || ""}
                disabled={hasIncomingConnection}
                onChange={(e) => updateNodeData(id, { text: e.target.value })}
            />

            <Handle
                type="source"
                position={Position.Right}
                id="text-out"
                className="!w-3 !h-3 !bg-accent !border-2 !border-background"
            />
        </div>
    );
}

export default memo(TextNode);
