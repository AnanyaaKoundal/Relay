import type { Request, Response } from "express";
import * as paymentService from "./payments.service.js";
import { purchaseSchema } from "./payments.schema.js";
import { validateCoupon } from "../instructor/coupons.service.js";
import { wrap } from "../../middleware/wrap.js";
import { logger } from "../../utils/logger.js";

export const purchase = wrap(async (req: Request, res: Response) => {
  const parsed = purchaseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const result = await paymentService.purchaseCourse({
    userId: req.user!.userId,
    ...parsed.data,
  });

  logger.info(`User ${req.user!.userId} purchased course ${parsed.data.courseId} (payment ${result.payment.id})`);
  res.status(201).json(result);
});

export const getPayment = wrap(async (req: Request, res: Response) => {
  const payment = await paymentService.getPayment(req.params.paymentId as string, req.user!.userId);
  res.json(payment);
});

export const getCountry = wrap(async (req: Request, res: Response) => {
  // The real user IP is in x-forwarded-for when behind a proxy (Render, Cloudflare, etc.)
  // It can be "203.0.113.42, 10.0.0.1" (client IP, proxy IP) — we take the first one
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string"
    ? forwarded.split(",")[0]!.trim()
    : req.ip ?? req.socket.remoteAddress ?? "";

  // Localhost IPs can't be geolocated — return null so frontend defaults to "IN"
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1") {
    res.json({ country: null });
    return;
  }

  try {
    // country.is returns { country: "US" } for a given IP — free, no key, HTTPS
    const response = await fetch(`https://api.country.is/${ip}`);
    const data = (await response.json()) as { country: string };
    res.json({ country: data.country });
  } catch {
    // If the API is down or IP is invalid, silently fall back
    res.json({ country: null });
  }
});

export const checkCoupon = wrap(async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const courseId = req.query.courseId as string;

  if (!code || !courseId) {
    res.status(400).json({ error: "code and courseId are required" });
    return;
  }

  const result = await validateCoupon(code, courseId);
  res.json({ valid: true, ...result });
});
