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
import { Video, Clock, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { VideoUploader, useVideoDuration } from "@/components/studio/video-uploader";
import { presignUpload, completeUpload, uploadFileWithProgress } from "@/services/upload.service";
import { retryTranscode } from "@/services/lesson.service";
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
  onRetry,
  initial,
  lessonTitle,
  lessonId,
  processingStatus,
  isLoading,
  onResolveLessonId,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: VideoContent, title: string) => void | Promise<void>;
  onRetry?: (lessonId: string) => void | Promise<void>;
  initial: VideoContent;
  lessonTitle: string;
  lessonId: string;
  processingStatus?: string;
  isLoading?: boolean;
  onResolveLessonId?: () => Promise<string>;
}) {
  const [title, setTitle] = useState(lessonTitle);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const autoDuration = useVideoDuration(file);

  const isFailed = processingStatus === "FAILED";

  const hasExistingVideo = !!initial.videoUrl;
  const canSave = hasExistingVideo || (file && uploadStatus === "idle");
  const isUploading = uploadStatus === "uploading";
  const showLoading = isLoading && uploadStatus === "idle";

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
      setUploadStatus("done");
      onSave(
        { videoUrl: `${API_URL}/s3/${fileKey}`, durationSeconds: autoDuration, resources: [] },
        title.trim() || lessonTitle,
      );
      onClose();
      completeUpload(realId, fileKey).catch(() => {});
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed")
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

  async function handleRetry() {
    setSaving(true);
    try {
      if (onRetry) {
        await onRetry(lessonId);
      } else {
        await retryTranscode(lessonId);
      }
      onClose();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="size-4 text-blue-500" />
            {showLoading ? "Loading..." : hasExistingVideo ? "Edit Video Lesson" : "New Video Lesson"}
          </DialogTitle>
        </DialogHeader>

        {showLoading ? (
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
            {isFailed && !uploadError && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">Transcoding failed</p>
                  <p className="mt-0.5 text-red-600">The video could not be processed. Click "Retry Transcoding" to try again.</p>
                </div>
              </div>
            )}
            {uploadError && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">Upload failed</p>
                  <p className="mt-0.5 text-red-600">{uploadError}</p>
                </div>
              </div>
            )}
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
          <Button variant="outline" onClick={onClose} disabled={isUploading || saving}>
            Cancel
          </Button>
          {!showLoading && (isFailed ? (
            <Button variant="destructive" onClick={handleRetry} disabled={saving}>
              {saving ? (
                <>
                  <Spinner />
                  Retrying...
                </>
              ) : (
                "Retry Transcoding"
              )}
            </Button>
          ) : hasExistingVideo ? (
            <Button onClick={handleSave}>Save</Button>
          ) : (
            <Button onClick={handleUploadAndSave} disabled={!canSave || isUploading || saving}>
              {isUploading ? (
                <>
                  <Spinner />
                  Uploading...
                </>
              ) : (
                uploadError ? "Retry Upload" : "Upload & Save"
              )}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
