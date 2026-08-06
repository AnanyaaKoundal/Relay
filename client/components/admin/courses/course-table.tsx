"use client";

import { useRouter } from "next/navigation";
import type { AdminCourse } from "@/types/admin.types";
import { StatusBadge } from "@/components/shared/status-badge";

type CourseTableProps = {
  courses: AdminCourse[];
  onSelectCourse: (courseId: string) => void;
};

export function CourseTable({ courses, onSelectCourse }: CourseTableProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">No courses found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Course</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Instructor</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Enrolled</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className="border-b last:border-b-0 cursor-pointer transition-colors hover:bg-muted/50"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 shrink-0 rounded-lg bg-muted" />
                  <p className="font-medium truncate max-w-[200px]">{course.title}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{course.instructor.name}</td>
              <td className="px-4 py-3">
                <StatusBadge status={course.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{course.category?.name ?? "—"}</td>
              <td className="px-4 py-3 font-medium">₹{course.price.toLocaleString()}</td>
              <td className="px-4 py-3 text-muted-foreground">{course.enrollmentCount}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(course.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
