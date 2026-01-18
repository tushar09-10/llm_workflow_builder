import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Film } from "lucide-react";
import { ExtractFrameNodeData } from "@/lib/types";
import { useWorkflowStore } from "@/lib/store";

function ExtractFrameNode({ id, data, selected }: NodeProps<ExtractFrameNodeData>) {
    const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
    const execution = useWorkflowStore((s) => s.execution);

    const nodeStatus = execution.nodeResults[id];
    const isRunning = nodeStatus?.status === "running";

    return (
        <div
            className={`bg-card border rounded-lg p-3 min-w-[200px] transition-all ${selected ? "border-accent ring-2 ring-accent/30" : "border-border"
                } ${isRunning ? "node-running" : ""}`}
        >
            <Handle
                type="target"
                position={Position.Left}
                id="video-in"
                className="!w-3 !h-3 !bg-blue-400 !border-2 !border-background"
            />

            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground">
                <Film size={14} className="text-cyan-400" />
                <span>Extract Frame</span>
            </div>

            <div>
                <label className="text-xs text-muted block mb-1">
                    Timestamp (seconds or %)
                </label>
                <input
                    type="text"
                    placeholder='e.g., 5 or "50%"'
                    value={data.timestamp || ""}
                    onChange={(e) => updateNodeData(id, { timestamp: e.target.value })}
                    className="w-full bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
                />
            </div>

            {/* Result preview */}
            {data.resultUrl && (
                <div className="mt-2">
                    <label className="text-xs text-muted block mb-1">Extracted Frame</label>
                    <img
                        src={data.resultUrl}
                        alt="Frame"
                        className="w-full h-20 object-cover rounded"
                    />
                </div>
            )}

            <Handle
                type="source"
                position={Position.Right}
                id="image-out"
                className="!w-3 !h-3 !bg-green-400 !border-2 !border-background"
            />
        </div>
    );
}

export default memo(ExtractFrameNode);
