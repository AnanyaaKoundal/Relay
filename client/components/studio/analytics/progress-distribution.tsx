"use client";

import type { StudioProgressBucket } from "@/types/studio.types";

const BUCKET_LABELS: Record<string, string> = {
  "0-25": "0–25%",
  "25-50": "25–50%",
  "50-75": "50–75%",
  "75-100": "75–100%",
};

const BUCKET_COLORS: Record<string, string> = {
  "0-25": "bg-red-500",
  "25-50": "bg-amber-500",
  "50-75": "bg-chart-1",
  "75-100": "bg-emerald-500",
};

type ProgressDistributionProps = {
  buckets: StudioProgressBucket[];
};

export function ProgressDistribution({ buckets }: ProgressDistributionProps) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Student progress</h2>
        <span className="text-xs text-muted-foreground">Where learners stall</span>
      </div>

      {total === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No enrollments yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3.5">
          {buckets.map((bucket) => (
            <div key={bucket.bucket}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {BUCKET_LABELS[bucket.bucket] ?? bucket.bucket}
                </span>
                <span className="tabular-nums text-muted-foreground">{bucket.count}</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${BUCKET_COLORS[bucket.bucket] ?? "bg-chart-1"}`}
                  style={{ width: `${Math.max(2, (bucket.count / total) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
