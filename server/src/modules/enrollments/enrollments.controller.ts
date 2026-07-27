import type { Request, Response } from "express";
import * as enrollmentService from "./enrollments.service.js";
import { courseIdParamSchema, lessonIdParamSchema } from "./enrollments.schema.js";
import { wrap } from "../../middleware/wrap.js";
import { logger } from "../../utils/logger.js";

export const enrollInCourse = wrap(async (req: Request, res: Response) => {
  const parsed = courseIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid params" });
    return;
  }

  const enrollment = await enrollmentService.enrollInCourse(
    req.user!.userId,
    parsed.data.courseId,
  );
  logger.info(`User ${req.user!.userId} enrolled in course ${parsed.data.courseId}`);
  res.status(201).json(enrollment);
});

export const checkEnrollment = wrap(async (req: Request, res: Response) => {
  const parsed = courseIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid params" });
    return;
  }

  const enrollment = await enrollmentService.checkEnrollment(
    req.user!.userId,
    parsed.data.courseId,
  );
  res.json(enrollment);
});

export const listEnrolledCourses = wrap(async (req: Request, res: Response) => {
  const enrollments = await enrollmentService.listEnrolledCourses(req.user!.userId);
  res.json(enrollments);
});

export const getLessonContent = wrap(async (req: Request, res: Response) => {
  const parsed = lessonIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid params" });
    return;
  }

  const content = await enrollmentService.getLessonContent(
    req.user!.userId,
    parsed.data.lessonId,
  );
  res.json(content);
});

export const markLessonComplete = wrap(async (req: Request, res: Response) => {
  const parsed = lessonIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid params" });
    return;
  }

  const result = await enrollmentService.markLessonComplete(
    req.user!.userId,
    parsed.data.lessonId,
  );
  res.json(result);
});
