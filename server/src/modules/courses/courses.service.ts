import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";

/* ─── Public ─── */

export async function browseCourses(params: {
  search?: string;
  category?: string;
  difficulty?: string;
  free?: boolean;
  page: number;
  limit: number;
}) {
  const where: Record<string, unknown> = { status: "PUBLISHED" };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.category) where.category = params.category;
  if (params.difficulty) where.difficulty = params.difficulty;
  if (params.free === true) where.price = 0;
  if (params.free === false) where.price = { gt: 0 };

  const skip = (params.page - 1) * params.limit;

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: params.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        category: true,
        price: true,
        difficulty: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        instructor: {
          select: { id: true, name: true },
        },
        _count: { select: { chapters: true, enrollments: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      pages: Math.ceil(total / params.limit),
    },
  };
}

export async function getPublicCourse(slug: string) {
  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id: slug }, { title: { equals: slug, mode: "insensitive" } }],
      status: "PUBLISHED",
    },
    include: {
      instructor: {
        select: { id: true, name: true },
      },
      chapters: {
        orderBy: { orderIndex: "asc" },
        where: { lessons: { some: { status: "PUBLISHED" } } },
        include: {
          lessons: {
            where: { status: "PUBLISHED" },
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              title: true,
              contentType: true,
              durationSeconds: true,
              isPreview: true,
            },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return course;
}

/* ─── Instructor ─── */

export async function listInstructorCourses(instructorId: string) {
  return prisma.course.findMany({
    where: { instructorId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      category: true,
      price: true,
      difficulty: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          chapters: true,
          enrollments: true,
        },
      },
      chapters: {
        select: {
          lessons: {
            where: { status: "DRAFT" },
            select: { id: true },
          },
        },
      },
    },
  });
}

export async function createCourse(
  instructorId: string,
  data: {
    title: string;
    description: string;
    category?: string;
    difficulty?: string;
    price?: number;
  },
) {
  return prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category ?? null,
      difficulty: (data.difficulty as any) ?? "BEGINNER",
      price: data.price ?? 0,
      instructorId,
    },
  });
}

export async function updateCourse(
  instructorId: string,
  courseId: string,
  data: {
    title?: string;
    description?: string;
    category?: string;
    difficulty?: string;
    price?: number;
    status?: string;
    thumbnailUrl?: string | null;
  },
) {
  const existing = await prisma.course.findFirst({
    where: { id: courseId, instructorId },
  });
  if (!existing) {
    throw new AppError("Course not found", 404);
  }

  const updateData: Record<string, unknown> = { ...data };

  if (data.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
    // Validate: at least 1 chapter with 1 lesson
    const chapterCount = await prisma.chapter.count({
      where: { courseId, lessons: { some: {} } },
    });
    if (chapterCount === 0) {
      throw new AppError("You need at least one chapter with one lesson before publishing", 400);
    }

    // Validate: no PROCESSING videos
    const processingLessons = await prisma.lesson.findMany({
      where: {
        chapter: { courseId },
        contentType: "VIDEO",
        contentId: { not: "" },
      },
      select: { id: true, contentId: true },
    });

    for (const pl of processingLessons) {
      const vc = await prisma.videoContent.findUnique({
        where: { id: pl.contentId },
        select: { processingStatus: true },
      });
      if (vc) {
        if (vc.processingStatus === "PROCESSING") {
          throw new AppError("Cannot publish while videos are still processing", 400);
        }
        if (vc.processingStatus === "FAILED") {
          throw new AppError("Cannot publish while a video transcoding has failed. Retry transcoding first.", 400);
        }
      }
    }

    // Auto-publish all DRAFT lessons
    await prisma.lesson.updateMany({
      where: { chapter: { courseId }, status: "DRAFT" },
      data: { status: "PUBLISHED", publishedContentId: null },
    });

    // Auto-apply chapter titleDrafts
    const chaptersWithDraft = await prisma.chapter.findMany({
      where: { courseId, titleDraft: { not: null } },
      select: { id: true, titleDraft: true },
    });
    for (const ch of chaptersWithDraft) {
      await prisma.chapter.update({
        where: { id: ch.id },
        data: { title: ch.titleDraft!, titleDraft: null },
      });
    }

    updateData.publishedAt = new Date();
  }

  return prisma.course.update({
    where: { id: courseId },
    data: updateData,
  });
}

export async function deleteCourse(instructorId: string, courseId: string) {
  const existing = await prisma.course.findFirst({
    where: { id: courseId, instructorId },
  });
  if (!existing) {
    throw new AppError("Course not found", 404);
  }

  await prisma.course.delete({ where: { id: courseId } });
}

export async function getInstructorWorkspace(instructorId: string, courseId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, instructorId },
    include: {
      chapters: {
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
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) return null;

  /* ── Batch-fetch processingStatus for video lessons ── */
  const videoContentIds = course.chapters
    .flatMap((ch) => ch.lessons)
    .filter((l) => l.contentType === "VIDEO" && l.contentId)
    .map((l) => l.contentId);

  const videoContents = videoContentIds.length > 0
    ? await prisma.videoContent.findMany({
        where: { id: { in: videoContentIds } },
        select: { id: true, processingStatus: true },
      })
    : [];

  const processingStatusMap = new Map(videoContents.map((vc) => [vc.id, vc.processingStatus]));

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    status: course.status,
    price: course.price,
    difficulty: course.difficulty,
    thumbnailUrl: course.thumbnailUrl,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    enrollmentCount: course._count.enrollments,
    chapters: course.chapters.map((ch) => ({
      id: ch.id,
      courseId: course.id,
      title: ch.title,
      titleDraft: ch.titleDraft,
      orderIndex: ch.orderIndex,
      lessons: ch.lessons.map((l) => ({
        ...l,
        chapterId: ch.id,
        content: null,
        processingStatus: l.contentType === "VIDEO" ? (processingStatusMap.get(l.contentId) ?? null) : null,
      })),
    })),
  };
}
