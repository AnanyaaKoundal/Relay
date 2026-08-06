import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";
import { assertChapterOwnership, assertLessonOwnership } from "../../lib/ownership.js";
import { recalculateEnrollmentProgress } from "../enrollments/enrollments.service.js";

/* ─── Helpers ─── */

async function copyContentRecord(contentId: string, contentType: string): Promise<string> {
  if (contentType === "VIDEO") {
    const src = await prisma.videoContent.findUnique({ where: { id: contentId } });
    if (!src) throw new AppError("Video content not found", 404);
    const copy = await prisma.videoContent.create({
      data: {
        s3Key: src.s3Key,
        videoUrl: src.videoUrl,
        hlsUrl: src.hlsUrl,
        processingStatus: src.processingStatus,
        durationSeconds: src.durationSeconds,
      },
    });
    return copy.id;
  } else if (contentType === "TEXT") {
    const src = await prisma.textContent.findUnique({ where: { id: contentId } });
    if (!src) throw new AppError("Text content not found", 404);
    const copy = await prisma.textContent.create({ data: { body: src.body } });
    return copy.id;
  } else if (contentType === "QUIZ") {
    const src = await prisma.quizContent.findUnique({ where: { id: contentId } });
    if (!src) throw new AppError("Quiz content not found", 404);
    const copy = await prisma.quizContent.create({ data: { questions: src.questions } });
    return copy.id;
  }
  throw new AppError(`Unknown content type: ${contentType}`, 400);
}

async function deleteContentRecord(contentId: string, contentType: string) {
  if (contentType === "VIDEO") {
    await prisma.videoContent.delete({ where: { id: contentId } }).catch(() => { });
  } else if (contentType === "TEXT") {
    await prisma.textContent.delete({ where: { id: contentId } }).catch(() => { });
  } else if (contentType === "QUIZ") {
    await prisma.quizContent.delete({ where: { id: contentId } }).catch(() => { });
  }
}

async function batchEnrichLessons(lessons: { id: string; contentType: string; contentId: string; publishedContentId: string | null; [key: string]: unknown }[]) {
  const videoIds = new Set<string>();
  const textIds = new Set<string>();
  const quizIds = new Set<string>();

  for (const l of lessons) {
    if (l.contentType === "VIDEO") {
      if (l.contentId) videoIds.add(l.contentId);
      if (l.publishedContentId) videoIds.add(l.publishedContentId);
    } else if (l.contentType === "TEXT") {
      if (l.contentId) textIds.add(l.contentId);
      if (l.publishedContentId) textIds.add(l.publishedContentId);
    } else if (l.contentType === "QUIZ") {
      if (l.contentId) quizIds.add(l.contentId);
      if (l.publishedContentId) quizIds.add(l.publishedContentId);
    }
  }

  const [videos, texts, quizzes] = await Promise.all([
    videoIds.size ? prisma.videoContent.findMany({ where: { id: { in: [...videoIds] } } }) : [],
    textIds.size ? prisma.textContent.findMany({ where: { id: { in: [...textIds] } } }) : [],
    quizIds.size ? prisma.quizContent.findMany({ where: { id: { in: [...quizIds] } } }) : [],
  ]);

  const videoMap = new Map(videos.map(v => [v.id, v]));
  const textMap = new Map(texts.map(t => [t.id, t]));
  const quizMap = new Map(quizzes.map(q => [q.id, { ...q, questions: JSON.parse(q.questions as string) }]));

  return lessons.map(lesson => {
    let content: Record<string, unknown> | null = null;

    if (lesson.contentType === "VIDEO") content = videoMap.get(lesson.contentId) ?? null;
    else if (lesson.contentType === "TEXT") content = textMap.get(lesson.contentId) ?? null;
    else if (lesson.contentType === "QUIZ") content = quizMap.get(lesson.contentId) ?? null;

    return { ...lesson, content };
  });
}

/* ─── CRUD ─── */

export async function listLessons(instructorId: string, chapterId: string) {
  await assertChapterOwnership(instructorId, chapterId);

  const lessons = await prisma.lesson.findMany({
    where: { chapterId },
    orderBy: { orderIndex: "asc" },
  });

  return await batchEnrichLessons(lessons);
}

