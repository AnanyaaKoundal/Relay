import { CourseCard } from "@/components/learner/course-card";
import type { Enrollment } from "@/types/enrollment.types";
import { lessonCounts } from "./utils";

export function ContinueLearningSection({
  enrollments,
}: {
  enrollments: Enrollment[];
}) {
  if (enrollments.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Continue learning</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6">
        {enrollments.map((enrollment) => {
          const { completed, total } = lessonCounts(enrollment);
          return (
            <div key={enrollment.id} className="w-72 shrink-0">
              <CourseCard
                id={enrollment.course.id}
                title={enrollment.course.title}
                instructor={enrollment.course.instructor?.name}
                thumbnail={enrollment.course.bannerUrl}
                progress={enrollment.progressPercent}
                learnHref={`/courses/${enrollment.course.id}/learn`}
                lastLesson={
                  total > 0 ? `${completed}/${total} lessons` : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
