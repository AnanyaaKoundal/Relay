import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";

function computeProgressPercent(
  progress: { lessonId: string }[],
  publishedLessons: { id: string }[],
): number {
  if (publishedLessons.length === 0) return 0;
  const publishedIds = new Set(publishedLessons.map((l) => l.id));
  const completed = progress.filter((p) => publishedIds.has(p.lessonId)).length;
  return Math.round((completed / publishedLessons.length) * 100);
}

/* ─── Enroll ─── */

export async function enrollInCourse(userId: string, courseId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, status: "PUBLISHED" },
    select: { id: true, price: true },
  });
  if (!course) {
    throw new AppError("Course not found or not published", 404);
  }

  if (Number(course.price) > 0) {
    throw new AppError(
      "This is a paid course. Use POST /payments/purchase to enroll.",
      400,
    );
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

  if (!enrollment) {
    return null;
  }

  const publishedLessons = enrollment.course.chapters.flatMap((c) => c.lessons);
  const progressPercent = computeProgressPercent(enrollment.progress, publishedLessons);

  return { ...enrollment, progressPercent };
}

/* ─── List enrolled courses ─── */

export async function listEnrolledCourses(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
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
              lessons: {
                where: { status: "PUBLISHED" },
                select: { id: true },
              },
            },
          },
        },
      },
      progress: {
        select: { lessonId: true },
      },
    },
    orderBy: [
      { lastAccessedAt: { sort: "desc", nulls: "last" } },
      { enrolledAt: "desc" },
    ],
  });

  return enrollments.map((enrollment) => {
    const publishedLessons = enrollment.course.chapters.flatMap((c) => c.lessons);
    return {
      ...enrollment,
      progressPercent: computeProgressPercent(enrollment.progress, publishedLessons),
    };
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

  if (enrollment) {
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { lastAccessedAt: new Date() },
    });
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
      lesson: { status: "PUBLISHED" },
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
      lastAccessedAt: new Date(),
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