export async function getLesson(instructorId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }
  await assertChapterOwnership(instructorId, lesson.chapterId);
  const [enriched] = await batchEnrichLessons([lesson]);
  return enriched;
}

export async function createLesson(
  instructorId: string,
  chapterId: string,
  data: {
    title: string;
    contentType: "VIDEO" | "TEXT" | "QUIZ";
    orderIndex?: number;
    durationSeconds?: number;
    isPreview?: boolean;
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
      status: "DRAFT",
      orderIndex: data.orderIndex ?? (maxOrder._max.orderIndex ?? -1) + 1,
      durationSeconds:
        data.contentType === "VIDEO" ? (data.durationSeconds ?? null) : null,
      isPreview: data.isPreview ?? false,
      chapterId,
    },
  });

  const [enriched] = await batchEnrichLessons([lesson]);
  return enriched;
}

export async function updateLesson(
  instructorId: string,
  lessonId: string,
  data: {
    title?: string;
    orderIndex?: number;
    durationSeconds?: number;
    isPreview?: boolean;
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

  const metaUpdate: Record<string, unknown> = {};
  if (data.title !== undefined) metaUpdate.title = data.title;
  if (data.orderIndex !== undefined) metaUpdate.orderIndex = data.orderIndex;
  if (data.durationSeconds !== undefined) metaUpdate.durationSeconds = data.durationSeconds;
  if (data.isPreview !== undefined) metaUpdate.isPreview = data.isPreview;

  if (lesson.status === "PUBLISHED") {
    const snapshotId = await copyContentRecord(lesson.contentId, lesson.contentType);
    let newContentId = lesson.contentId;

    if (lesson.contentType === "VIDEO") {
      const updateData: Record<string, unknown> = {};
      if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
      if (data.s3Key !== undefined) updateData.s3Key = data.s3Key;
      if (data.durationSeconds !== undefined) updateData.durationSeconds = data.durationSeconds;
      if (Object.keys(updateData).length > 0) {
        const src = await prisma.videoContent.findUnique({ where: { id: lesson.contentId } });
        const newContent = await prisma.videoContent.create({
          data: {
            s3Key: data.s3Key ?? src!.s3Key,
            videoUrl: data.videoUrl !== undefined ? data.videoUrl : src!.videoUrl,
            hlsUrl: src!.hlsUrl,
            processingStatus: src!.processingStatus,
            durationSeconds: data.durationSeconds !== undefined ? data.durationSeconds : src!.durationSeconds,
          },
        });
        newContentId = newContent.id;
      }
    } else if (lesson.contentType === "TEXT" && data.body !== undefined) {
      const newContent = await prisma.textContent.create({
        data: { body: data.body },
      });
      newContentId = newContent.id;
    } else if (lesson.contentType === "QUIZ" && data.questions !== undefined) {
      const newContent = await prisma.quizContent.create({
        data: { questions: JSON.stringify(data.questions) },
      });
      newContentId = newContent.id;
    }

    metaUpdate.contentId = newContentId;
    metaUpdate.publishedContentId = snapshotId;
    metaUpdate.status = "DRAFT";
  } else {
    if (lesson.contentType === "VIDEO") {
      const updateData: Record<string, unknown> = {};
      if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
      if (data.s3Key !== undefined) updateData.s3Key = data.s3Key;
      if (data.durationSeconds !== undefined) updateData.durationSeconds = data.durationSeconds;
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
  }

  if (Object.keys(metaUpdate).length > 0) {
    await prisma.lesson.update({ where: { id: lessonId }, data: metaUpdate });
  }

  return getLesson(instructorId, lessonId);
}

export async function deleteLesson(instructorId: string, lessonId: string) {
  const lesson = await assertLessonOwnership(instructorId, lessonId);

  const chapter = await prisma.chapter.findUnique({
    where: { id: lesson.chapterId },
    select: { courseId: true },
  });

  await deleteContentRecord(lesson.contentId, lesson.contentType);
  if (lesson.publishedContentId) {
    await deleteContentRecord(lesson.publishedContentId, lesson.contentType);
  }

  await prisma.lesson.delete({ where: { id: lessonId } });

  if (chapter) {
    await recalculateEnrollmentProgress(chapter.courseId);
  }
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

/* ─── Publish / Unpublish ─── */

export async function publishLessons(instructorId: string, lessonIds: string[]) {
  /* ── Validate all lessons first ── */
  for (const lessonId of lessonIds) {
    const lesson = await assertLessonOwnership(instructorId, lessonId);
    if (lesson.status !== "DRAFT") continue;

    if (lesson.contentType === "VIDEO" && lesson.contentId) {
      const vc = await prisma.videoContent.findUnique({
        where: { id: lesson.contentId },
        select: { processingStatus: true },
      });
      if (vc) {
        if (vc.processingStatus === "PROCESSING") {
          throw new AppError("Cannot publish a lesson while its video is still processing", 400);
        }
        if (vc.processingStatus === "FAILED") {
          throw new AppError("Cannot publish a lesson — its video transcoding failed. Retry transcoding first.", 400);
        }
      }
    }
  }

  /* ── Publish all validated lessons ── */
  const updated: string[] = [];
  const chapterIdsToPublish = new Set<string>();

  for (const lessonId of lessonIds) {
    const lesson = await assertLessonOwnership(instructorId, lessonId);
    if (lesson.status !== "DRAFT") continue;

    chapterIdsToPublish.add(lesson.chapterId);

    if (lesson.publishedContentId) {
      await deleteContentRecord(lesson.publishedContentId, lesson.contentType);
    }

    await prisma.lesson.update({
      where: { id: lessonId },
      data: { publishedContentId: null, status: "PUBLISHED" },
    });

    updated.push(lessonId);
  }

  for (const chapterId of chapterIdsToPublish) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, titleDraft: true, courseId: true },
    });
    if (chapter?.titleDraft) {
      await prisma.chapter.update({
        where: { id: chapterId },
        data: { title: chapter.titleDraft, titleDraft: null },
      });
    }
  }

  /* ── Recalculate enrollment progress for affected courses ── */
  const courseIds = new Set<string>();
  for (const chapterId of chapterIdsToPublish) {
    const ch = await prisma.chapter.findUnique({ where: { id: chapterId }, select: { courseId: true } });
    if (ch) courseIds.add(ch.courseId);
  }
  for (const cid of courseIds) {
    await recalculateEnrollmentProgress(cid);
  }

  return { published: updated };
}

