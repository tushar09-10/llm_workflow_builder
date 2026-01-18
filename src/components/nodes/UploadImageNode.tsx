import { memo, useRef, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Image, Upload, X, Loader2 } from "lucide-react";
import { UploadImageNodeData } from "@/lib/types";
import { useWorkflowStore } from "@/lib/store";

function UploadImageNode({ id, data, selected }: NodeProps<UploadImageNodeData>) {
    const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "image");

            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const result = await res.json();

            if (result.url) {
                updateNodeData(id, { imageUrl: result.url, fileName: file.name });
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

    const clearImage = () => {
        updateNodeData(id, { imageUrl: null, fileName: null });
    };

    return (
        <div
            className={`bg-card border rounded-lg p-3 min-w-[200px] transition-all ${selected ? "border-accent ring-2 ring-accent/30" : "border-border"
                }`}
        >
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-foreground">
                <Image size={14} className="text-green-400" />
                <span>Upload Image</span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                className="hidden"
                onChange={handleFileChange}
            />

            {!data.imageUrl ? (
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
                    <img
                        src={data.imageUrl}
                        alt={data.fileName || "Uploaded"}
                        className="w-full h-24 object-cover rounded"
                    />
                    <button
                        onClick={clearImage}
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
                id="image-out"
                className="!w-3 !h-3 !bg-green-400 !border-2 !border-background"
            />
        </div>
    );
}

export default memo(UploadImageNode);
