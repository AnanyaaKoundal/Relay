"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";

type CourseNavBarProps = {
  courseTitle: string;
  courseSlug: string;
  progressPercent: number;
  isCompleting: boolean;
  isCompleted: boolean;
  onMarkComplete: () => void;
};

export function CourseNavBar({
  courseTitle,
  courseSlug,
  progressPercent,
  isCompleting,
  isCompleted,
  onMarkComplete,
}: CourseNavBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
      <Link
        href={`/courses/${courseSlug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <ArrowLeft className="size-4" />
        <span className="hidden sm:inline">Back</span>
      </Link>

      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold truncate">{courseTitle}</h1>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {progressPercent}%
          </span>
        </div>

        <button
          type="button"
          onClick={onMarkComplete}
          disabled={isCompleting || isCompleted}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors disabled:opacity-50 ${
            isCompleted
              ? "bg-emerald-100 text-emerald-700 cursor-default"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isCompleting ? (
            <Spinner size="3.5" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
          {isCompleted ? "Completed" : "Mark Complete"}
        </button>
      </div>
    </header>
  );
}
