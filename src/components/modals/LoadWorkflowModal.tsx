"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";

interface Workflow {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

interface LoadWorkflowModalProps {
    open: boolean;
    onClose: () => void;
}

export function LoadWorkflowModal({ open, onClose }: LoadWorkflowModalProps) {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);

    useEffect(() => {
        if (open) {
            fetchWorkflows();
        }
    }, [open]);

    const fetchWorkflows = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/workflows");
            const data = await res.json();
            setWorkflows(data.workflows || []);
        } catch (err) {
            console.error("Failed to fetch workflows:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoad = async (id: string) => {
        try {
            const res = await fetch(`/api/workflows/${id}`);
            const data = await res.json();

            loadWorkflow(data.nodes || [], data.edges || [], {
                id: data.id,
                name: data.name,
                savedAt: new Date(data.updatedAt),
            });

            onClose();
        } catch (err) {
            console.error("Failed to load workflow:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this workflow?")) return;

        setDeleting(id);
        try {
            await fetch(`/api/workflows/${id}`, { method: "DELETE" });
            setWorkflows((wfs) => wfs.filter((w) => w.id !== id));
        } catch (err) {
            console.error("Failed to delete workflow:", err);
        } finally {
            setDeleting(null);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">Load Workflow</h2>
                    <button onClick={onClose} className="p-1 hover:bg-card-hover rounded">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 max-h-96 overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={24} className="animate-spin text-accent" />
                        </div>
                    )}

                    {!loading && workflows.length === 0 && (
                        <p className="text-center text-muted py-8">No saved workflows</p>
                    )}

                    <div className="space-y-2">
                        {workflows.map((wf) => (
                            <div
                                key={wf.id}
                                className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-accent group"
                            >
                                <button
                                    onClick={() => handleLoad(wf.id)}
                                    className="flex-1 text-left"
                                >
                                    <div className="font-medium">{wf.name}</div>
                                    <div className="text-xs text-muted">
                                        Updated {new Date(wf.updatedAt).toLocaleDateString()}
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleDelete(wf.id)}
                                    disabled={deleting === wf.id}
                                    className="p-2 hover:bg-error/20 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                >
                                    {deleting === wf.id ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={16} className="text-error" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
