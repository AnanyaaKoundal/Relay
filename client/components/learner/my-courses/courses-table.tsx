import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Play } from "lucide-react";
import type { Enrollment } from "@/types/enrollment.types";
import type { SortKey } from "./types";
import { SortHeader } from "./sort-header";
import { formatDate } from "./utils";

export function CoursesTable({
  enrollments,
  sortKey,
  sortDir,
  onToggleSort,
}: {
  enrollments: Enrollment[];
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onToggleSort: (key: SortKey) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3">
              <SortHeader label="Course" column="title" sortKey={sortKey} sortDir={sortDir} onToggle={onToggleSort} />
            </th>
            <th className="px-4 py-3">
              <SortHeader label="Instructor" column="instructor" sortKey={sortKey} sortDir={sortDir} onToggle={onToggleSort} />
            </th>
            <th className="px-4 py-3">
              <SortHeader label="Progress" column="progress" sortKey={sortKey} sortDir={sortDir} onToggle={onToggleSort} />
            </th>
            <th className="px-4 py-3">
              <SortHeader label="Status" column="status" sortKey={sortKey} sortDir={sortDir} onToggle={onToggleSort} />
            </th>
            <th className="px-4 py-3">
              <SortHeader label="Last accessed" column="lastAccessedAt" sortKey={sortKey} sortDir={sortDir} onToggle={onToggleSort} />
            </th>
            <th className="px-4 py-3">
              <SortHeader label="Enrolled" column="enrolledAt" sortKey={sortKey} sortDir={sortDir} onToggle={onToggleSort} />
            </th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {enrollments.map((enrollment) => {
            const completedCourse = enrollment.status === "COMPLETED";
            return (
              <tr key={enrollment.id} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/courses/${enrollment.course.id}/learn`}
                    className="flex items-center gap-3"
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={enrollment.course.thumbnailUrl ?? "/thumbnail.avif"}
                        alt={enrollment.course.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <span className="line-clamp-2 font-medium hover:text-primary transition-colors">
                      {enrollment.course.title}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {enrollment.course.instructor?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${enrollment.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {enrollment.progressPercent}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      completedCourse
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {completedCourse ? (
                      <CheckCircle2 className="size-3" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" />
                    )}
                    {completedCourse ? "Completed" : "In progress"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(enrollment.lastAccessedAt) ?? "Never"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(enrollment.enrolledAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/courses/${enrollment.course.id}/learn`}
                    className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
                  >
                    {completedCourse ? (
                      "Review"
                    ) : (
                      <>
                        <Play className="size-3 fill-current" />
                        {enrollment.progressPercent > 0 ? "Continue" : "Start"}
                      </>
                    )}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
