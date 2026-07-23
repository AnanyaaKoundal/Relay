import type { Request, Response } from "express";
import {
  createChapterSchema,
  updateChapterSchema,
  reorderChaptersSchema,
  publishChapterTitlesSchema,
} from "./chapters.schema.js";
import * as chaptersService from "./chapters.service.js";
import { logger } from "../../utils/logger.js";

export async function listChapters(req: Request, res: Response) {
  try {
    const chapters = await chaptersService.listChapters(
      req.user!.userId,
      String(req.params.courseId),
    );
    res.json(chapters);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to list chapters", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function createChapter(req: Request, res: Response) {
  const parsed = createChapterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const chapter = await chaptersService.createChapter(
      req.user!.userId,
      String(req.params.courseId),
      parsed.data,
    );
    logger.info(`Chapter created: ${chapter.id}`);
    res.status(201).json(chapter);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to create chapter", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function updateChapter(req: Request, res: Response) {
  const parsed = updateChapterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const chapter = await chaptersService.updateChapter(
      req.user!.userId,
      String(req.params.chapterId),
      parsed.data,
    );
    logger.info(`Chapter updated: ${chapter.id}`);
    res.json(chapter);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to update chapter", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function deleteChapter(req: Request, res: Response) {
  try {
    const chapterId = String(req.params.chapterId);
    await chaptersService.deleteChapter(req.user!.userId, chapterId);
    logger.info(`Chapter deleted: ${chapterId}`);
    res.json({ message: "Chapter deleted" });
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to delete chapter", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function reorderChapters(req: Request, res: Response) {
  const parsed = reorderChaptersSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const result = await chaptersService.reorderChapters(
      req.user!.userId,
      String(req.params.courseId),
      parsed.data.chapterIds,
    );
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to reorder chapters", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function publishChapterTitles(req: Request, res: Response) {
  const parsed = publishChapterTitlesSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const result = await chaptersService.publishChapterTitles(
      req.user!.userId,
      parsed.data.chapterIds,
    );
    logger.info(`Chapter titles published: ${result.published.length}`);
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to publish chapter titles", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}
