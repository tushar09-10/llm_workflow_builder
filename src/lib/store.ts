import { create } from "zustand";
import {
    Connection,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    NodeChange,
    EdgeChange,
} from "reactflow";
import {
    WorkflowNode,
    WorkflowEdge,
    WorkflowMeta,
    ExecutionState,
    NodeExecutionResult,
    HistoryEntry,
} from "./types";

const MAX_HISTORY = 50;

interface WorkflowStore {
    // Core state
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    meta: WorkflowMeta;

    // UI state
    selectedNodes: string[];
    leftSidebarOpen: boolean;
    rightSidebarOpen: boolean;

    // Execution state
    execution: ExecutionState;

    // Undo/redo
    history: HistoryEntry[];
    historyIndex: number;

    // Node actions
    setNodes: (nodes: WorkflowNode[]) => void;
    addNode: (node: WorkflowNode) => void;
    updateNodeData: (nodeId: string, data: Partial<WorkflowNode["data"]>) => void;
    onNodesChange: (changes: NodeChange[]) => void;
    deleteSelectedNodes: () => void;

    // Edge actions
    setEdges: (edges: WorkflowEdge[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;

    // Selection
    setSelectedNodes: (nodeIds: string[]) => void;

    // Sidebar toggles
    toggleLeftSidebar: () => void;
    toggleRightSidebar: () => void;

    // Workflow meta
    setWorkflowName: (name: string) => void;
    setWorkflowMeta: (meta: Partial<WorkflowMeta>) => void;

    // Load/clear workflow
    loadWorkflow: (nodes: WorkflowNode[], edges: WorkflowEdge[], meta: WorkflowMeta) => void;
    clearWorkflow: () => void;

    // Execution
    setExecutionRunning: (isRunning: boolean, runId?: string) => void;
    updateNodeExecution: (nodeId: string, result: Partial<NodeExecutionResult>) => void;
    clearExecution: () => void;

    // Undo/redo
    undo: () => void;
    redo: () => void;
    pushHistory: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
    nodes: [],
    edges: [],
    meta: { id: null, name: "Untitled Workflow", savedAt: null },
    selectedNodes: [],
    leftSidebarOpen: true,
    rightSidebarOpen: true,
    execution: { isRunning: false, runId: null, nodeResults: {} },
    history: [],
    historyIndex: -1,

    setNodes: (nodes) => set({ nodes }),

    addNode: (node) => {
        get().pushHistory();
        set((state) => ({ nodes: [...state.nodes, node] }));
    },

    updateNodeData: (nodeId, data) => {
        set((state) => ({
            nodes: state.nodes.map((node) =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, ...data } }
                    : node
            ),
        }));
    },

    onNodesChange: (changes) => {
        // Push history for deletions
        const hasDeletions = changes.some((c) => c.type === "remove");
        if (hasDeletions) get().pushHistory();

        set((state) => ({
            nodes: applyNodeChanges(changes, state.nodes) as WorkflowNode[],
        }));
    },

    deleteSelectedNodes: () => {
        const { selectedNodes, nodes, edges } = get();
        if (selectedNodes.length === 0) return;

        get().pushHistory();

        const newNodes = nodes.filter((n) => !selectedNodes.includes(n.id));
        const newEdges = edges.filter(
            (e) => !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)
        );

        set({ nodes: newNodes, edges: newEdges, selectedNodes: [] });
    },

    setEdges: (edges) => set({ edges }),

    onEdgesChange: (changes) => {
        const hasDeletions = changes.some((c) => c.type === "remove");
        if (hasDeletions) get().pushHistory();

        set((state) => ({
            edges: applyEdgeChanges(changes, state.edges),
        }));
    },

    onConnect: (connection) => {
        get().pushHistory();
        set((state) => ({
            edges: addEdge(
                { ...connection, animated: true, className: "animated-edge" },
                state.edges
            ),
        }));
    },

    setSelectedNodes: (nodeIds) => set({ selectedNodes: nodeIds }),

    toggleLeftSidebar: () =>
        set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),

    toggleRightSidebar: () =>
        set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),

    setWorkflowName: (name) =>
        set((state) => ({ meta: { ...state.meta, name } })),

    setWorkflowMeta: (meta) =>
        set((state) => ({ meta: { ...state.meta, ...meta } })),

    loadWorkflow: (nodes, edges, meta) => {
        set({
            nodes,
            edges,
            meta,
            history: [],
            historyIndex: -1,
            selectedNodes: [],
            execution: { isRunning: false, runId: null, nodeResults: {} },
        });
    },

    clearWorkflow: () => {
        set({
            nodes: [],
            edges: [],
            meta: { id: null, name: "Untitled Workflow", savedAt: null },
            history: [],
            historyIndex: -1,
            selectedNodes: [],
            execution: { isRunning: false, runId: null, nodeResults: {} },
        });
    },

    setExecutionRunning: (isRunning, runId) =>
        set((state) => ({
            execution: {
                ...state.execution,
                isRunning,
                runId: runId ?? state.execution.runId,
            },
        })),

    updateNodeExecution: (nodeId, result) =>
        set((state) => ({
            execution: {
                ...state.execution,
                nodeResults: {
                    ...state.execution.nodeResults,
                    [nodeId]: {
                        ...state.execution.nodeResults[nodeId],
                        nodeId,
                        ...result,
                    } as NodeExecutionResult,
                },
            },
        })),

    clearExecution: () =>
        set({ execution: { isRunning: false, runId: null, nodeResults: {} } }),

    pushHistory: () => {
        const { nodes, edges, history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });

        if (newHistory.length > MAX_HISTORY) {
            newHistory.shift();
        }

        set({ history: newHistory, historyIndex: newHistory.length - 1 });
    },

    undo: () => {
        const { historyIndex, history } = get();
        if (historyIndex < 0) return;

        const entry = history[historyIndex];
        set({
            nodes: entry.nodes,
            edges: entry.edges,
            historyIndex: historyIndex - 1,
        });
    },

    redo: () => {
        const { historyIndex, history } = get();
        if (historyIndex >= history.length - 1) return;

        const entry = history[historyIndex + 1];
        set({
            nodes: entry.nodes,
            edges: entry.edges,
            historyIndex: historyIndex + 1,
        });
    },
}));
