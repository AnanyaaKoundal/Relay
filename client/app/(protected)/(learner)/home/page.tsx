"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { CourseCard } from "@/components/learner/course-card";
import { browseCourses } from "@/services/course.service";
import type { PublicCourse } from "@/types/course.types";
import {
  listEnrolledCourses,
} from "@/services/enrollment.service";
import type { Enrollment } from "@/types/enrollment.types";
import { ArrowRight, BookOpen, Sparkles, Clock } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { EmptyState } from "@/components/shared/empty-state";

function SectionHeader({
  icon: Icon,
  title,
  actionHref,
  actionLabel,
}: {
  icon: React.ElementType;
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {actionLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

function CourseRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6">
      {children}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listEnrolledCourses().catch(() => [] as Enrollment[]),
      browseCourses({ limit: 12 })
        .then((res) => res.courses)
        .catch(() => [] as PublicCourse[]),
    ])
      .then(([enrollData, courseData]) => {
        setEnrollments(enrollData);
        setCourses(courseData);
      })
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const categories = [
    "Web Development",
    "Data Science",
    "Mobile Development",
    "Cloud & DevOps",
    "Design",
    "Business",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          {greeting()}, {user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Pick up where you left off or explore something new.
        </p>
      </div>

      {/* Continue Learning */}
      {enrollments.length > 0 && (
        <section>
          <SectionHeader
            icon={Clock}
            title="Continue Learning"
            actionHref="/my-courses"
            actionLabel="View all"
          />
          <CourseRow>
            {enrollments.map((enrollment) => {
              const totalLessons = enrollment.course.chapters.reduce(
                (acc, ch) => acc + ch.lessons.length,
                0,
              );
              return (
                <div key={enrollment.id} className="w-72 shrink-0">
                  <CourseCard
                    id={enrollment.course.id}
                    title={enrollment.course.title}
                    instructor={enrollment.course.instructor?.name}
                    thumbnail={enrollment.course.thumbnailUrl}
                    progress={enrollment.progressPercent}
                    learnHref={`/courses/${enrollment.course.id}/learn`}
                    lastLesson={
                      totalLessons > 0
                        ? `${enrollment.progress.length}/${totalLessons} lessons`
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </CourseRow>
        </section>
      )}

      {/* Recommended for You */}
      <section>
        <SectionHeader
          icon={Sparkles}
          title="Recommended for You"
          actionHref="/courses"
          actionLabel="Explore more"
        />
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
            <Spinner />
            Loading courses...
          </div>
        ) : courses.length > 0 ? (
          <CourseRow>
            {courses.map((course) => (
              <div key={course.id} className="w-72 shrink-0">
                <CourseCard
                  id={course.id}
                  title={course.title}
                  instructor={course.instructor?.name}
                  thumbnail={course.thumbnailUrl}
                  price={Number(course.price)}
                  showContinue={false}
                />
              </div>
            ))}
          </CourseRow>
        ) : (
          <EmptyState title="No courses available yet. Check back soon!" />
        )}
      </section>

      {/* Browse by Category */}
      <section>
        <SectionHeader icon={BookOpen} title="Browse by Category" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/courses?category=${encodeURIComponent(cat)}`}
              className="rounded-xl border bg-card p-4 text-center text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 hover:text-primary"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
