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
    select: { id: true, chapterId: true, contentType: true, contentId: true, status: true, publishedContentId: true },
  });
  if (!lesson) {
    throw Object.assign(new Error("Lesson not found"), { statusCode: 404 });
  }
  await assertChapterOwnership(instructorId, lesson.chapterId);
  return lesson;
}

async function copyContentRecord(contentId: string, contentType: string): Promise<string> {
  if (contentType === "VIDEO") {
    const src = await prisma.videoContent.findUnique({ where: { id: contentId } });
    if (!src) throw new Error("Video content not found");
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
    if (!src) throw new Error("Text content not found");
    const copy = await prisma.textContent.create({ data: { body: src.body } });
    return copy.id;
  } else if (contentType === "QUIZ") {
    const src = await prisma.quizContent.findUnique({ where: { id: contentId } });
    if (!src) throw new Error("Quiz content not found");
    const copy = await prisma.quizContent.create({ data: { questions: src.questions } });
    return copy.id;
  }
  throw new Error(`Unknown content type: ${contentType}`);
}

async function deleteContentRecord(contentId: string, contentType: string) {
  if (contentType === "VIDEO") {
    await prisma.videoContent.delete({ where: { id: contentId } }).catch(() => {});
  } else if (contentType === "TEXT") {
    await prisma.textContent.delete({ where: { id: contentId } }).catch(() => {});
  } else if (contentType === "QUIZ") {
    await prisma.quizContent.delete({ where: { id: contentId } }).catch(() => {});
  }
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

  return enrichLessonWithContent(lesson);
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
    // Dual content: snapshot current content, create new content for edits
    const snapshotId = await copyContentRecord(lesson.contentId, lesson.contentType);

    let newContentId = lesson.contentId;

    if (lesson.contentType === "VIDEO") {
      const updateData: Record<string, unknown> = {};
      if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
      if (data.s3Key !== undefined) updateData.s3Key = data.s3Key;
      if (data.durationSeconds !== undefined) updateData.durationSeconds = data.durationSeconds;
      if (Object.keys(updateData).length > 0) {
        // Create a new content record for the draft
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
    // Draft lesson: update content directly (publishedContentId stays for learners)
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

  // Delete both current and published snapshot content
  await deleteContentRecord(lesson.contentId, lesson.contentType);
  if (lesson.publishedContentId) {
    await deleteContentRecord(lesson.publishedContentId, lesson.contentType);
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

/* ─── Publish / Unpublish ─── */

export async function publishLessons(instructorId: string, lessonIds: string[]) {
  const updated: string[] = [];
  const chapterIdsToPublish = new Set<string>();

  for (const lessonId of lessonIds) {
    const lesson = await assertLessonOwnership(instructorId, lessonId);
    if (lesson.status !== "DRAFT") continue;

    // Block if video is still processing
    if (lesson.contentType === "VIDEO" && lesson.contentId) {
      const vc = await prisma.videoContent.findUnique({
        where: { id: lesson.contentId },
        select: { processingStatus: true },
      });
      if (vc && vc.processingStatus === "PROCESSING") {
        throw Object.assign(
          new Error("Cannot publish a lesson while its video is still processing"),
          { statusCode: 400 },
        );
      }
    }

    // Auto-apply chapter titleDraft
    chapterIdsToPublish.add(lesson.chapterId);

    // Delete the old published snapshot if it exists
    if (lesson.publishedContentId) {
      await deleteContentRecord(lesson.publishedContentId, lesson.contentType);
    }

    await prisma.lesson.update({
      where: { id: lessonId },
      data: { publishedContentId: null, status: "PUBLISHED" },
    });

    updated.push(lessonId);
  }

  // Auto-apply chapter titleDrafts for affected chapters
  for (const chapterId of chapterIdsToPublish) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, titleDraft: true },
    });
    if (chapter?.titleDraft) {
      await prisma.chapter.update({
        where: { id: chapterId },
        data: { title: chapter.titleDraft, titleDraft: null },
      });
    }
  }

  return { published: updated };
}

export async function unpublishLessons(instructorId: string, lessonIds: string[]) {
  const updated: string[] = [];

  for (const lessonId of lessonIds) {
    const lesson = await assertLessonOwnership(instructorId, lessonId);
    if (lesson.status !== "PUBLISHED") continue;

    // Snapshot current content for learners
    const snapshotId = await copyContentRecord(lesson.contentId, lesson.contentType);

    await prisma.lesson.update({
      where: { id: lessonId },
      data: { publishedContentId: snapshotId, status: "DRAFT" },
    });

    updated.push(lessonId);
  }

  return { unpublished: updated };
}
