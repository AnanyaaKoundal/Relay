"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Clock } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { VideoUploader, useVideoDuration } from "@/components/studio/video-uploader";
import { presignUpload, completeUpload, uploadFileWithProgress } from "@/services/upload.service";
import { resolveUrl } from "@/lib/utils";
import { API_URL } from "@/lib/config";
import type { VideoContent } from "@/types/lesson.types";

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function VideoLessonEditor({
  open,
  onClose,
  onSave,
  initial,
  lessonTitle,
  lessonId,
  isLoading,
  onResolveLessonId,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: VideoContent, title: string) => void | Promise<void>;
  initial: VideoContent;
  lessonTitle: string;
  lessonId: string;
  isLoading?: boolean;
  onResolveLessonId?: () => Promise<string>;
}) {
  const [title, setTitle] = useState(lessonTitle);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const autoDuration = useVideoDuration(file);

  const hasExistingVideo = !!initial.videoUrl;
  const canSave = hasExistingVideo || (file && uploadStatus === "idle");
  const isUploading = uploadStatus === "uploading";

  function handleFileSelect(f: File) {
    setFile(f);
    setUploadStatus("idle");
    setUploadProgress(0);
    if (!title || title === lessonTitle) {
      setTitle(f.name.replace(/\.[^.]+$/, ""));
    }
  }

  async function handleUploadAndSave() {
    if (!file || saving) return;
    setSaving(true);
    try {
      setUploadStatus("uploading");
      setUploadProgress(0);

      const realId = onResolveLessonId ? await onResolveLessonId() : lessonId;
      const { uploadUrl, fileKey } = await presignUpload(file.name, file.type, realId);
      await uploadFileWithProgress(API_URL, uploadUrl, file, setUploadProgress);
      await completeUpload(realId, fileKey);

      setUploadStatus("done");
      await onSave(
        { videoUrl: `${API_URL}/s3/${fileKey}`, durationSeconds: autoDuration, resources: [] },
        title.trim() || lessonTitle,
      );
      onClose();
    } catch {
      setUploadStatus("idle");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    await onSave(
      { videoUrl: initial.videoUrl, durationSeconds: initial.durationSeconds, resources: [] },
      title.trim() || lessonTitle,
    );
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="size-4 text-blue-500" />
            {isLoading ? "Loading..." : hasExistingVideo ? "Edit Video Lesson" : "New Video Lesson"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
            <Spinner />
            Loading content...
          </div>
        ) : (
        <div className="space-y-5 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Lesson Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              placeholder="e.g. Introduction to React Hooks"
            />
          </div>

          {hasExistingVideo ? (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Video</label>
              <div className="mt-1.5 rounded-xl overflow-hidden bg-black/5">
                <video src={resolveUrl(initial.videoUrl) ?? ""} controls className="w-full max-h-48" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Video cannot be replaced. Delete this lesson and create a new one to upload a different video.
              </p>
            </div>
          ) : (
            <VideoUploader
              file={file}
              status={uploadStatus}
              progress={uploadProgress}
              onFileSelect={handleFileSelect}
            />
          )}

          {!hasExistingVideo && autoDuration != null && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3" />
              Duration: {formatDuration(autoDuration)}
            </div>
          )}
          {hasExistingVideo && initial.durationSeconds != null && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3" />
              Duration: {formatDuration(initial.durationSeconds)}
            </div>
          )}
        </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          {!isLoading && (hasExistingVideo ? (
            <Button onClick={handleSave}>Save</Button>
          ) : (
            <Button onClick={handleUploadAndSave} disabled={!canSave || isUploading || saving}>
              {isUploading ? (
                <>
<Spinner />
                   Uploading...
                </>
              ) : (
                "Upload & Save"
              )}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
