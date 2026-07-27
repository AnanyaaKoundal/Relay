import type { Request, Response } from "express";
import {
  createLessonSchema,
  updateLessonSchema,
  reorderLessonsSchema,
  publishLessonsSchema,
  unpublishLessonsSchema,
} from "./lessons.schema.js";
import * as lessonsService from "./lessons.service.js";
import { logger } from "../../utils/logger.js";

export async function listLessons(req: Request, res: Response) {
  try {
    const lessons = await lessonsService.listLessons(
      req.user!.userId,
      String(req.params.chapterId),
    );
    res.json(lessons);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to list lessons", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getLesson(req: Request, res: Response) {
  try {
    const lesson = await lessonsService.getLesson(
      req.user!.userId,
      String(req.params.lessonId),
    );
    res.json(lesson);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to get lesson", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function createLesson(req: Request, res: Response) {
  const parsed = createLessonSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const lesson = await lessonsService.createLesson(
      req.user!.userId,
      String(req.params.chapterId),
      parsed.data,
    );
    logger.info(`Lesson created: ${lesson?.id}`);
    res.status(201).json(lesson);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to create lesson", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function updateLesson(req: Request, res: Response) {
  const parsed = updateLessonSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const lesson = await lessonsService.updateLesson(
      req.user!.userId,
      String(req.params.lessonId),
      parsed.data,
    );
    logger.info(`Lesson updated: ${lesson?.id}`);
    res.json(lesson);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to update lesson", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function deleteLesson(req: Request, res: Response) {
  try {
    const lessonId = String(req.params.lessonId);
    await lessonsService.deleteLesson(req.user!.userId, lessonId);
    logger.info(`Lesson deleted: ${lessonId}`);
    res.json({ message: "Lesson deleted" });
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to delete lesson", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function reorderLessons(req: Request, res: Response) {
  const parsed = reorderLessonsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const result = await lessonsService.reorderLessons(
      req.user!.userId,
      String(req.params.chapterId),
      parsed.data.lessonIds,
    );
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to reorder lessons", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function publishLessons(req: Request, res: Response) {
  const parsed = publishLessonsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const result = await lessonsService.publishLessons(
      req.user!.userId,
      parsed.data.lessonIds,
    );
    logger.info(`Lessons published: ${result.published.length}`);
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to publish lessons", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function unpublishLessons(req: Request, res: Response) {
  const parsed = unpublishLessonsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const result = await lessonsService.unpublishLessons(
      req.user!.userId,
      parsed.data.lessonIds,
    );
    logger.info(`Lessons unpublished: ${result.unpublished.length}`);
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to unpublish lessons", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getLessonProcessingStatus(req: Request, res: Response) {
  try {
    const result = await lessonsService.getLessonProcessingStatus(String(req.params.courseId));

    logger.info(`Lessons in processing for course id ${req.params.courseId} = ${result.length}`);
    res.json(result);

  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to unpublish lessons", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}