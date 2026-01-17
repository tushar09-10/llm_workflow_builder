import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-xl text-center">
        {/* Logo */}
        <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-2xl">W</span>
        </div>

        <h1 className="text-4xl font-bold mb-4">LLM Workflow Builder</h1>
        <p className="text-muted text-lg mb-8">
          Build visual DAG workflows to orchestrate LLM tasks,
          image processing, and video frame extraction.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/sign-in"
            className="px-6 py-3 bg-accent hover:bg-accent-dim rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-6 py-3 border border-border hover:border-accent rounded-lg font-medium transition-colors"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6 text-left">
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center mb-2">
              <span className="text-purple-400">✨</span>
            </div>
            <h3 className="font-medium mb-1">LLM Nodes</h3>
            <p className="text-sm text-muted">
              Run Gemini models with custom prompts
            </p>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center mb-2">
              <span className="text-green-400">🖼️</span>
            </div>
            <h3 className="font-medium mb-1">Image Processing</h3>
            <p className="text-sm text-muted">
              Upload and crop images with FFmpeg
            </p>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center mb-2">
              <span className="text-blue-400">🎬</span>
            </div>
            <h3 className="font-medium mb-1">Video Frames</h3>
            <p className="text-sm text-muted">
              Extract frames from video at any timestamp
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
