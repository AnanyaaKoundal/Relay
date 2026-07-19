import { prisma } from "../../lib/prisma.js";
import { assertCourseOwnership } from "../courses/courses.service.js";

/* ─── Helpers ─── */

async function assertChapterOwnership(instructorId: string, chapterId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true, courseId: true },
  });
  if (!chapter) {
    throw Object.assign(new Error("Chapter not found"), { statusCode: 404 });
  }
  await assertCourseOwnership(instructorId, chapter.courseId);
  return chapter;
}

async function assertLessonOwnership(instructorId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, chapterId: true, contentType: true, contentId: true },
  });
  if (!lesson) {
    throw Object.assign(new Error("Lesson not found"), { statusCode: 404 });
  }
  await assertChapterOwnership(instructorId, lesson.chapterId);
  return lesson;
}

async function enrichLessonWithContent(lesson: {
  id: string;
  contentType: string;
  contentId: string;
  [key: string]: unknown;
}) {
  let content: Record<string, unknown> | null = null;

  if (lesson.contentType === "VIDEO") {
    content = await prisma.videoContent.findUnique({
      where: { id: lesson.contentId },
    });
  } else if (lesson.contentType === "TEXT") {
    content = await prisma.textContent.findUnique({
      where: { id: lesson.contentId },
    });
  } else if (lesson.contentType === "QUIZ") {
    const raw = await prisma.quizContent.findUnique({
      where: { id: lesson.contentId },
    });
    if (raw) {
      content = { ...raw, questions: JSON.parse(raw.questions as string) };
    }
  }

  return { ...lesson, content };
}

/* ─── CRUD ─── */

export async function listLessons(instructorId: string, chapterId: string) {
  await assertChapterOwnership(instructorId, chapterId);

  const lessons = await prisma.lesson.findMany({
    where: { chapterId },
    orderBy: { orderIndex: "asc" },
  });

  return Promise.all(lessons.map(enrichLessonWithContent));
}

export async function getLesson(instructorId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });
  if (!lesson) {
    throw Object.assign(new Error("Lesson not found"), { statusCode: 404 });
  }
  await assertChapterOwnership(instructorId, lesson.chapterId);
  return enrichLessonWithContent(lesson);
}

export async function createLesson(
  instructorId: string,
  chapterId: string,
  data: {
    title: string;
    contentType: "VIDEO" | "TEXT" | "QUIZ";
    orderIndex?: number;
    durationSeconds?: number;
    videoUrl?: string;
    s3Key?: string;
    body?: string;
    questions?: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }[];
  },
) {
  await assertChapterOwnership(instructorId, chapterId);

  const maxOrder = await prisma.lesson.aggregate({
    where: { chapterId },
    _max: { orderIndex: true },
  });

  let contentId = "";

  if (data.contentType === "VIDEO") {
    const content = await prisma.videoContent.create({
      data: {
        videoUrl: data.videoUrl ?? null,
        s3Key: data.s3Key ?? "pending",
        durationSeconds: data.durationSeconds ?? null,
      },
    });
    contentId = content.id;
  } else if (data.contentType === "TEXT") {
    const content = await prisma.textContent.create({
      data: { body: data.body ?? "" },
    });
    contentId = content.id;
  } else if (data.contentType === "QUIZ") {
    const content = await prisma.quizContent.create({
      data: { questions: JSON.stringify(data.questions ?? []) },
    });
    contentId = content.id;
  }

  const lesson = await prisma.lesson.create({
    data: {
      title: data.title,
      contentType: data.contentType,
      contentId,
      orderIndex: data.orderIndex ?? (maxOrder._max.orderIndex ?? -1) + 1,
      durationSeconds:
        data.contentType === "VIDEO" ? (data.durationSeconds ?? null) : null,
      chapterId,
    },
  });

  return enrichLessonWithContent(lesson);
}

export async function updateLesson(
  instructorId: string,
  lessonId: string,
  data: {
    title?: string;
    orderIndex?: number;
    durationSeconds?: number;
    videoUrl?: string | null;
    s3Key?: string | null;
    body?: string;
    questions?: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }[];
  },
) {
  const lesson = await assertLessonOwnership(instructorId, lessonId);

  // Update the content record
  if (lesson.contentType === "VIDEO") {
    const updateData: Record<string, unknown> = {};
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.s3Key !== undefined) updateData.s3Key = data.s3Key;
    if (data.durationSeconds !== undefined)
      updateData.durationSeconds = data.durationSeconds;
    if (Object.keys(updateData).length > 0) {
      await prisma.videoContent.update({
        where: { id: lesson.contentId },
        data: updateData,
      });
    }
  } else if (lesson.contentType === "TEXT" && data.body !== undefined) {
    await prisma.textContent.update({
      where: { id: lesson.contentId },
      data: { body: data.body },
    });
  } else if (lesson.contentType === "QUIZ" && data.questions !== undefined) {
    await prisma.quizContent.update({
      where: { id: lesson.contentId },
      data: { questions: JSON.stringify(data.questions) },
    });
  }

  // Update lesson metadata
  const metaUpdate: Record<string, unknown> = {};
  if (data.title !== undefined) metaUpdate.title = data.title;
  if (data.orderIndex !== undefined) metaUpdate.orderIndex = data.orderIndex;
  if (data.durationSeconds !== undefined)
    metaUpdate.durationSeconds = data.durationSeconds;

  if (Object.keys(metaUpdate).length > 0) {
    await prisma.lesson.update({ where: { id: lessonId }, data: metaUpdate });
  }

  return getLesson(instructorId, lessonId);
}

export async function deleteLesson(instructorId: string, lessonId: string) {
  const lesson = await assertLessonOwnership(instructorId, lessonId);

  if (lesson.contentType === "VIDEO") {
    await prisma.videoContent.delete({ where: { id: lesson.contentId } });
  } else if (lesson.contentType === "TEXT") {
    await prisma.textContent.delete({ where: { id: lesson.contentId } });
  } else if (lesson.contentType === "QUIZ") {
    await prisma.quizContent.delete({ where: { id: lesson.contentId } });
  }

  await prisma.lesson.delete({ where: { id: lessonId } });
}

export async function reorderLessons(
  instructorId: string,
  chapterId: string,
  lessonIds: string[],
) {
  await assertChapterOwnership(instructorId, chapterId);

  await prisma.$transaction(
    lessonIds.map((id, index) =>
      prisma.lesson.update({
        where: { id },
        data: { orderIndex: index },
      }),
    ),
  );

  return { message: "Lessons reordered" };
}
