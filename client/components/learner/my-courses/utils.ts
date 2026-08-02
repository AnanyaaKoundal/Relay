import type { Enrollment } from "@/types/enrollment.types";

export function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function lessonCounts(enrollment: Enrollment) {
  const total = enrollment.course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.length,
    0,
  );
  return { completed: enrollment.progress.length, total };
}
