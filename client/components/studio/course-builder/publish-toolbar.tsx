"use client";

import { Send, Undo2, Loader2 } from "lucide-react";

export function PublishToolbar({
  selectedCount,
  draftCount,
  publishedCount,
  onPublish,
  onUnpublish,
  publishing,
}: {
  selectedCount: number;
  draftCount: number;
  publishedCount: number;
  onPublish: () => void;
  onUnpublish: () => void;
  publishing: boolean;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
      <span className="text-xs text-muted-foreground">
        {selectedCount} selected
      </span>

      <div className="flex-1" />

      {draftCount > 0 && (
        <button
          type="button"
          onClick={onPublish}
          disabled={publishing}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
        >
          {publishing ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Send className="size-3.5" />
          )}
          Publish {draftCount > 1 ? `(${draftCount})` : ""}
        </button>
      )}

      {publishedCount > 0 && (
        <button
          type="button"
          onClick={onUnpublish}
          disabled={publishing}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          {publishing ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Undo2 className="size-3.5" />
          )}
          Unpublish {publishedCount > 1 ? `(${publishedCount})` : ""}
        </button>
      )}
    </div>
  );
}
