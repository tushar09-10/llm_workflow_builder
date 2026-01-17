import { Node, Edge } from "reactflow";

// Node data types for each node type
export interface TextNodeData {
    text: string;
}

export interface UploadImageNodeData {
    imageUrl: string | null;
    fileName: string | null;
}

export interface UploadVideoNodeData {
    videoUrl: string | null;
    fileName: string | null;
}

export interface LLMNodeData {
    model: string;
    systemPrompt: string;
    userMessage: string;
    result: string | null;
    isRunning: boolean;
}

export interface CropImageNodeData {
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
    resultUrl: string | null;
}

export interface ExtractFrameNodeData {
    timestamp: string; // seconds or "50%"
    resultUrl: string | null;
}

export type NodeData =
    | TextNodeData
    | UploadImageNodeData
    | UploadVideoNodeData
    | LLMNodeData
    | CropImageNodeData
    | ExtractFrameNodeData
    | Record<string, unknown>;

export type WorkflowNode = Node<NodeData>;
export type WorkflowEdge = Edge;

// Handle types for type-safe connections
export type HandleType = "text" | "image" | "video";

export interface HandleConfig {
    id: string;
    type: HandleType;
    position: "top" | "bottom" | "left" | "right";
}

// Execution types
export interface NodeExecutionResult {
    nodeId: string;
    status: "pending" | "running" | "success" | "failed";
    inputs?: Record<string, unknown>;
    outputs?: Record<string, unknown>;
    error?: string;
    startedAt?: Date;
    endedAt?: Date;
}

export interface ExecutionState {
    isRunning: boolean;
    runId: string | null;
    nodeResults: Record<string, NodeExecutionResult>;
}

// Workflow metadata
export interface WorkflowMeta {
    id: string | null;
    name: string;
    savedAt: Date | null;
}

// History entry for undo/redo
export interface HistoryEntry {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}

// Run scope types
export type RunScope = "full" | "partial" | "single";

// Gemini models available
export const GEMINI_MODELS = [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
] as const;
