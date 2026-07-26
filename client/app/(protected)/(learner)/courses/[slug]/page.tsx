"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getPublicCourse,
} from "@/services/course.service";
import type { PublicCourseDetail } from "@/types/course.types";
import {
  checkEnrollment,
  enrollInCourse,
} from "@/services/enrollment.service";
import type { EnrollmentDetail } from "@/types/enrollment.types";
import { CurriculumAccordion } from "@/components/learner/course-player/curriculum-accordion";
import { Users, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";

export default function CourseDetailPage() {
  const params = useParams();
  const slug = String(params.slug);

  const [course, setCourse] = useState<PublicCourseDetail | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    Promise.all([
      getPublicCourse(slug).catch(() => null),
      checkEnrollment(slug).catch(() => null),
    ])
      .then(([courseData, enrollData]) => {
        setCourse(courseData);
        setEnrollment(enrollData);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleEnroll() {
    if (!course) return;
    setEnrolling(true);
    try {
      const result = await enrollInCourse(course.id);
      setEnrollment({
        ...result,
        course: { ...course, chapters: [] },
        progress: [],
      });
    } catch {
      // keep null
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm gap-2">
        <Spinner />
        Loading course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-muted-foreground">Course not found.</p>
        <Link href="/courses" className="mt-2 text-sm text-primary hover:underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  const totalLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.length,
    0,
  );
  const totalDuration = course.chapters.reduce(
    (acc, ch) =>
      acc +
      ch.lessons.reduce((a, l) => a + (l.durationSeconds ?? 0), 0),
    0,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hero */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
            {course.thumbnailUrl ? (
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <Image
                src="/thumbnail.avif"
                alt={course.title}
                fill
                className="object-cover"
              />
            )}
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">{course.title}</h1>

          <p className="text-muted-foreground">{course.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {course.instructor && (
              <span>by {course.instructor.name}</span>
            )}
            <span className="flex items-center gap-1">
              <Users className="size-4" />
              {course._count.enrollments.toLocaleString()} enrolled
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="size-4" />
              {course._count.chapters} chapters, {totalLessons} lessons
            </span>
            {totalDuration > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                {Math.round(totalDuration / 60)} min total
              </span>
            )}
            {course.difficulty && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                {course.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Sticky CTA card */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="text-2xl font-bold">
              {Number(course.price) === 0 ? "Free" : `$${course.price}`}
            </div>

            {enrollment ? (
              <Link
                href={`/courses/${course.id}/learn`}
                className="flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <CheckCircle2 className="size-4 mr-2" />
                {enrollment.progressPercent > 0 ? "Continue Learning" : "Start Course"}
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleEnroll}
                disabled={enrolling}
                className="flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {enrolling ? (
                  <Spinner />
                ) : (
                  "Enroll Now"
                )}
              </button>
            )}

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4" />
                {totalLessons} lessons
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4" />
                {totalDuration > 0
                  ? `${Math.round(totalDuration / 60)} minutes`
                  : "Self-paced"}
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-4" />
                {course._count.enrollments.toLocaleString()} students
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Course Curriculum</h2>
        <CurriculumAccordion
          chapters={course.chapters}
          completedLessonIds={
            enrollment
              ? new Set(enrollment.progress.map((p) => p.lessonId))
              : undefined
          }
        />
      </section>
    </div>
  );
}
