import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";

/* ─── Enroll ─── */

export async function enrollInCourse(userId: string, courseId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!course) {
    throw new AppError("Course not found or not published", 404);
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) {
    throw new AppError("Already enrolled in this course", 409);
  }

  return prisma.enrollment.create({
    data: { userId, courseId },
    include: { course: { select: { id: true, title: true } } },
  });
}

/* ─── Check enrollment ─── */

export async function checkEnrollment(userId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          instructor: { select: { id: true, name: true } },
          chapters: {
            orderBy: { orderIndex: "asc" },
            where: { lessons: { some: { status: "PUBLISHED" } } },
            select: {
              id: true,
              title: true,
              orderIndex: true,
              lessons: {
                where: { status: "PUBLISHED" },
                orderBy: { orderIndex: "asc" },
                select: {
                  id: true,
                  title: true,
                  contentType: true,
                  durationSeconds: true,
                  orderIndex: true,
                  isPreview: true,
                },
              },
            },
          },
        },
      },
      progress: {
        select: { lessonId: true, completedAt: true },
      },
    },
  });

  return enrollment;
}

/* ─── List enrolled courses ─── */

export async function listEnrolledCourses(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          category: true,
          difficulty: true,
          instructor: { select: { id: true, name: true } },
          chapters: {
            select: {
              lessons: { select: { id: true } },
            },
          },
        },
      },
      progress: {
        select: { lessonId: true },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });
}

/* ─── Get lesson content (enrollment-gated) ─── */

export async function getLessonContent(
  userId: string,
  lessonId: string,
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: {
        select: { courseId: true },
      },
    },
  });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId: lesson.chapter.courseId },
    },
    select: { id: true },
  });

  if (!enrollment && !lesson.isPreview) {
    throw new AppError("You must be enrolled to view this lesson", 403);
  }

  const resolvedContentId = lesson.publishedContentId ?? lesson.contentId;

  let content: Record<string, unknown> | null = null;

  if (lesson.contentType === "VIDEO") {
    content = await prisma.videoContent.findUnique({
      where: { id: resolvedContentId },
    });
  } else if (lesson.contentType === "TEXT") {
    content = await prisma.textContent.findUnique({
      where: { id: resolvedContentId },
    });
  } else if (lesson.contentType === "QUIZ") {
    const raw = await prisma.quizContent.findUnique({
      where: { id: resolvedContentId },
    });
    if (raw) {
      content = { ...raw, questions: JSON.parse(raw.questions as string) };
    }
  }

  return {
    id: lesson.id,
    title: lesson.title,
    contentType: lesson.contentType,
    durationSeconds: lesson.durationSeconds,
    isPreview: lesson.isPreview,
    content,
  };
}

/* ─── Mark lesson complete ─── */

export async function markLessonComplete(
  userId: string,
  lessonId: string,
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { select: { courseId: true } } },
  });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  const courseId = lesson.chapter.courseId;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (!enrollment) {
    throw new AppError("You must be enrolled in this course", 403);
  }

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, enrollmentId: enrollment.id },
    update: {},
  });

  const totalLessons = await prisma.lesson.count({
    where: {
      chapter: { courseId },
      status: "PUBLISHED",
    },
  });

  const completedLessons = await prisma.lessonProgress.count({
    where: {
      enrollmentId: enrollment.id,
    },
  });

  const progressPercent =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  const updatedEnrollment = await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      progressPercent,
      status: progressPercent === 100 ? "COMPLETED" : "ACTIVE",
    },
    select: { progressPercent: true, status: true },
  });

  return {
    lessonId,
    completed: true,
    progressPercent: updatedEnrollment.progressPercent,
    courseCompleted: updatedEnrollment.status === "COMPLETED",
  };
}
