import { WorkflowNode, WorkflowEdge, RunScope } from "./types";
import { useWorkflowStore } from "./store";

/**
 * Execute workflow nodes in topological order
 * Independent branches run in parallel, convergence nodes wait for all upstream
 */
export async function executeWorkflow(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    scope: RunScope
): Promise<void> {
    const store = useWorkflowStore.getState();
    const meta = store.meta;

    // Start the execution run
    const runRes = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            workflowId: meta.id,
            scope,
            nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data })),
            edges: edges.map((e) => ({ source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle })),
        }),
    });

    const { runId } = await runRes.json();
    store.setExecutionRunning(true, runId);

    // Build dependency graph
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const inDegree = new Map<string, number>();
    const dependents = new Map<string, string[]>();

    for (const node of nodes) {
        inDegree.set(node.id, 0);
        dependents.set(node.id, []);
    }

    for (const edge of edges) {
        if (nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
            inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
            dependents.get(edge.source)?.push(edge.target);
        }
    }

    // Find starting nodes (no dependencies)
    const ready = nodes.filter((n) => inDegree.get(n.id) === 0).map((n) => n.id);

    // Results storage
    const results = new Map<string, unknown>();

    // Mark all nodes as pending
    for (const node of nodes) {
        store.updateNodeExecution(node.id, { status: "pending" });
    }

    // Execute nodes
    const executing = new Set<string>();
    let hasError = false;

    const executeNode = async (nodeId: string) => {
        const node = nodeMap.get(nodeId);
        if (!node) return;

        executing.add(nodeId);
        store.updateNodeExecution(nodeId, { status: "running", startedAt: new Date() });

        try {
            // Gather inputs from upstream nodes
            const inputs: Record<string, unknown> = {};
            for (const edge of edges) {
                if (edge.target === nodeId) {
                    const sourceResult = results.get(edge.source);
                    if (edge.targetHandle) {
                        inputs[edge.targetHandle] = sourceResult;
                    }
                }
            }

            // Execute via API (which uses Trigger.dev)
            const execRes = await fetch("/api/execute/node", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    runId,
                    nodeId,
                    nodeType: node.type,
                    nodeData: node.data,
                    inputs,
                }),
            });

            const execData = await execRes.json();

            if (execData.error) {
                throw new Error(execData.error);
            }

            // Store result
            results.set(nodeId, execData.output);

            // Update node data with result (for display)
            if (node.type === "llmNode" && execData.output) {
                store.updateNodeData(nodeId, { result: execData.output });
            }
            if ((node.type === "cropImageNode" || node.type === "extractFrameNode") && execData.output) {
                store.updateNodeData(nodeId, { resultUrl: execData.output });
            }

            store.updateNodeExecution(nodeId, {
                status: "success",
                outputs: { result: execData.output },
                endedAt: new Date(),
            });
        } catch (err) {
            hasError = true;
            store.updateNodeExecution(nodeId, {
                status: "failed",
                error: (err as Error).message,
                endedAt: new Date(),
            });
        }

        executing.delete(nodeId);

        // Check dependents
        const deps = dependents.get(nodeId) || [];
        for (const depId of deps) {
            const newInDegree = (inDegree.get(depId) || 1) - 1;
            inDegree.set(depId, newInDegree);
            if (newInDegree === 0 && !hasError) {
                ready.push(depId);
            }
        }
    };

    // Process ready queue
    while (ready.length > 0 || executing.size > 0) {
        // Start all ready nodes (parallel execution)
        const batch = [...ready];
        ready.length = 0;

        const promises = batch.map((nodeId) => executeNode(nodeId));
        await Promise.all(promises);

        // Small delay to avoid tight loop
        if (ready.length === 0 && executing.size > 0) {
            await new Promise((r) => setTimeout(r, 100));
        }
    }

    // Mark execution complete
    await fetch(`/api/execute/${runId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: hasError ? "failed" : "success" }),
    });

    store.setExecutionRunning(false);
}
