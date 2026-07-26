"use client";

import {
    Save,
    Settings,
    Check,
} from "lucide-react";
import { Chapter } from "./types";

export function CourseDetailsForm({
    price,
    difficulty,
    title,
    setTitle,
    description,
    setDescription,
    chapters,
    totalLessons,
    totalDraftCount,
    saved,
    saving,
    onSave,
}: {
    price: number,
    difficulty: string | null,
    title: string,
    setTitle: (v: string) => void,
    description: string,
    setDescription: (v: string) => void,
    chapters: Chapter[],
    totalLessons: number,
    totalDraftCount: number,
    saved: boolean,
    saving: boolean,
    onSave: () => void
}) {

    return (
        <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Settings className="size-3.5" />
                    <span className="font-medium">Course Details</span>
                </div>
                <div className="flex items-center gap-2">
                    {saved && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 animate-in fade-in">
                            <Check className="size-3" />
                            Saved
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saving}
                        className="inline-flex h-7 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        <Save className="size-3.5" />
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
            <div>
                <label htmlFor="course-title" className="text-xs text-muted-foreground font-medium">
                    Title
                </label>
                <input
                    id="course-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    placeholder="Course title"
                />
            </div>
            <div>
                <label htmlFor="course-desc" className="text-xs text-muted-foreground font-medium">
                    Description
                </label>
                <textarea
                    id="course-desc"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
                    placeholder="What will students learn in this course?"
                />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span>{chapters.length} chapters</span>
                <span>{totalLessons} lessons</span>
                {totalDraftCount > 0 && (
                    <span className="text-amber-600">{totalDraftCount} draft{totalDraftCount !== 1 ? "s" : ""}</span>
                )}
                <span>${Number(price).toFixed(2)}</span>
                <span>{difficulty ?? "N/A"}</span>
            </div>
        </div>
    )
}