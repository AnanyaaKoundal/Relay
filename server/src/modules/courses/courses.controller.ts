import type { Request, Response } from "express";
import { browseCoursesSchema, createCourseSchema, updateCourseSchema } from "./courses.schema.js";
import * as courseService from "./courses.service.js";
import { wrap } from "../../middleware/wrap.js";
import { logger } from "../../utils/logger.js";

/* ─── Public ─── */

export const browseCourses = wrap(async (req: Request, res: Response) => {
  const parsed = browseCoursesSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query" });
    return;
  }

  const result = await courseService.browseCourses(parsed.data);
  res.json(result);
});

export const getPublicCourse = wrap(async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  const course = await courseService.getPublicCourse(slug);
  res.json(course);
});

/* ─── Instructor ─── */

export const listInstructorCourses = wrap(async (req: Request, res: Response) => {
  const courses = await courseService.listInstructorCourses(req.user!.userId);
  res.json(courses);
});

export const createCourse = wrap(async (req: Request, res: Response) => {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const course = await courseService.createCourse(req.user!.userId, parsed.data);
  logger.info(`Course created: ${course.id} by ${req.user!.userId}`);
  res.status(201).json(course);
});

export const updateCourse = wrap(async (req: Request, res: Response) => {
  const parsed = updateCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const course = await courseService.updateCourse(
    req.user!.userId,
    String(req.params.courseId),
    parsed.data,
  );
  logger.info(`Course updated: ${course.id}`);
  res.json(course);
});

export const deleteCourse = wrap(async (req: Request, res: Response) => {
  const courseId = String(req.params.courseId);
  await courseService.deleteCourse(req.user!.userId, courseId);
  logger.info(`Course deleted: ${courseId}`);
  res.json({ message: "Course deleted" });
});

export const getWorkspace = wrap(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const courseId = String(req.params.courseId);
  const course = await courseService.getInstructorWorkspace(userId, courseId);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.json(course);
});
