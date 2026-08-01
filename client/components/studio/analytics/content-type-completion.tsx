"use client";

import type { StudioContentTypeStat } from "@/types/studio.types";

const TYPE_LABELS: Record<string, string> = {
  VIDEO: "Video",
  TEXT: "Text",
  QUIZ: "Quiz",
};

const TYPE_COLORS: Record<string, string> = {
  VIDEO: "bg-chart-1",
  TEXT: "bg-chart-4",
  QUIZ: "bg-chart-2",
};

type ContentTypeCompletionProps = {
  stats: StudioContentTypeStat[];
};

export function ContentTypeCompletion({ stats }: ContentTypeCompletionProps) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">By content type</h2>
        <span className="text-xs text-muted-foreground">Avg lesson completion</span>
      </div>

      {stats.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No published lessons yet.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {stats.map((stat) => (
            <div key={stat.type}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">
                  {TYPE_LABELS[stat.type] ?? stat.type}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {stat.rate}% · {stat.lessons} lesson{stat.lessons !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${TYPE_COLORS[stat.type] ?? "bg-chart-1"}`}
                  style={{ width: `${Math.min(100, stat.rate)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
