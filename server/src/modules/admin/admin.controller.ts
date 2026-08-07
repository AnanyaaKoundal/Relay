import type { Request, Response } from "express";
import * as adminService from "./admin.service.js";
import {
  listUsersSchema, updateUserStatusSchema, updateUserRoleSchema,
  listCoursesSchema, createCategorySchema, updateCategorySchema,
  listPaymentsSchema, refundPaymentSchema, listPayoutsSchema, processPayoutSchema,
  updateSettingsSchema,
} from "./admin.schema.js";
import { wrap } from "../../middleware/wrap.js";

// ─── Users ────────────────────────────────────────────────────

export const listUsers = wrap(async (req: Request, res: Response) => {
  const parsed = listUsersSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query" });
    return;
  }
  const result = await adminService.listUsers(parsed.data);
  res.json(result);
});

export const getUserDetail = wrap(async (req: Request, res: Response) => {
  const user = await adminService.getUserDetail(req.params.userId as string);
  res.json(user);
});

export const updateUserStatus = wrap(async (req: Request, res: Response) => {
  const parsed = updateUserStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const user = await adminService.updateUserStatus(req.params.userId as string, parsed.data.status);
  res.json(user);
});

export const updateUserRole = wrap(async (req: Request, res: Response) => {
  const parsed = updateUserRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const user = await adminService.updateUserRole(req.params.userId as string, parsed.data);
  res.json(user);
});

// ─── Courses ──────────────────────────────────────────────────

export const listCourses = wrap(async (req: Request, res: Response) => {
  const parsed = listCoursesSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query" });
    return;
  }
  const result = await adminService.listCourses(parsed.data);
  res.json(result);
});

export const getCourseDetail = wrap(async (req: Request, res: Response) => {
  const course = await adminService.getCourseDetail(req.params.courseId as string);
  res.json(course);
});

export const deleteCourse = wrap(async (req: Request, res: Response) => {
  await adminService.deleteCourse(req.params.courseId as string);
  res.json({ success: true });
});

// ─── Categories ───────────────────────────────────────────────

export const listCategories = wrap(async (req: Request, res: Response) => {
  const categories = await adminService.listCategories();
  res.json({ categories });
});

export const createCategory = wrap(async (req: Request, res: Response) => {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const category = await adminService.createCategory(parsed.data);
  res.status(201).json(category);
});

export const updateCategory = wrap(async (req: Request, res: Response) => {
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const category = await adminService.updateCategory(req.params.categoryId as string, parsed.data);
  res.json(category);
});

export const deleteCategory = wrap(async (req: Request, res: Response) => {
  await adminService.deleteCategory(req.params.categoryId as string);
  res.json({ success: true });
});

// ─── Payments ────────────────────────────────────────────────

export const listPayments = wrap(async (req: Request, res: Response) => {
  const parsed = listPaymentsSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query" });
    return;
  }
  const result = await adminService.listPayments(parsed.data);
  res.json(result);
});

export const getPaymentDetail = wrap(async (req: Request, res: Response) => {
  const payment = await adminService.getPaymentDetail(req.params.paymentId as string);
  res.json(payment);
});

export const refundPayment = wrap(async (req: Request, res: Response) => {
  const parsed = refundPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const result = await adminService.refundPayment(req.params.paymentId as string, parsed.data.reason);
  res.json(result);
});

// ─── Payouts ─────────────────────────────────────────────────

export const listPayouts = wrap(async (req: Request, res: Response) => {
  const parsed = listPayoutsSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query" });
    return;
  }
  const result = await adminService.listPayouts(parsed.data);
  res.json(result);
});

export const approvePayout = wrap(async (req: Request, res: Response) => {
  const parsed = processPayoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const result = await adminService.approvePayout(req.params.payoutId as string, parsed.data.notes);
  res.json(result);
});

export const rejectPayout = wrap(async (req: Request, res: Response) => {
  const parsed = processPayoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const result = await adminService.rejectPayout(req.params.payoutId as string, parsed.data.notes);
  res.json(result);
});

export const getInstructorBalance = wrap(async (req: Request, res: Response) => {
  const balance = await adminService.getInstructorBalance(req.params.instructorId as string);
  res.json(balance);
});

// ─── Settings ─────────────────────────────────────────────────

export const getSettings = wrap(async (req: Request, res: Response) => {
  const settings = await adminService.getSettings();
  res.json(settings);
});

export const updateSettings = wrap(async (req: Request, res: Response) => {
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }
  const settings = await adminService.updateSettings(parsed.data);
  res.json(settings);
});

// ─── Dashboard & Analytics ────────────────────────────────────

export const getDashboardStats = wrap(async (req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  res.json(stats);
});

export const getAnalytics = wrap(async (req: Request, res: Response) => {
  const range = req.query.range as string | undefined;
  const analytics = await adminService.getAnalytics(range);
  res.json(analytics);
});
