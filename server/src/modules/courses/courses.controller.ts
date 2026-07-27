import type { Request, Response } from "express";
import { browseCoursesSchema, createCourseSchema, updateCourseSchema } from "./courses.schema.js";
import * as courseService from "./courses.service.js";
import { logger } from "../../utils/logger.js";

/* ─── Public ─── */

export async function browseCourses(req: Request, res: Response) {
  const parsed = browseCoursesSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query" });
    return;
  }

  try {
    const result = await courseService.browseCourses(parsed.data);
    res.json(result);
  } catch (err: unknown) {
    logger.error("Failed to browse courses", { error: (err as Error).message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getPublicCourse(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);
    const course = await courseService.getPublicCourse(slug);
    res.json(course);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to get course", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

/* ─── Instructor ─── */

export async function listInstructorCourses(req: Request, res: Response) {
  try {
    const courses = await courseService.listInstructorCourses(req.user!.userId);
    res.json(courses);
  } catch (err: unknown) {
    logger.error("Failed to list instructor courses", { error: (err as Error).message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getInstructorCourse(req: Request, res: Response) {
  try {
    const course = await courseService.getInstructorCourse(
      req.user!.userId,
      String(req.params.courseId),
    );
    res.json(course);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to get instructor course", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function createCourse(req: Request, res: Response) {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const course = await courseService.createCourse(req.user!.userId, parsed.data);
    logger.info(`Course created: ${course.id} by ${req.user!.userId}`);
    res.status(201).json(course);
  } catch (err: unknown) {
    logger.error("Failed to create course", { error: (err as Error).message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function updateCourse(req: Request, res: Response) {
  const parsed = updateCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const course = await courseService.updateCourse(
      req.user!.userId,
      String(req.params.courseId),
      parsed.data,
    );
    logger.info(`Course updated: ${course.id}`);
    res.json(course);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to update course", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function deleteCourse(req: Request, res: Response) {
  try {
    const courseId = String(req.params.courseId);
    await courseService.deleteCourse(req.user!.userId, courseId);
    logger.info(`Course deleted: ${courseId}`);
    res.json({ message: "Course deleted" });
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to delete course", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getWorkspace(req: Request, res: Response) {
  const userId = req.user!.userId;
  const courseId = String(req.params.courseId);
  const course = await courseService.getInstructorWorkspace(userId, courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });
  res.json(course);
}