import { WorkflowNode, WorkflowEdge } from "./types";

/**
 * Sample workflow: Product Marketing Kit Generator
 * 
 * Branch A (parallel):
 * - Upload Image → Crop Image → Text (System) → Text (Product) → LLM #1
 * 
 * Branch B (parallel):
 * - Upload Video → Extract Frame
 * 
 * Convergence:
 * - LLM #2 waits for both branches
 */
export function createSampleWorkflow(): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
    const nodes: WorkflowNode[] = [
        // Branch A
        {
            id: "upload-image-1",
            type: "uploadImageNode",
            position: { x: 50, y: 50 },
            data: { imageUrl: null, fileName: null },
        },
        {
            id: "crop-image-1",
            type: "cropImageNode",
            position: { x: 300, y: 50 },
            data: { xPercent: 10, yPercent: 10, widthPercent: 80, heightPercent: 80, resultUrl: null },
        },
        {
            id: "text-system",
            type: "textNode",
            position: { x: 50, y: 250 },
            data: { text: "You are a creative marketing copywriter. Write compelling, engaging content." },
        },
        {
            id: "text-product",
            type: "textNode",
            position: { x: 50, y: 400 },
            data: { text: "Product: Premium Wireless Headphones\nFeatures: Active noise cancellation, 40-hour battery, premium audio" },
        },
        {
            id: "llm-1",
            type: "llmNode",
            position: { x: 550, y: 200 },
            data: {
                model: "gemini-2.0-flash",
                systemPrompt: "",
                userMessage: "Generate a short, punchy product description (2-3 sentences) for the product details provided.",
                result: null,
                isRunning: false,
            },
        },

        // Branch B
        {
            id: "upload-video-1",
            type: "uploadVideoNode",
            position: { x: 50, y: 550 },
            data: { videoUrl: null, fileName: null },
        },
        {
            id: "extract-frame-1",
            type: "extractFrameNode",
            position: { x: 300, y: 550 },
            data: { timestamp: "50%", resultUrl: null },
        },

        // Convergence - LLM #2
        {
            id: "llm-2",
            type: "llmNode",
            position: { x: 850, y: 350 },
            data: {
                model: "gemini-2.0-flash",
                systemPrompt: "",
                userMessage: "Using the product description provided, create a social media marketing post. Include relevant emojis and hashtags.",
                result: null,
                isRunning: false,
            },
        },
    ];

    const edges: WorkflowEdge[] = [
        // Branch A
        {
            id: "e-upload-crop",
            source: "upload-image-1",
            target: "crop-image-1",
            sourceHandle: "image-out",
            targetHandle: "image-in",
            animated: true,
        },
        {
            id: "e-system-llm1",
            source: "text-system",
            target: "llm-1",
            sourceHandle: "text-out",
            targetHandle: "system-in",
            animated: true,
        },
        {
            id: "e-product-llm1",
            source: "text-product",
            target: "llm-1",
            sourceHandle: "text-out",
            targetHandle: "user-in",
            animated: true,
        },
        {
            id: "e-crop-llm2",
            source: "crop-image-1",
            target: "llm-2",
            sourceHandle: "image-out",
            targetHandle: "images-in",
            animated: true,
        },

        // Branch B
        {
            id: "e-video-extract",
            source: "upload-video-1",
            target: "extract-frame-1",
            sourceHandle: "video-out",
            targetHandle: "video-in",
            animated: true,
        },

        // Convergence
        {
            id: "e-llm1-llm2",
            source: "llm-1",
            target: "llm-2",
            sourceHandle: "text-out",
            targetHandle: "user-in",
            animated: true,
        },
    ];

    return { nodes, edges };
}
