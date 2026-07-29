"use client";

import Link from "next/link";
import { ArrowLeft, Send, Undo2, Settings } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { StatusBadge } from "@/components/shared/status-badge";

export function ActionBar({
    courseId,
    courseStatus,
    totalDraftCount,
    publishing,
    onPublishAllChanges,
    onDiscardDraft,
    onPublishCourse,
}: {
    courseId: string;
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
            </div>

            <div className="flex items-center gap-2">
                {courseStatus === "PUBLISHED" && totalDraftCount > 0 && (
                    <button
                        type="button"
                        onClick={onPublishAllChanges}
                        disabled={publishing}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
                    >
                        {publishing ? <Spinner size="3.5" /> : <Send className="size-3.5" />}
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
                        {publishing ? <Spinner size="3.5" /> : <Send className="size-3.5" />}
                        Publish
                    </button>
                )}
                <Link
                    href={`/studio/courses/${courseId}/settings`}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Course Settings"
                >
                    <Settings className="size-4" />
                </Link>
            </div>
        </div>
    )
}
