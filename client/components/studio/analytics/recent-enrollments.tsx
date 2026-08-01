"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import type { StudioRecentEnrollment } from "@/types/studio.types";

type RecentEnrollmentsProps = {
  enrollments: StudioRecentEnrollment[];
};

export function RecentEnrollments({ enrollments }: RecentEnrollmentsProps) {
  if (enrollments.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-medium">Recent enrollments</h2>
        <p className="py-8 text-center text-sm text-muted-foreground">
          No enrollments yet. Share your course to get students.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Recent enrollments</h2>
        <span className="text-xs text-muted-foreground">Latest students</span>
      </div>

      <div className="mt-2 divide-y">
        {enrollments.map((enrollment) => (
          <div
            key={enrollment.id}
            className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {enrollment.studentName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">
                  {enrollment.studentName}
                </p>
                <StatusBadge status={enrollment.status} />
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-1"
                    style={{ width: `${enrollment.progressPercent}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {enrollment.progressPercent}% complete
                </span>
              </div>
            </div>

            <span className="shrink-0 text-xs text-muted-foreground">
              {new Date(enrollment.enrolledAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
