"use client";

import { useEffect, useState } from "react";
import { CourseCard } from "@/components/learner/course-card";
import {
  listEnrolledCourses,
} from "@/services/enrollment.service";
import type { Enrollment } from "@/types/enrollment.types";
import { BookOpen } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { EmptyState } from "@/components/shared/empty-state";

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEnrolledCourses()
      .then(setEnrollments)
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
          <Spinner />
          Loading your courses...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Courses you&apos;re enrolled in
        </p>
      </div>

      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {enrollments.map((enrollment) => {
            const completedLessons = enrollment.progress.length;
            const totalLessons = enrollment.course.chapters.reduce(
              (acc, ch) => acc + ch.lessons.length,
              0,
            );
            return (
              <CourseCard
                key={enrollment.id}
                id={enrollment.course.id}
                title={enrollment.course.title}
                instructor={enrollment.course.instructor?.name}
                thumbnail={enrollment.course.thumbnailUrl}
                progress={enrollment.progressPercent}
                learnHref={`/courses/${enrollment.course.id}/learn`}
                lastLesson={
                  totalLessons > 0
                    ? `${completedLessons}/${totalLessons} lessons`
                    : undefined
                }
                showContinue={enrollment.status === "ACTIVE"}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="You haven't enrolled in any courses yet."
          action={{ label: "Browse Courses", href: "/courses" }}
        />
      )}
    </div>
  );
}
