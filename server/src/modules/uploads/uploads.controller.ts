import type { Request, Response } from "express";
import * as uploadsService from "./uploads.service.js";
import { wrap } from "../../middleware/wrap.js";
import { logger } from "../../utils/logger.js";

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

export const proxyUpload = wrap(async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    res.status(400).json({ error: "Missing url query parameter" });
    return;
  }

  const headers: Record<string, string> = {};
  if (req.headers["content-type"]) headers["Content-Type"] = req.headers["content-type"];
  if (req.headers["content-length"]) headers["Content-Length"] = req.headers["content-length"];

  const response = await fetch(targetUrl, {
    method: "PUT",
    headers,
    body: req as unknown as BodyInit,
    duplex: "half",
  } as RequestInit);

  if (!response.ok) {
    const text = await response.text();
    logger.error("S3 proxy failed", { status: response.status, body: text });
    res.status(response.status).json({ error: `S3 returned ${response.status}` });
    return;
  }

  res.json({ message: "Upload complete" });
});
