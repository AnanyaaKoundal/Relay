"use client";

import Link from "next/link";
import type { StudioTopCourse } from "@/types/studio.types";

type TopCoursesTableProps = {
  courses: StudioTopCourse[];
};

const formatINR = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function TopCoursesTable({ courses }: TopCoursesTableProps) {
  if (courses.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No course activity yet. Share your courses to get students.
      </p>
    );
  }

  return (
    <div className="-mx-2 divide-y">
      {courses.map((course, index) => (
        <Link
          key={course.id}
          href={`/studio/courses/${course.id}`}
          className="flex items-center gap-4 rounded-lg px-2 py-3.5 transition-colors hover:bg-muted/40 first:pt-2 last:pb-2"
        >
          <span className="w-5 shrink-0 text-center text-xs font-medium text-muted-foreground">
            {index + 1}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{course.title}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-1"
                  style={{ width: `${course.completionRate}%` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground">
                {course.completionRate}% completion
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-sm font-medium">
              {course.students} {course.students === 1 ? "student" : "students"}
            </p>
            <p className="text-[11px] text-muted-foreground">{formatINR(course.revenue)} earned</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
