import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Sparkles } from "lucide-react";
import { LLMNodeData, GEMINI_MODELS } from "@/lib/types";
import { useWorkflowStore } from "@/lib/store";

function LLMNode({ id, data, selected }: NodeProps<LLMNodeData>) {
    const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
    const edges = useWorkflowStore((s) => s.edges);
    const execution = useWorkflowStore((s) => s.execution);

    // Check for incoming connections to disable manual input
    const hasSystemPromptConnection = edges.some(
        (e) => e.target === id && e.targetHandle === "system-in"
    );
    const hasUserMessageConnection = edges.some(
        (e) => e.target === id && e.targetHandle === "user-in"
    );

    const nodeStatus = execution.nodeResults[id];
    const isRunning = nodeStatus?.status === "running";

    return (
        <div
            className={`bg-card border rounded-lg p-3 min-w-[280px] transition-all ${selected ? "border-accent ring-2 ring-accent/30" : "border-border"
                } ${isRunning ? "node-running" : ""}`}
        >
            {/* Input handles */}
            <Handle
                type="target"
                position={Position.Left}
                id="system-in"
                style={{ top: 50 }}
                className="!w-3 !h-3 !bg-accent !border-2 !border-background"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="user-in"
                style={{ top: 90 }}
                className="!w-3 !h-3 !bg-accent !border-2 !border-background"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="images-in"
                style={{ top: 130 }}
                className="!w-3 !h-3 !bg-green-400 !border-2 !border-background"
            />

            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground">
                <Sparkles size={14} className="text-purple-400" />
                <span>Run LLM</span>
            </div>

            {/* Model selector */}
            <div className="mb-2">
                <label className="text-xs text-muted block mb-1">Model</label>
                <select
                    value={data.model || GEMINI_MODELS[0].id}
                    onChange={(e) => updateNodeData(id, { model: e.target.value })}
                    className="w-full bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
                >
                    {GEMINI_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* System prompt */}
            <div className="mb-2">
                <label className="text-xs text-muted block mb-1">
                    System Prompt {hasSystemPromptConnection && "(connected)"}
                </label>
                <textarea
                    className="w-full bg-background border border-border rounded px-2 py-1 text-sm resize-none focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    rows={2}
                    placeholder="Optional system prompt..."
                    value={data.systemPrompt || ""}
                    disabled={hasSystemPromptConnection}
                    onChange={(e) => updateNodeData(id, { systemPrompt: e.target.value })}
                />
            </div>

            {/* User message */}
            <div className="mb-2">
                <label className="text-xs text-muted block mb-1">
                    User Message {hasUserMessageConnection && "(connected)"}
                </label>
                <textarea
                    className="w-full bg-background border border-border rounded px-2 py-1 text-sm resize-none focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    rows={2}
                    placeholder="Required user message..."
                    value={data.userMessage || ""}
                    disabled={hasUserMessageConnection}
                    onChange={(e) => updateNodeData(id, { userMessage: e.target.value })}
                />
            </div>

            {/* Result display */}
            {data.result && (
                <div className="mt-2 p-2 bg-background/50 rounded border border-border">
                    <label className="text-xs text-muted block mb-1">Result</label>
                    <p className="text-sm text-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {data.result}
                    </p>
                </div>
            )}

            {/* Output handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="text-out"
                className="!w-3 !h-3 !bg-accent !border-2 !border-background"
            />
        </div>
    );
}

export default memo(LLMNode);
