"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useWorkflowStore } from "@/lib/store";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { WorkflowCanvas } from "@/components/canvas/WorkflowCanvas";
import { LoadWorkflowModal } from "@/components/modals/LoadWorkflowModal";
import { executeWorkflow } from "@/lib/executor";

export default function DashboardPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loadModalOpen, setLoadModalOpen] = useState(false);

    const nodes = useWorkflowStore((s) => s.nodes);
    const edges = useWorkflowStore((s) => s.edges);
    const meta = useWorkflowStore((s) => s.meta);
    const selectedNodes = useWorkflowStore((s) => s.selectedNodes);
    const setWorkflowMeta = useWorkflowStore((s) => s.setWorkflowMeta);
    const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);
    const undo = useWorkflowStore((s) => s.undo);
    const redo = useWorkflowStore((s) => s.redo);

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "z") {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [undo, redo]);

    const handleSave = useCallback(async () => {
        const payload = {
            id: meta.id,
            name: meta.name,
            nodes: nodes,
            edges: edges,
        };

        const res = await fetch("/api/workflows", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.id) {
            setWorkflowMeta({ id: data.id, savedAt: new Date() });
        }
    }, [meta, nodes, edges, setWorkflowMeta]);

    const handleLoad = () => {
        setLoadModalOpen(true);
    };

    const handleExport = useCallback(() => {
        const data = {
            name: meta.name,
            nodes: nodes,
            edges: edges,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${meta.name.replace(/\s+/g, "_")}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [meta.name, nodes, edges]);

    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                loadWorkflow(data.nodes || [], data.edges || [], {
                    id: null,
                    name: data.name || "Imported Workflow",
                    savedAt: null,
                });
            } catch (err) {
                console.error("Failed to import workflow:", err);
                alert("Invalid workflow file");
            }
        };
        reader.readAsText(file);

        // Reset the input
        e.target.value = "";
    };

    const handleRunFull = async () => {
        await executeWorkflow(nodes, edges, "full");
    };

    const handleRunSelected = async () => {
        if (selectedNodes.length === 0) return;
        const nodesToRun = nodes.filter((n) => selectedNodes.includes(n.id));
        await executeWorkflow(nodesToRun, edges, selectedNodes.length === 1 ? "single" : "partial");
    };

    return (
        <div className="h-screen flex flex-col bg-background">
            <TopBar
                onRunFull={handleRunFull}
                onRunSelected={handleRunSelected}
                onSave={handleSave}
                onLoad={handleLoad}
                onExport={handleExport}
                onImport={handleImport}
            />

            <div className="flex-1 flex overflow-hidden">
                <LeftSidebar />
                <WorkflowCanvas />
                <RightSidebar />
            </div>

            {/* Hidden file input for import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileImport}
            />

            {/* Load workflow modal */}
            <LoadWorkflowModal
                open={loadModalOpen}
                onClose={() => setLoadModalOpen(false)}
            />
        </div>
    );
}
