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
                  createdAt: true,
                  updatedAt: true,
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
      const parsed = JSON.parse(raw.questions as string);
      // Strip correctAnswer from learner payload
      const questions = parsed.map(
        (q: { correctAnswer: number; rest: unknown }) => {
          const { correctAnswer: _, ...rest } = q;
          return rest;
        }
      );
      content = { questions, passThreshold: raw.passThreshold };
    }
  }

  return {
    id: lesson.id,
    title: lesson.title,
    contentType: lesson.contentType,
    durationSeconds: lesson.durationSeconds,
    isPreview: lesson.isPreview,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
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

  const justCompleted = progressPercent === 100 && enrollment.status !== "COMPLETED";

  const updatedEnrollment = await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      progressPercent,
      status: progressPercent === 100 ? "COMPLETED" : "ACTIVE",
      ...(justCompleted && { completedAt: new Date() }),
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

/* ─── Submit quiz attempt ─── */

export async function submitQuizAttempt(
  userId: string,
  lessonId: string,
  answers: number[],
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { select: { courseId: true } } },
  });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  if (lesson.contentType !== "QUIZ") {
    throw new AppError("This lesson is not a quiz", 400);
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.chapter.courseId } },
    select: { id: true },
  });

  if (!enrollment) {
    throw new AppError("You must be enrolled in this course", 403);
  }

  const resolvedContentId = lesson.publishedContentId ?? lesson.contentId;
  const quizContent = await prisma.quizContent.findUnique({
    where: { id: resolvedContentId },
  });

  if (!quizContent) {
    throw new AppError("Quiz content not found", 404);
  }

  const questions = JSON.parse(quizContent.questions as string) as {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }[];

  if (answers.length !== questions.length) {
    throw new AppError(
      `Expected ${questions.length} answers, got ${answers.length}`,
      400,
    );
  }

  let correct = 0;
  const perQuestionCorrect: boolean[] = [];
  for (let i = 0; i < questions.length; i++) {
    const isCorrect = answers[i] === questions[i]!.correctAnswer;
    perQuestionCorrect.push(isCorrect);
    if (isCorrect) correct++;
  }

  const total = questions.length;
  const passed = total > 0 && Math.round((correct / total) * 100) >= quizContent.passThreshold;

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      lessonId,
      score: correct,
      totalQuestions: total,
      passed,
      answers,
    },
  });

  // Mark lesson complete only on pass
  let result;
  if (passed) {
    result = await markLessonComplete(userId, lessonId);
  } else {
    // Still return progress info for failed attempts
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.chapter.courseId } },
      select: { progressPercent: true, status: true },
    });
    result = {
      lessonId,
      completed: false,
      progressPercent: enrollment?.progressPercent ?? 0,
      courseCompleted: enrollment?.status === "COMPLETED",
    };
  }

  return {
    attemptId: attempt.id,
    score: correct,
    total,
    passed,
    perQuestionCorrect,
    passThreshold: quizContent.passThreshold,
    ...result,
  };
}

/* ─── Get quiz attempts ─── */

export async function getQuizAttempts(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { select: { courseId: true } } },
  });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.chapter.courseId } },
    select: { id: true },
  });

  if (!enrollment) {
    throw new AppError("You must be enrolled in this course", 403);
  }

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId, lessonId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      score: true,
      totalQuestions: true,
      passed: true,
      createdAt: true,
    },
  });

  const bestScore = attempts.reduce((max, a) => Math.max(max, a.score), 0);
  const bestTotal = attempts.length > 0 ? attempts[0]!.totalQuestions : 0;

  return {
    attempts,
    bestScore,
    bestTotal,
  };
}

/* ─── Recalculate progress for all enrollments in a course ─── */

export async function recalculateEnrollmentProgress(courseId: string) {
  const totalLessons = await prisma.lesson.count({
    where: { chapter: { courseId }, status: "PUBLISHED" },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    select: { id: true, status: true },
  });

  for (const enrollment of enrollments) {
    const completedLessons = await prisma.lessonProgress.count({
      where: { enrollmentId: enrollment.id, lesson: { status: "PUBLISHED" } },
    });

    const progressPercent =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const newStatus = progressPercent === 100 ? "COMPLETED" : "ACTIVE";
    const justCompleted = newStatus === "COMPLETED" && enrollment.status !== "COMPLETED";

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPercent,
        status: newStatus,
        ...(justCompleted && { completedAt: new Date() }),
      },
    });
  }
}
