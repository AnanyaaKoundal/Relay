import { prisma } from "../../lib/prisma.js";
import { logger } from "../../utils/logger.js";

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
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              title: true,
              contentType: true,
              durationSeconds: true,
            },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    throw Object.assign(new Error("Course not found"), { statusCode: 404 });
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
      _count: { select: { chapters: true, enrollments: true } },
    },
  });
}

export async function getInstructorCourse(
  instructorId: string,
  courseId: string,
) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, instructorId },
    include: {
      chapters: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: { orderBy: { orderIndex: "asc" } },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    throw Object.assign(new Error("Course not found"), { statusCode: 404 });
  }

  return course;
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
    throw Object.assign(new Error("Course not found"), { statusCode: 404 });
  }

  const updateData: Record<string, unknown> = { ...data };
  if (data.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
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
    throw Object.assign(new Error("Course not found"), { statusCode: 404 });
  }

  await prisma.course.delete({ where: { id: courseId } });
}

/* ─── Helpers ─── */

export async function assertCourseOwnership(
  instructorId: string,
  courseId: string,
) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, instructorId },
    select: { id: true },
  });
  if (!course) {
    throw Object.assign(new Error("Course not found"), { statusCode: 404 });
  }
  return course;
}
