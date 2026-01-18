"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import {
    Save,
    FolderOpen,
    Play,
    PlayCircle,
    Download,
    Upload,
    Undo2,
    Redo2,
    Loader2,
} from "lucide-react";
import { useWorkflowStore } from "@/lib/store";

interface TopBarProps {
    onRunFull: () => void;
    onRunSelected: () => void;
    onSave: () => Promise<void>;
    onLoad: () => void;
    onExport: () => void;
    onImport: () => void;
}

export function TopBar({
    onRunFull,
    onRunSelected,
    onSave,
    onLoad,
    onExport,
    onImport,
}: TopBarProps) {
    const { user } = useUser();
    const meta = useWorkflowStore((s) => s.meta);
    const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);
    const selectedNodes = useWorkflowStore((s) => s.selectedNodes);
    const execution = useWorkflowStore((s) => s.execution);
    const undo = useWorkflowStore((s) => s.undo);
    const redo = useWorkflowStore((s) => s.redo);
    const history = useWorkflowStore((s) => s.history);
    const historyIndex = useWorkflowStore((s) => s.historyIndex);

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave();
        } finally {
            setSaving(false);
        }
    };

    const canUndo = historyIndex >= 0;
    const canRedo = historyIndex < history.length - 1;

    return (
        <div className="h-14 bg-card border-b border-border flex items-center px-4 gap-4">
            {/* Logo / title */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">W</span>
                </div>
                <input
                    type="text"
                    value={meta.name}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className="bg-transparent border-none text-lg font-semibold focus:outline-none focus:ring-1 focus:ring-accent rounded px-1"
                />
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-border" />

            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
                <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="p-2 hover:bg-card-hover rounded disabled:opacity-30"
                    title="Undo"
                >
                    <Undo2 size={18} />
                </button>
                <button
                    onClick={redo}
                    disabled={!canRedo}
                    className="p-2 hover:bg-card-hover rounded disabled:opacity-30"
                    title="Redo"
                >
                    <Redo2 size={18} />
                </button>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* File operations */}
            <div className="flex items-center gap-1">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-dim rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save
                </button>
                <button
                    onClick={onLoad}
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-card-hover rounded text-sm"
                >
                    <FolderOpen size={14} />
                    Load
                </button>
                <button
                    onClick={onExport}
                    className="p-2 hover:bg-card-hover rounded"
                    title="Export JSON"
                >
                    <Download size={16} />
                </button>
                <button
                    onClick={onImport}
                    className="p-2 hover:bg-card-hover rounded"
                    title="Import JSON"
                >
                    <Upload size={16} />
                </button>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Run controls */}
            <div className="flex items-center gap-1">
                <button
                    onClick={onRunFull}
                    disabled={execution.isRunning}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-success/20 hover:bg-success/30 text-success rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {execution.isRunning ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Play size={14} />
                    )}
                    Run All
                </button>
                <button
                    onClick={onRunSelected}
                    disabled={execution.isRunning || selectedNodes.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-card-hover rounded text-sm disabled:opacity-30"
                >
                    <PlayCircle size={14} />
                    Run Selected ({selectedNodes.length})
                </button>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* User info */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted">{user?.primaryEmailAddress?.emailAddress}</span>
                <UserButton afterSignOutUrl="/" />
            </div>
        </div>
    );
}
