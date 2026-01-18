"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { formatDistanceToNow } from "@/lib/utils";

interface RunHistoryItem {
    id: string;
    scope: string;
    status: string;
    startedAt: string;
    duration: number | null;
    nodeExecutions: {
        nodeId: string;
        nodeType: string;
        status: string;
        inputs: unknown;
        outputs: unknown;
        duration: number | null;
    }[];
}

export function RightSidebar() {
    const rightSidebarOpen = useWorkflowStore((s) => s.rightSidebarOpen);
    const toggleRightSidebar = useWorkflowStore((s) => s.toggleRightSidebar);
    const meta = useWorkflowStore((s) => s.meta);

    const [runs, setRuns] = useState<RunHistoryItem[]>([]);
    const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (meta.id) {
            loadRuns();
        }
    }, [meta.id]);

    const loadRuns = async () => {
        if (!meta.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/runs/${meta.id}`);
            const data = await res.json();
            setRuns(data.runs || []);
        } catch (err) {
            console.error("Failed to load runs:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "success":
                return <CheckCircle size={14} className="text-success" />;
            case "failed":
                return <XCircle size={14} className="text-error" />;
            case "running":
                return <Loader2 size={14} className="text-warning animate-spin" />;
            default:
                return <Clock size={14} className="text-muted" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "success":
                return "text-success";
            case "failed":
                return "text-error";
            case "running":
                return "text-warning";
            default:
                return "text-muted";
        }
    };

    return (
        <div
            className={`h-full bg-card border-l border-border flex flex-col transition-all duration-200 ${rightSidebarOpen ? "w-72" : "w-10"
                }`}
        >
            {/* Toggle button */}
            <button
                onClick={toggleRightSidebar}
                className="p-2 hover:bg-card-hover border-b border-border flex items-center justify-center"
            >
                {rightSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            {rightSidebarOpen && (
                <div className="p-3 flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                            Run History
                        </h3>
                        <button
                            onClick={loadRuns}
                            disabled={!meta.id}
                            className="text-xs text-accent hover:underline disabled:opacity-50"
                        >
                            Refresh
                        </button>
                    </div>

                    {!meta.id && (
                        <p className="text-xs text-muted">Save the workflow to see history</p>
                    )}

                    {loading && (
                        <div className="flex items-center gap-2 text-muted text-sm">
                            <Loader2 size={14} className="animate-spin" />
                            Loading...
                        </div>
                    )}

                    {runs.length === 0 && meta.id && !loading && (
                        <p className="text-xs text-muted">No runs yet</p>
                    )}

                    <div className="space-y-2">
                        {runs.map((run) => (
                            <div
                                key={run.id}
                                className="border border-border rounded-lg overflow-hidden"
                            >
                                <button
                                    onClick={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}
                                    className="w-full p-2 hover:bg-card-hover flex items-center gap-2"
                                >
                                    {getStatusIcon(run.status)}
                                    <div className="flex-1 text-left">
                                        <div className="text-sm font-medium capitalize">{run.scope} run</div>
                                        <div className="text-xs text-muted">
                                            {formatDistanceToNow(new Date(run.startedAt))}
                                            {run.duration && ` • ${run.duration}ms`}
                                        </div>
                                    </div>
                                </button>

                                {expandedRunId === run.id && (
                                    <div className="border-t border-border p-2 bg-background/50">
                                        {run.nodeExecutions.map((ne) => (
                                            <div key={ne.nodeId} className="py-1 border-b border-border/50 last:border-0">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(ne.status)}
                                                    <span className="text-xs font-medium">{ne.nodeType}</span>
                                                    <span className={`text-xs ml-auto ${getStatusColor(ne.status)}`}>
                                                        {ne.status}
                                                    </span>
                                                </div>
                                                {ne.duration && (
                                                    <span className="text-xs text-muted">{ne.duration}ms</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
