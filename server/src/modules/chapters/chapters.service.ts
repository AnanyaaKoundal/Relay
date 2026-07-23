import { prisma } from "../../lib/prisma.js";
import { assertCourseOwnership } from "../courses/courses.service.js";

export async function listChapters(instructorId: string, courseId: string) {
  await assertCourseOwnership(instructorId, courseId);

  return prisma.chapter.findMany({
    where: { courseId },
    orderBy: { orderIndex: "asc" },
    include: {
      lessons: {
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          title: true,
          contentType: true,
          contentId: true,
          durationSeconds: true,
          orderIndex: true,
          isPreview: true,
          status: true,
          publishedContentId: true,
        },
      },
    },
  });
}

export async function createChapter(
  instructorId: string,
  courseId: string,
  data: { title: string; orderIndex?: number },
) {
  await assertCourseOwnership(instructorId, courseId);

  const maxOrder = await prisma.chapter.aggregate({
    where: { courseId },
    _max: { orderIndex: true },
  });

  return prisma.chapter.create({
    data: {
      title: data.title,
      orderIndex: data.orderIndex ?? (maxOrder._max.orderIndex ?? -1) + 1,
      courseId,
    },
  });
}

export async function updateChapter(
  instructorId: string,
  chapterId: string,
  data: { title?: string; orderIndex?: number },
) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true, courseId: true },
  });
  if (!chapter) {
    throw Object.assign(new Error("Chapter not found"), { statusCode: 404 });
  }

  await assertCourseOwnership(instructorId, chapter.courseId);

  // Check if course is published — if so, title changes go to titleDraft
  const course = await prisma.course.findUnique({
    where: { id: chapter.courseId },
    select: { status: true },
  });

  const updateData: Record<string, unknown> = {};
  if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex;
  if (data.title !== undefined) {
    if (course?.status === "PUBLISHED") {
      updateData.titleDraft = data.title;
    } else {
      updateData.title = data.title;
    }
  }

  return prisma.chapter.update({
    where: { id: chapterId },
    data: updateData,
  });
}

export async function deleteChapter(instructorId: string, chapterId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true, courseId: true },
  });
  if (!chapter) {
    throw Object.assign(new Error("Chapter not found"), { statusCode: 404 });
  }

  await assertCourseOwnership(instructorId, chapter.courseId);

  await prisma.chapter.delete({ where: { id: chapterId } });
}

export async function reorderChapters(
  instructorId: string,
  courseId: string,
  chapterIds: string[],
) {
  await assertCourseOwnership(instructorId, courseId);

  await prisma.$transaction(
    chapterIds.map((id, index) =>
      prisma.chapter.update({
        where: { id },
        data: { orderIndex: index },
      }),
    ),
  );

  return { message: "Chapters reordered" };
}

export async function publishChapterTitles(instructorId: string, chapterIds: string[]) {
  const updated: string[] = [];

  for (const chapterId of chapterIds) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, courseId: true, titleDraft: true },
    });
    if (!chapter) continue;
    await assertCourseOwnership(instructorId, chapter.courseId);
    if (!chapter.titleDraft) continue;

    await prisma.chapter.update({
      where: { id: chapterId },
      data: { title: chapter.titleDraft, titleDraft: null },
    });

    updated.push(chapterId);
  }

  return { published: updated };
}
