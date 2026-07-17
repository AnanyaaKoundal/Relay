import type { Request, Response } from "express";
import { onboardSchema } from "./instructor.schema.js";
import * as instructorService from "./instructor.service.js";
import { logger } from "../../utils/logger.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export async function onboard(req: Request, res: Response) {
  const parsed = onboardSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const userId = req.user!.userId;
    const result = await instructorService.onboard(userId, parsed.data);
    res.cookie("token", result.token, COOKIE_OPTIONS);
    logger.info(`User ${result.user.email} upgraded to instructor`);
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Instructor onboarding failed", { error: (error as Error).message, stack: (error as Error).stack });
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
