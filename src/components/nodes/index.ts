import TextNode from "./TextNode";
import UploadImageNode from "./UploadImageNode";
import UploadVideoNode from "./UploadVideoNode";
import LLMNode from "./LLMNode";
import CropImageNode from "./CropImageNode";
import ExtractFrameNode from "./ExtractFrameNode";

export const nodeTypes = {
    textNode: TextNode,
    uploadImageNode: UploadImageNode,
    uploadVideoNode: UploadVideoNode,
    llmNode: LLMNode,
    cropImageNode: CropImageNode,
    extractFrameNode: ExtractFrameNode,
};

// Node definitions for the sidebar
export const nodeDefinitions = [
    {
        type: "textNode",
        label: "Text",
        icon: "Type",
        color: "text-accent",
        description: "Simple text input",
        defaultData: { text: "" },
    },
    {
        type: "uploadImageNode",
        label: "Upload Image",
        icon: "Image",
        color: "text-green-400",
        description: "Upload an image file",
        defaultData: { imageUrl: null, fileName: null },
    },
    {
        type: "uploadVideoNode",
        label: "Upload Video",
        icon: "Video",
        color: "text-blue-400",
        description: "Upload a video file",
        defaultData: { videoUrl: null, fileName: null },
    },
    {
        type: "llmNode",
        label: "Run LLM",
        icon: "Sparkles",
        color: "text-purple-400",
        description: "Run Gemini model",
        defaultData: { model: "gemini-2.0-flash", systemPrompt: "", userMessage: "", result: null, isRunning: false },
    },
    {
        type: "cropImageNode",
        label: "Crop Image",
        icon: "Crop",
        color: "text-orange-400",
        description: "Crop image via FFmpeg",
        defaultData: { xPercent: 0, yPercent: 0, widthPercent: 100, heightPercent: 100, resultUrl: null },
    },
    {
        type: "extractFrameNode",
        label: "Extract Frame",
        icon: "Film",
        color: "text-cyan-400",
        description: "Extract frame from video",
        defaultData: { timestamp: "0", resultUrl: null },
    },
] as const;

// Connection validation - what can connect to what
export const connectionRules: Record<string, { accepts: string[]; outputs: string }> = {
    textNode: { accepts: [], outputs: "text" },
    uploadImageNode: { accepts: [], outputs: "image" },
    uploadVideoNode: { accepts: [], outputs: "video" },
    llmNode: { accepts: ["text", "image"], outputs: "text" },
    cropImageNode: { accepts: ["image"], outputs: "image" },
    extractFrameNode: { accepts: ["video"], outputs: "image" },
};

// Handle type mapping
export const handleTypes: Record<string, string> = {
    "text-out": "text",
    "image-out": "image",
    "video-out": "video",
    "system-in": "text",
    "user-in": "text",
    "images-in": "image",
    "image-in": "image",
    "video-in": "video",
};
