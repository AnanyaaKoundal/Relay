"use client";

import Link from "next/link";
import { BadgeCheck, UserPlus } from "lucide-react";
import { formatINR } from "@/lib/studio-utils";
import type { StudioActivityItem } from "@/types/studio.types";

type RecentActivityProps = {
  items: StudioActivityItem[];
};

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RecentActivity({ items }: RecentActivityProps) {
  const recent = items.slice(0, 5);
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Recent activity</h2>
        <span className="text-xs text-muted-foreground">Enrollments & sales</span>
      </div>

      {recent.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No activity yet. Share your courses to get students.
        </p>
      ) : (
        <div className="mt-3 divide-y">
          {recent.map((item) => (
            <Link
              key={item.id}
              href={
                item.courseId
                  ? `/studio/courses/${item.courseId}/analytics`
                  : "/studio/courses"
              }
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
            >
              <span
                className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  item.type === "sale" ? "bg-chart-1/10 text-chart-1" : "bg-sky-500/10 text-sky-600"
                }`}
              >
                {item.type === "sale" ? (
                  <BadgeCheck className="size-4" />
                ) : (
                  <UserPlus className="size-4" />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">
                <span className="font-medium">{item.studentName}</span>{" "}
                <span className="text-muted-foreground">
                  {item.type === "sale"
                    ? `paid ${formatINR(item.amount ?? 0)} for`
                    : "enrolled in"}
                </span>{" "}
                <span className="font-medium">{item.courseTitle}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {timeAgo(item.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
