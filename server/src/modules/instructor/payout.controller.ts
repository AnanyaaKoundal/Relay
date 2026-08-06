import type { Request, Response } from "express";
import * as payoutService from "./payout.service.js";
import { wrap } from "../../middleware/wrap.js";
import { z } from "zod";

const requestPayoutSchema = z.object({
  accountNumber: z.string().min(1),
  ifscCode: z.string().min(1),
  bankName: z.string().min(1),
  accountHolderName: z.string().min(1),
});

export const getMyBalance = wrap(async (req: Request, res: Response) => {
  const balance = await payoutService.getMyBalance(req.user!.userId);
  res.json(balance);
});

export const requestPayout = wrap(async (req: Request, res: Response) => {
  const parsed = requestPayoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const result = await payoutService.requestPayout(req.user!.userId, parsed.data);
  res.status(201).json(result);
});

export const getMyPayouts = wrap(async (req: Request, res: Response) => {
  const payouts = await payoutService.getMyPayouts(req.user!.userId);
  res.json({ payouts });
});
