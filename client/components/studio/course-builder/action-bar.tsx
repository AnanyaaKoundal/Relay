"use client";

import Link from "next/link";
import {
    Send,
    ArrowLeft,
    Loader2,
    Undo2,
} from "lucide-react";

export function ActionBar({
    courseStatus,
    totalDraftCount,
    publishing,
    onPublishAllChanges,
    onDiscardDraft,
    onPublishCourse,
}: {
    courseStatus: string;
    totalDraftCount: number;
    publishing: boolean;
    onPublishAllChanges: () => void;
    onDiscardDraft: () => void;
    onPublishCourse: () => void;
}) {


    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Link
                    href="/studio/courses"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="size-4" />
                </Link>
                <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${courseStatus === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : courseStatus === "DRAFT"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                >
                    {courseStatus === "PENDING_APPROVAL"
                        ? "Pending"
                        : courseStatus.charAt(0) + courseStatus.slice(1).toLowerCase()}
                </span>
            </div>

            <div className="flex items-center gap-2">
                {courseStatus === "PUBLISHED" && totalDraftCount > 0 && (
                    <button
                        type="button"
                        onClick={onPublishAllChanges}
                        disabled={publishing}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
                    >
                        {publishing ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                        Publish All ({totalDraftCount})
                    </button>
                )}
                {courseStatus === "PUBLISHED" && (
                    <button
                        type="button"
                        onClick={onDiscardDraft}
                        disabled={publishing}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        <Undo2 className="size-3.5" />
                        Revert to Draft
                    </button>
                )}
                {courseStatus !== "PUBLISHED" && (
                    <button
                        type="button"
                        onClick={onPublishCourse}
                        disabled={publishing}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
                    >
                        {publishing ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                        Publish
                    </button>
                )}
            </div>
        </div>
    )
}