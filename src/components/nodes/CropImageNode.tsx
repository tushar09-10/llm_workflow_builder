import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Crop } from "lucide-react";
import { CropImageNodeData } from "@/lib/types";
import { useWorkflowStore } from "@/lib/store";

function CropImageNode({ id, data, selected }: NodeProps<CropImageNodeData>) {
    const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
    const execution = useWorkflowStore((s) => s.execution);

    const nodeStatus = execution.nodeResults[id];
    const isRunning = nodeStatus?.status === "running";

    return (
        <div
            className={`bg-card border rounded-lg p-3 min-w-[220px] transition-all ${selected ? "border-accent ring-2 ring-accent/30" : "border-border"
                } ${isRunning ? "node-running" : ""}`}
        >
            <Handle
                type="target"
                position={Position.Left}
                id="image-in"
                className="!w-3 !h-3 !bg-green-400 !border-2 !border-background"
            />

            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground">
                <Crop size={14} className="text-orange-400" />
                <span>Crop Image</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <label className="text-xs text-muted block mb-1">X %</label>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={data.xPercent ?? 0}
                        onChange={(e) => updateNodeData(id, { xPercent: Number(e.target.value) })}
                        className="w-full bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
                    />
                </div>
                <div>
                    <label className="text-xs text-muted block mb-1">Y %</label>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={data.yPercent ?? 0}
                        onChange={(e) => updateNodeData(id, { yPercent: Number(e.target.value) })}
                        className="w-full bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
                    />
                </div>
                <div>
                    <label className="text-xs text-muted block mb-1">Width %</label>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={data.widthPercent ?? 100}
                        onChange={(e) => updateNodeData(id, { widthPercent: Number(e.target.value) })}
                        className="w-full bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
                    />
                </div>
                <div>
                    <label className="text-xs text-muted block mb-1">Height %</label>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={data.heightPercent ?? 100}
                        onChange={(e) => updateNodeData(id, { heightPercent: Number(e.target.value) })}
                        className="w-full bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
                    />
                </div>
            </div>

            {/* Result preview */}
            {data.resultUrl && (
                <div className="mt-2">
                    <label className="text-xs text-muted block mb-1">Result</label>
                    <img
                        src={data.resultUrl}
                        alt="Cropped"
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

export default memo(CropImageNode);
