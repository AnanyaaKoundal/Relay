"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, CheckCircle2, Loader2, Pencil } from "lucide-react";

type UploadStatus = "idle" | "uploading" | "done";

export function VideoUploader({
  file,
  status,
  progress,
  onFileSelect,
}: {
  file: File | null;
  status: UploadStatus;
  progress: number;
  onFileSelect: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  }

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">Video File</label>
      <div
        onClick={() => status === "idle" && fileRef.current?.click()}
        className={`mt-1.5 rounded-xl border-2 border-dashed overflow-hidden transition-all ${
          status === "idle" && !file
            ? "cursor-pointer hover:border-primary/40 hover:bg-primary/5 p-8 flex flex-col items-center justify-center"
            : ""
        }`}
      >
        {status === "uploading" && file ? (
          <div className="p-6 space-y-3">
            <div className="flex items-center gap-2 justify-center">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {file.name} · {formatSize(file.size)}
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">{progress}%</p>
          </div>
        ) : file && previewUrl ? (
          <div className="relative group">
            <video src={previewUrl} className="w-full max-h-48 object-contain bg-black/5" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <Pencil className="size-4" />
                Click to change
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <span className="text-sm truncate flex-1">{file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">{formatSize(file.size)}</span>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <Upload className="size-8 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Click to select a video
            </p>
            <p className="text-xs text-muted-foreground/60">
              MP4, WebM, or MOV up to 2GB
            </p>
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

/* ─── Duration Detection Hook ─── */

export function useVideoDuration(file: File | null): number | null {
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    if (!file) {
      setDuration(null);
      return;
    }

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      setDuration(Math.round(video.duration));
      URL.revokeObjectURL(url);
    };

    video.onerror = () => {
      setDuration(null);
      URL.revokeObjectURL(url);
    };

    video.src = url;
  }, [file]);

  return duration;
}
