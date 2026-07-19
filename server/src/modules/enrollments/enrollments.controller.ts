import type { Request, Response } from "express";
import * as enrollmentService from "./enrollments.service.js";
import { logger } from "../../utils/logger.js";

export async function enrollInCourse(req: Request, res: Response) {
  try {
    const courseId = String(req.params.courseId);
    const enrollment = await enrollmentService.enrollInCourse(
      req.user!.userId,
      courseId,
    );
    logger.info(
      `User ${req.user!.userId} enrolled in course ${courseId}`,
    );
    res.status(201).json(enrollment);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to enroll in course", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function checkEnrollment(req: Request, res: Response) {
  try {
    const courseId = String(req.params.courseId);
    const enrollment = await enrollmentService.checkEnrollment(
      req.user!.userId,
      courseId,
    );
    res.json(enrollment);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to check enrollment", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function listEnrolledCourses(req: Request, res: Response) {
  try {
    const enrollments = await enrollmentService.listEnrolledCourses(
      req.user!.userId,
    );
    res.json(enrollments);
  } catch (err: unknown) {
    logger.error("Failed to list enrolled courses", {
      error: (err as Error).message,
    });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getLessonContent(req: Request, res: Response) {
  try {
    const lessonId = String(req.params.lessonId);
    const content = await enrollmentService.getLessonContent(
      req.user!.userId,
      lessonId,
    );
    res.json(content);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to get lesson content", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function markLessonComplete(req: Request, res: Response) {
  try {
    const lessonId = String(req.params.lessonId);
    const result = await enrollmentService.markLessonComplete(
      req.user!.userId,
      lessonId,
    );
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to mark lesson complete", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}