export async function unpublishLessons(instructorId: string, lessonIds: string[]) {
  const updated: string[] = [];

  for (const lessonId of lessonIds) {
    const lesson = await assertLessonOwnership(instructorId, lessonId);
    if (lesson.status !== "PUBLISHED") continue;

    const snapshotId = await copyContentRecord(lesson.contentId, lesson.contentType);

    await prisma.lesson.update({
      where: { id: lessonId },
      data: { publishedContentId: snapshotId, status: "DRAFT" },
    });

    updated.push(lessonId);
  }

  /* ── Recalculate enrollment progress for affected courses ── */
  const courseIds = new Set<string>();
  for (const lessonId of updated) {
    const l = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { chapter: { select: { courseId: true } } } });
    if (l) courseIds.add(l.chapter.courseId);
  }
  for (const cid of courseIds) {
    await recalculateEnrollmentProgress(cid);
  }

  return { unpublished: updated };
}

export async function getLessonProcessingStatus(courseId: string) {
  const videoLessons = await prisma.lesson.findMany({
    where: {
      chapter: { courseId },
      contentType: "VIDEO",
      contentId: { not: "" },
    },
    select: { id: true, contentId: true },
  });

  const contentIds = videoLessons.map(l => l.contentId);

  const videoContents = await prisma.videoContent.findMany({
    where: {
      id: { in: contentIds },
      processingStatus: { in: ["PENDING", "PROCESSING", "FAILED"] },
    },
    select: { id: true, processingStatus: true },
  });

  const statusMap = new Map(videoContents.map(vc => [vc.id, vc.processingStatus]));

  return videoLessons
    .filter(l => statusMap.has(l.contentId))
    .map(l => ({ lessonId: l.id, processingStatus: statusMap.get(l.contentId) }));
}
