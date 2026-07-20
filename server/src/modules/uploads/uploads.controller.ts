import type { Request, Response } from "express";
import * as uploadsService from "./uploads.service.js";
import { logger } from "../../utils/logger.js";

export async function presignUpload(req: Request, res: Response) {
  const { fileName, fileType, lessonId } = req.body ?? {};

  if (!fileName || !fileType || !lessonId) {
    res.status(400).json({ error: "fileName, fileType, and lessonId are required" });
    return;
  }

  try {
    const result = await uploadsService.generatePresignedUrl(
      req.user!.userId,
      lessonId,
      fileName,
      fileType,
    );
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to generate presigned URL", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function completeUpload(req: Request, res: Response) {
  const { lessonId, fileKey } = req.body ?? {};

  if (!lessonId || !fileKey) {
    res.status(400).json({ error: "lessonId and fileKey are required" });
    return;
  }

  try {
    const result = await uploadsService.completeUpload(
      req.user!.userId,
      lessonId,
      fileKey,
    );
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to complete upload", { error: error.message });
    res.status(500).json({ error: "Something went wrong" });
  }
}
