// Trigger.dev task definitions
// These would be executed via Trigger.dev in production

export interface LLMTaskInput {
    model: string;
    systemPrompt?: string;
    userMessage: string;
    imageUrls?: string[];
}

export interface CropTaskInput {
    imageUrl: string;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
}

export interface ExtractFrameInput {
    videoUrl: string;
    timestamp: string;
}

// Mock task runner for local dev
// In production, these would use Trigger.dev's task() function
export async function runLLMTask(input: LLMTaskInput): Promise<string> {
    // This would be wrapped in trigger.dev's task()
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

    const model = genAI.getGenerativeModel({ model: input.model });

    let prompt = "";
    if (input.systemPrompt) {
        prompt += `System: ${input.systemPrompt}\n\n`;
    }
    prompt += input.userMessage;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

export async function runCropTask(input: CropTaskInput): Promise<string> {
    // In production: FFmpeg crop via Trigger.dev + Transloadit
    // For now, return the input URL
    console.log("Would crop image:", input);
    return input.imageUrl;
}

export async function runExtractFrameTask(input: ExtractFrameInput): Promise<string> {
    // In production: FFmpeg extract frame via Trigger.dev + Transloadit
    // For now, return placeholder
    console.log("Would extract frame:", input);
    return input.videoUrl;
}
