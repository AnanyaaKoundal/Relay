import type { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schema.js";
import * as authService from "./auth.service.js";
import { logger } from "../../utils/logger.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export async function getMe(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const user = await authService.getCurrentUser(userId);
    res.json(user);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Failed to fetch current user", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const result = await authService.register(parsed.data);
    res.cookie("token", result.token, COOKIE_OPTIONS);
    logger.info(`User account created: ${result.user.email}`);
    res.status(201).json(result);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("User registration failed", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  try {
    const result = await authService.login(parsed.data);
    res.cookie("token", result.token, COOKIE_OPTIONS);
    res.json(result);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    if (error.statusCode) {
      logger.warn(`Login failed for ${parsed.data.email}: ${error.message}`);
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    logger.error("Login error", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
  res.json({ message: "Logged out successfully" });
}
