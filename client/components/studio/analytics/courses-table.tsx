"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatINR } from "@/lib/studio-utils";
import type { StudioCourseRow } from "@/types/studio.types";

type CoursesTableProps = {
  courses: StudioCourseRow[];
};

export function CoursesTable({ courses }: CoursesTableProps) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-sm font-medium">Courses</h2>
        <span className="text-xs text-muted-foreground">All-time numbers</span>
      </div>

      {courses.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No courses yet. Create one to start tracking analytics.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-3 py-3 text-right font-medium">Students</th>
                <th className="px-3 py-3 text-right font-medium">Revenue</th>
                <th className="px-3 py-3 text-right font-medium">Completion</th>
                <th className="px-3 py-3 text-right font-medium">Active (7d)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courses.map((course) => (
                <tr key={course.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/studio/courses/${course.id}/analytics`}
                      className="flex items-center gap-2.5 font-medium transition-colors hover:text-primary"
                    >
                      <span className="max-w-64 truncate">{course.title}</span>
                      <StatusBadge status={course.status} />
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{course.students}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {formatINR(course.revenue)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {course.completionRate}%
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {course.activeLearners}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
