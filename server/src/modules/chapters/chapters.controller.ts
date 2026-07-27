import type { Request, Response } from "express";
import {
  createChapterSchema,
  updateChapterSchema,
  reorderChaptersSchema,
  publishChapterTitlesSchema,
} from "./chapters.schema.js";
import * as chaptersService from "./chapters.service.js";
import { wrap } from "../../middleware/wrap.js";
import { logger } from "../../utils/logger.js";

export const listChapters = wrap(async (req: Request, res: Response) => {
  const chapters = await chaptersService.listChapters(
    req.user!.userId,
    String(req.params.courseId),
  );
  res.json(chapters);
});

export const createChapter = wrap(async (req: Request, res: Response) => {
  const parsed = createChapterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const chapter = await chaptersService.createChapter(
    req.user!.userId,
    String(req.params.courseId),
    parsed.data,
  );
  logger.info(`Chapter created: ${chapter.id}`);
  res.status(201).json(chapter);
});

export const updateChapter = wrap(async (req: Request, res: Response) => {
  const parsed = updateChapterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const chapter = await chaptersService.updateChapter(
    req.user!.userId,
    String(req.params.chapterId),
    parsed.data,
  );
  logger.info(`Chapter updated: ${chapter.id}`);
  res.json(chapter);
});

export const deleteChapter = wrap(async (req: Request, res: Response) => {
  const chapterId = String(req.params.chapterId);
  await chaptersService.deleteChapter(req.user!.userId, chapterId);
  logger.info(`Chapter deleted: ${chapterId}`);
  res.json({ message: "Chapter deleted" });
});

export const reorderChapters = wrap(async (req: Request, res: Response) => {
  const parsed = reorderChaptersSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const result = await chaptersService.reorderChapters(
    req.user!.userId,
    String(req.params.courseId),
    parsed.data.chapterIds,
  );
  res.json(result);
});

export const publishChapterTitles = wrap(async (req: Request, res: Response) => {
  const parsed = publishChapterTitlesSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const result = await chaptersService.publishChapterTitles(
    req.user!.userId,
    parsed.data.chapterIds,
  );
  logger.info(`Chapter titles published: ${result.published.length}`);
  res.json(result);
});
