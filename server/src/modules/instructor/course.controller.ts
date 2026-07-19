import type { Request, Response } from "express";
import { createCourseSchema, updateCourseSchema } from "./course.schema.js";
import * as courseService from "./course.service.js";
import { logger } from "../../utils/logger.js";

export async function listCourses(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const courses = await courseService.listCourses(userId);
    res.json(courses);
  } catch (err: unknown) {
    logger.error("Failed to list courses", { error: (err as Error).message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getCourse(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const courseId = String(req.params.courseId);
    const course = await courseService.getCourse(userId, courseId);
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

export async function createCourse(req: Request, res: Response) {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const userId = req.user!.userId;
    const course = await courseService.createCourse(userId, parsed.data);
    logger.info(`Course created: ${course.id} by ${userId}`);
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
    const userId = req.user!.userId;
    const courseId = String(req.params.courseId);
    const course = await courseService.updateCourse(userId, courseId, parsed.data);
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
    const userId = req.user!.userId;
    const courseId = String(req.params.courseId);
    await courseService.deleteCourse(userId, courseId);
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
