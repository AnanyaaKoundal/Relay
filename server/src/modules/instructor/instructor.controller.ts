import type { Request, Response } from "express";
import { onboardSchema } from "./instructor.schema.js";
import * as instructorService from "./instructor.service.js";
import { wrap } from "../../middleware/wrap.js";
import { logger } from "../../utils/logger.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const onboard = wrap(async (req: Request, res: Response) => {
  const parsed = onboardSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const userId = req.user!.userId;
  const result = await instructorService.onboard(userId, parsed.data);
  res.cookie("token", result.token, COOKIE_OPTIONS);
  logger.info(`User ${result.user.email} upgraded to instructor`);
  res.json(result);
});

export const getProfile = wrap(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await instructorService.getProfile(userId);
  res.json(result);
});

export const updateProfile = wrap(async (req: Request, res: Response) => {
  const parsed = onboardSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const userId = req.user!.userId;
  const result = await instructorService.updateProfile(userId, parsed.data);
  res.json(result);
});

export const getCategories = wrap(async (req: Request, res: Response) => {
  const categories = await instructorService.getCategories();
  res.json(categories);
});
