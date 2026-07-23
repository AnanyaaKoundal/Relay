"use client";

import { useState } from "react";
import { GripVertical, Eye, Lock, Pencil, Trash2, Check, Loader2, AlertCircle } from "lucide-react";
import type { Lesson, QuizContent } from "./types";
import { lessonTypeConfig, formatDuration } from "./types";

export function LessonRow({
  lesson,
  onUpdate,
  onDelete,
  onTogglePreview,
  onOpenEditor,
  selected,
  onToggleSelect,
}: {
  lesson: Lesson;
  onUpdate: (title: string) => void;
  onDelete: () => void;
  onTogglePreview: () => void;
  onOpenEditor: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const typeInfo = lessonTypeConfig[lesson.contentType];
  const TypeIcon = typeInfo.icon;

  const hasContent = lesson.content !== null;
  const isProcessing = lesson.processingStatus === "PROCESSING";
  const isPending = lesson.processingStatus === "PENDING";
  const isFailed = lesson.processingStatus === "FAILED";
  const isReady = lesson.processingStatus === "COMPLETED";

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(title.trim());
      setEditing(false);
    }
  };

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      {onToggleSelect && (
        <button
          type="button"
          onClick={onToggleSelect}
          className={`shrink-0 size-4 rounded border flex items-center justify-center transition-colors ${
            selected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/30 hover:border-muted-foreground/60"
          }`}
        >
          {selected && <Check className="size-2.5" />}
        </button>
      )}

      <div className="hidden sm:flex size-6 items-center justify-center text-muted-foreground/30 group-hover:text-muted-foreground cursor-grab transition-colors">
        <GripVertical className="size-3.5" />
      </div>

      <TypeIcon className={`size-4 shrink-0 ${typeInfo.color}`} />

      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setTitle(lesson.title);
              setEditing(false);
            }
          }}
          onBlur={handleSave}
          className="flex-1 h-6 rounded border border-input bg-background px-2 text-sm outline-none focus:border-primary"
        />
      ) : (
        <button
          type="button"
          onClick={onOpenEditor}
          className="flex-1 text-left text-sm truncate hover:text-primary transition-colors"
        >
          {lesson.title}
          {!hasContent && (
            <span className="ml-2 text-[10px] text-muted-foreground/60">(click to edit)</span>
          )}
        </button>
      )}

      {/* Status badge */}
      <span
        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
          lesson.status === "PUBLISHED"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700"
        }`}
      >
        {lesson.status === "PUBLISHED" ? "Published" : "Draft"}
      </span>

      {/* Video processing indicator */}
      {lesson.contentType === "VIDEO" && (
        <span
          className="shrink-0 inline-flex items-center gap-0.5 text-[10px]"
          title={
            isProcessing
              ? "Transcoding..."
              : isPending
              ? "Queued for processing"
              : isFailed
              ? "Processing failed"
              : isReady
              ? "Ready"
              : hasContent
              ? "Ready"
              : "No video"
          }
        >
          {isProcessing ? (
            <Loader2 className="size-3 text-blue-500 animate-spin" />
          ) : isPending ? (
            <Loader2 className="size-3 text-muted-foreground/50 animate-spin" />
          ) : isFailed ? (
            <AlertCircle className="size-3 text-red-500" />
          ) : isReady || hasContent ? (
            <Check className="size-3 text-emerald-500" />
          ) : null}
        </span>
      )}

      <span className="text-xs text-muted-foreground shrink-0">
        {lesson.contentType === "VIDEO" && lesson.durationSeconds
          ? formatDuration(lesson.durationSeconds)
          : lesson.contentType === "QUIZ" && lesson.content && "questions" in lesson.content
          ? `${(lesson.content as QuizContent).questions.length} Q`
          : "—"}
      </span>

      <button
        type="button"
        onClick={onTogglePreview}
        className={`shrink-0 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
          lesson.isPreview
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground/50 hover:text-muted-foreground"
        }`}
        title={lesson.isPreview ? "Free preview" : "Locked"}
      >
        {lesson.isPreview ? <Eye className="size-3" /> : <Lock className="size-3" />}
        <span className="hidden sm:inline">{lesson.isPreview ? "Preview" : "Locked"}</span>
      </button>

      <button
        type="button"
        onClick={onOpenEditor}
        className="shrink-0 size-6 flex items-center justify-center rounded text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
        title="Edit content"
      >
        <Pencil className="size-3" />
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 size-6 flex items-center justify-center rounded text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="size-3" />
      </button>
    </div>
  );
}
