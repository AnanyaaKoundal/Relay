import type { Request, Response } from "express";
import {
  createLessonSchema,
  updateLessonSchema,
  reorderLessonsSchema,
  publishLessonsSchema,
  unpublishLessonsSchema,
} from "./lessons.schema.js";
import * as lessonsService from "./lessons.service.js";
import { wrap } from "../../middleware/wrap.js";
import { logger } from "../../utils/logger.js";

export const listLessons = wrap(async (req: Request, res: Response) => {
  const lessons = await lessonsService.listLessons(
    req.user!.userId,
    String(req.params.chapterId),
  );
  res.json(lessons);
});

export const getLesson = wrap(async (req: Request, res: Response) => {
  const lesson = await lessonsService.getLesson(
    req.user!.userId,
    String(req.params.lessonId),
  );
  res.json(lesson);
});

export const createLesson = wrap(async (req: Request, res: Response) => {
  const parsed = createLessonSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const lesson = await lessonsService.createLesson(
    req.user!.userId,
    String(req.params.chapterId),
    parsed.data,
  );
  logger.info(`Lesson created: ${lesson?.id}`);
  res.status(201).json(lesson);
});

export const updateLesson = wrap(async (req: Request, res: Response) => {
  const parsed = updateLessonSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const lesson = await lessonsService.updateLesson(
    req.user!.userId,
    String(req.params.lessonId),
    parsed.data,
  );
  logger.info(`Lesson updated: ${lesson?.id}`);
  res.json(lesson);
});

export const deleteLesson = wrap(async (req: Request, res: Response) => {
  const lessonId = String(req.params.lessonId);
  await lessonsService.deleteLesson(req.user!.userId, lessonId);
  logger.info(`Lesson deleted: ${lessonId}`);
  res.json({ message: "Lesson deleted" });
});

export const reorderLessons = wrap(async (req: Request, res: Response) => {
  const parsed = reorderLessonsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const result = await lessonsService.reorderLessons(
    req.user!.userId,
    String(req.params.chapterId),
    parsed.data.lessonIds,
  );
  res.json(result);
});

export const publishLessons = wrap(async (req: Request, res: Response) => {
  const parsed = publishLessonsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const result = await lessonsService.publishLessons(
    req.user!.userId,
    parsed.data.lessonIds,
  );
  logger.info(`Lessons published: ${result.published.length}`);
  res.json(result);
});

export const unpublishLessons = wrap(async (req: Request, res: Response) => {
  const parsed = unpublishLessonsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const result = await lessonsService.unpublishLessons(
    req.user!.userId,
    parsed.data.lessonIds,
  );
  logger.info(`Lessons unpublished: ${result.unpublished.length}`);
  res.json(result);
});

export const getLessonProcessingStatus = wrap(async (req: Request, res: Response) => {
  const result = await lessonsService.getLessonProcessingStatus(String(req.params.courseId));
  res.json(result);
});
