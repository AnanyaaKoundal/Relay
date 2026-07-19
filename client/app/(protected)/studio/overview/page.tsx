"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyCourses } from "@/services/course.service";
import type { CourseListItem } from "@/types/course.types";

export default function StudioOverviewPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCourses()
      .then(setCourses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const published = courses.filter((c) => c.status === "PUBLISHED");
  const drafts = courses.filter((c) => c.status === "DRAFT");
  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">Summary of your studio activity.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground font-medium">Total Courses</p>
          <p className="mt-1 text-2xl font-semibold">{loading ? "-" : courses.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground font-medium">Published</p>
          <p className="mt-1 text-2xl font-semibold">{loading ? "-" : published.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground font-medium">Drafts</p>
          <p className="mt-1 text-2xl font-semibold">{loading ? "-" : drafts.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs text-muted-foreground font-medium">Students</p>
          <p className="mt-1 text-2xl font-semibold">{loading ? "-" : totalStudents}</p>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Recent Courses</h2>
          <Link href="/studio/courses" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
        </div>
        {!loading && courses.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No courses yet.</p>
            <Link href="/studio/courses/new" className="mt-3 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">Create your first course</Link>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {courses.slice(0, 5).map((course) => (
              <Link key={course.id} href={`/studio/courses/${course.id}`} className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{course.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{course._count.chapters} chapters · {course._count.enrollments} enrolled</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  course.status === "PUBLISHED" ? "bg-green-100 text-green-800" :
                  course.status === "DRAFT" ? "bg-yellow-100 text-yellow-800" :
                  "bg-blue-100 text-blue-800"
                }`}>{course.status.replace("_", " ")}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
