import { prisma } from "./prisma.js";
import { AppError } from "./app-error.js";

export async function assertCourseOwnership(instructorId: string, courseId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, instructorId },
    select: { id: true },
  });
  if (!course) {
    throw new AppError("Course not found", 404);
  }
  return course;
}

export async function assertChapterOwnership(instructorId: string, chapterId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true, courseId: true },
  });
  if (!chapter) {
    throw new AppError("Chapter not found", 404);
  }
  await assertCourseOwnership(instructorId, chapter.courseId);
  return chapter;
}

export async function assertLessonOwnership(instructorId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, chapterId: true, contentType: true, contentId: true, status: true, publishedContentId: true },
  });
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }
  await assertChapterOwnership(instructorId, lesson.chapterId);
  return lesson;
}
