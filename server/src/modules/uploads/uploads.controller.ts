import type { Request, Response } from "express";
import * as uploadsService from "./uploads.service.js";
import { wrap } from "../../middleware/wrap.js";
import { logger } from "../../utils/logger.js";

// ─── Banner Upload ────────────────────────────────────────────

export const presignBanner = wrap(async (req: Request, res: Response) => {
  const { courseId } = req.body ?? {};

  if (!courseId) {
    res.status(400).json({ error: "courseId is required" });
    return;
  }

  const result = await uploadsService.generateBannerPresignedUrls(
    req.user!.userId,
    courseId,
  );
  res.json(result);
});

export const saveBanner = wrap(async (req: Request, res: Response) => {
  const { courseId, bannerUrl } = req.body ?? {};

  if (!courseId || !bannerUrl) {
    res.status(400).json({ error: "courseId and bannerUrl are required" });
    return;
  }

  const result = await uploadsService.saveBannerUrl(
    req.user!.userId,
    courseId,
    bannerUrl,
  );
  res.json(result);
});

// ─── Avatar Upload ────────────────────────────────────────────

export const presignAvatar = wrap(async (req: Request, res: Response) => {
  const result = await uploadsService.generateAvatarPresignedUrls(
    req.user!.userId,
  );
  res.json(result);
});

export const saveAvatar = wrap(async (req: Request, res: Response) => {
  const { avatarUrl } = req.body ?? {};

  const result = await uploadsService.saveAvatarUrl(
    req.user!.userId,
    avatarUrl ?? null,
  );
  res.json(result);
});

export const presignUpload = wrap(async (req: Request, res: Response) => {
  const { fileName, fileType, lessonId } = req.body ?? {};

  if (!fileName || !fileType || !lessonId) {
    res.status(400).json({ error: "fileName, fileType, and lessonId are required" });
    return;
  }

  const result = await uploadsService.generatePresignedUrl(
    req.user!.userId,
    lessonId,
    fileName,
    fileType,
  );
  res.json(result);
});

export const completeUpload = wrap(async (req: Request, res: Response) => {
  const { lessonId, fileKey } = req.body ?? {};

  if (!lessonId || !fileKey) {
    res.status(400).json({ error: "lessonId and fileKey are required" });
    return;
  }

  const result = await uploadsService.completeUpload(
    req.user!.userId,
    lessonId,
    fileKey,
  );
  res.json(result);
});

export const retryTranscode = wrap(async (req: Request, res: Response) => {
  const lessonId = req.params.lessonId as string;

  const result = await uploadsService.retryTranscode(
    req.user!.userId,
    lessonId,
  );
  res.json(result);
});