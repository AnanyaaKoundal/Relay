"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { StudioAttention } from "@/types/studio.types";

type AttentionCardProps = {
  attention: StudioAttention;
};

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m ago`;
  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AttentionCard({ attention }: AttentionCardProps) {
  const total =
    attention.drafts +
    attention.pendingApproval +
    attention.rejected +
    attention.unpublishedLessons;

  const draftCourses = attention.courses.filter((c) => c.category === "draft");
  const unpublishedCourses = attention.courses.filter((c) => c.category === "unpublished");

  if (total === 0) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-medium">Needs attention</h2>
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">All caught up</p>
          <Link
            href="/studio/courses/new"
            className="mt-1 inline-block text-xs font-medium text-primary transition-colors hover:underline"
          >
            Create a new course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Needs attention</h2>
        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
          {total} course{total !== 1 ? "s" : ""} need work
        </span>
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-center">
        {draftCourses.length > 0 && (
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="size-2 rounded-full bg-amber-500" />
              Draft
            </h3>
            <div className="mt-1.5 space-y-1">
              {draftCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/studio/courses/${course.id}/edit`}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {course.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    Edited {timeAgo(course.updatedAt)}
                  </span>
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {unpublishedCourses.length > 0 && (
          <section className={draftCourses.length > 0 ? "mt-5" : ""}>
            <h3 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="size-2 rounded-full bg-violet-500" />
              Unpublished changes
            </h3>
            <div className="mt-1.5 space-y-1">
              {unpublishedCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/studio/courses/${course.id}/edit`}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {course.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {course.draftLessonCount} lesson
                    {course.draftLessonCount !== 1 ? "s" : ""} unpublished
                  </span>
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Link
        href="/studio/courses"
        className="mt-5 flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
      >
        Manage all courses
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
