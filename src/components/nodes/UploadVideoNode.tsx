import { memo, useRef, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Video, Upload, X, Loader2 } from "lucide-react";
import { UploadVideoNodeData } from "@/lib/types";
import { useWorkflowStore } from "@/lib/store";

function UploadVideoNode({ id, data, selected }: NodeProps<UploadVideoNodeData>) {
    const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "video");

            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const result = await res.json();

            if (result.url) {
                updateNodeData(id, { videoUrl: result.url, fileName: file.name });
            }
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    };

    const clearVideo = () => {
        updateNodeData(id, { videoUrl: null, fileName: null });
    };

    return (
        <div
            className={`bg-card border rounded-lg p-3 min-w-[200px] transition-all ${selected ? "border-accent ring-2 ring-accent/30" : "border-border"
                }`}
        >
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-foreground">
                <Video size={14} className="text-blue-400" />
                <span>Upload Video</span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".mp4,.mov,.webm,.m4v"
                className="hidden"
                onChange={handleFileChange}
            />

            {!data.videoUrl ? (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-24 border-2 border-dashed border-border rounded flex flex-col items-center justify-center gap-1 text-muted hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                >
                    {uploading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <>
                            <Upload size={20} />
                            <span className="text-xs">Click to upload</span>
                        </>
                    )}
                </button>
            ) : (
                <div className="relative">
                    <video
                        src={data.videoUrl}
                        className="w-full h-24 object-cover rounded"
                        muted
                    />
                    <button
                        onClick={clearVideo}
                        className="absolute top-1 right-1 bg-background/80 rounded p-0.5 hover:bg-error/20"
                    >
                        <X size={14} className="text-error" />
                    </button>
                    <p className="text-xs text-muted mt-1 truncate">{data.fileName}</p>
                </div>
            )}

            <Handle
                type="source"
                position={Position.Right}
                id="video-out"
                className="!w-3 !h-3 !bg-blue-400 !border-2 !border-background"
            />
        </div>
    );
}

export default memo(UploadVideoNode);
