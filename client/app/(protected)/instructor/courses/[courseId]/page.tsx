"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCourse } from "@/services/course.service";
import type { CourseDetail } from "@/types/course.types";

const statusBadge: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  PENDING_APPROVAL: "bg-blue-100 text-blue-800",
  PUBLISHED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.courseId) return;
    setLoading(true);
    setError("");
    getCourse(params.courseId)
      .then(setCourse)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load course"))
      .finally(() => setLoading(false));
  }, [params?.courseId]);

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">Loading...</div>;
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <p className="text-sm text-red-500">{error ?? "Course not found"}</p>
        <Link href="/instructor/courses" className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/instructor/courses" className="text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; All Courses</Link>
          <h1 className="mt-2 text-2xl font-semibold">{course.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className={`rounded-full px-2 py-0.5 font-medium ${statusBadge[course.status] ?? ""}`}>
              {course.status.replace("_", " ")}
            </span>
            {course.difficulty && <span>{course.difficulty}</span>}
            {course.category && <span>{course.category}</span>}
            <span>${Number(course.price).toFixed(2)}</span>
          </div>
        </div>
        <Link
          href={`/instructor/courses/${course.id}/edit`}
          className="inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted transition-colors"
        >
          Edit
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-semibold">{course._count?.chapters ?? 0}</p>
          <p className="text-xs text-muted-foreground">Chapters</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-semibold">{(course as any)._count?.enrollments ?? 0}</p>
          <p className="text-xs text-muted-foreground">Enrolled</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-semibold">${Number(course.price).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Price</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-medium">Description</h2>
        <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{course.description}</p>
      </div>

      {course.createdAt && (
        <p className="mt-6 text-xs text-muted-foreground">Created {new Date(course.createdAt).toLocaleDateString()}</p>
      )}

      <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
        <h3 className="font-medium">Course Content</h3>
        <p className="mt-1 text-sm text-muted-foreground">Add chapters and lessons to structure your course.</p>
        <p className="mt-4 text-xs text-muted-foreground">Chapter management coming soon.</p>
      </div>
    </div>
  );
}
