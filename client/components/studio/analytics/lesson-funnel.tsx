"use client";

import type { StudioLessonFunnelItem } from "@/types/studio.types";

type LessonFunnelProps = {
  lessons: StudioLessonFunnelItem[];
};

function barClass(rate: number) {
  if (rate >= 70) return "bg-emerald-500";
  if (rate >= 30) return "bg-amber-500";
  return "bg-red-500";
}

export function LessonFunnel({ lessons }: LessonFunnelProps) {
  const groups: { chapterTitle: string; lessons: StudioLessonFunnelItem[] }[] = [];
  for (const lesson of lessons) {
    const last = groups[groups.length - 1];
    if (!last || last.chapterTitle !== lesson.chapterTitle) {
      groups.push({ chapterTitle: lesson.chapterTitle, lessons: [lesson] });
    } else {
      last.lessons.push(lesson);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Lesson funnel</h2>
        <span className="text-xs text-muted-foreground">
          Completion across published lessons
        </span>
      </div>

      {lessons.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Publish lessons to see completion drop-off.
        </p>
      ) : (
        <div className="mt-4 space-y-6">
          {groups.map((group) => (
            <div key={group.chapterTitle}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.chapterTitle}
              </p>
              <div className="mt-2.5 space-y-4">
                {group.lessons.map((lesson) => (
                  <div key={lesson.id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm">{lesson.title}</p>
                      <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {lesson.completed} · {lesson.completionRate}%
                      </p>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${barClass(lesson.completionRate)}`}
                        style={{ width: `${lesson.completionRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
