import { CourseCard } from "@/components/learner/course-card";
import type { Enrollment } from "@/types/enrollment.types";
import { lessonCounts } from "./utils";

export function CoursesGrid({ enrollments }: { enrollments: Enrollment[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {enrollments.map((enrollment) => {
        const { completed, total } = lessonCounts(enrollment);
        return (
          <CourseCard
            key={enrollment.id}
            id={enrollment.course.id}
            title={enrollment.course.title}
            instructor={enrollment.course.instructor?.name}
            thumbnail={enrollment.course.bannerUrl}
            progress={enrollment.progressPercent}
            learnHref={`/courses/${enrollment.course.id}/learn`}
            lastLesson={total > 0 ? `${completed}/${total} lessons` : undefined}
            showContinue={enrollment.status === "ACTIVE"}
          />
        );
      })}
    </div>
  );
}
