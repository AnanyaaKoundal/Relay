"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyCourses, deleteCourse } from "@/services/course.service";
import type { CourseListItem } from "@/types/course.types";

const statusBadge: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  PENDING_APPROVAL: "bg-blue-100 text-blue-800",
  PUBLISHED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getMyCourses();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">Loading courses...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/instructor/courses/new"
          className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          New Course
        </Link>
      </div>

      {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      {courses.length === 0 && !error ? (
        <div className="mt-12 rounded-xl border border-dashed bg-card p-12 text-center">
          <h3 className="font-medium">No courses yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Create your first course to get started.</p>
          <Link
            href="/instructor/courses/new"
            className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Create Course
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <div className="min-w-0 flex-1">
                <Link href={`/instructor/courses/${course.id}`} className="font-medium hover:underline">
                  {course.title}
                </Link>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge[course.status] ?? ""}`}>
                    {course.status.replace("_", " ")}
                  </span>
                  <span>{course._count.chapters} chapters</span>
                  <span>{course._count.enrollments} enrolled</span>
                </div>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Link
                  href={`/instructor/courses/${course.id}/edit`}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(course.id, course.title)}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
