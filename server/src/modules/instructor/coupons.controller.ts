import type { Request, Response } from "express";
import * as couponService from "./coupons.service.js";
import { wrap } from "../../middleware/wrap.js";

export const listCoupons = wrap(async (req: Request, res: Response) => {
    const courseId = req.params.courseId as string;
    const coupons = await couponService.listCoupons(courseId, req.user!.userId);
    res.json(coupons);
});

export const createCoupon = wrap(async (req: Request, res: Response) => {
    const courseId = req.params.courseId as string;
    const coupon = await couponService.createCoupon(courseId, req.user!.userId, req.body);
    res.status(201).json(coupon);
});

export const updateCoupon = wrap(async (req: Request, res: Response) => {
    const courseId = req.params.courseId as string;
    const coupon = await couponService.updateCoupon(
        req.params.couponId as string,
        courseId,
        req.user!.userId,
        req.body,
    );
    res.json(coupon);
});

export const deleteCoupon = wrap(async (req: Request, res: Response) => {
    const courseId = req.params.courseId as string;
    await couponService.deleteCoupon(req.params.couponId as string, courseId, req.user!.userId);
    res.status(204).end();
});