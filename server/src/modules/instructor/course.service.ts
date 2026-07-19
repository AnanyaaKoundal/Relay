import { prisma } from "../../lib/prisma.js";
import { logger } from "../../utils/logger.js";

export async function listCourses(instructorId: string) {
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

export async function getCourse(instructorId: string, courseId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, instructorId },
    include: {
      chapters: { orderBy: { orderIndex: "asc" }, include: { lessons: { orderBy: { orderIndex: "asc" } } } },
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
  data: { title: string; description: string; category?: string | undefined; difficulty?: string | undefined; price?: number | undefined },
) {
  return prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category ?? null,
      difficulty: data.difficulty as any ?? "BEGINNER",
      price: data.price ?? 0,
      instructorId,
    },
  });
}

export async function updateCourse(
  instructorId: string,
  courseId: string,
  data: {
    title?: string | undefined;
    description?: string | undefined;
    category?: string | undefined;
    difficulty?: string | undefined;
    price?: number | undefined;
    status?: string | undefined;
    thumbnailUrl?: string | null | undefined;
  },
) {
  const existing = await prisma.course.findFirst({
    where: { id: courseId, instructorId },
  });
  if (!existing) {
    throw Object.assign(new Error("Course not found"), { statusCode: 404 });
  }

  const updateData: any = { ...data };
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
