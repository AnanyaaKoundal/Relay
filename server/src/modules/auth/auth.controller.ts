import type { Request, Response } from "express";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "./auth.schema.js";
import * as authService from "./auth.service.js";
import { wrap } from "../../middleware/wrap.js";
import { logger } from "../../utils/logger.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const getMe = wrap(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.userId);
  res.setHeader("Cache-Control", "no-store");
  res.json(user);
});

export const updateMe = wrap(async (req: Request, res: Response) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const user = await authService.updateProfile(req.user!.userId, parsed.data);
  res.json(user);
});

export const changePassword = wrap(async (req: Request, res: Response) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  await authService.changePassword(req.user!.userId, parsed.data);
  res.json({ message: "Password changed successfully" });
});

export const register = wrap(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const result = await authService.register(parsed.data);
  res.cookie("token", result.token, COOKIE_OPTIONS);
  logger.info(`User account created: ${result.user.email}`);
  res.status(201).json(result);
});

export const login = wrap(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const result = await authService.login(parsed.data);
  res.cookie("token", result.token, COOKIE_OPTIONS);
  res.json(result);
});

export const logout = wrap(async (_req: Request, res: Response) => {
  res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
  res.json({ message: "Logged out successfully" });
});
