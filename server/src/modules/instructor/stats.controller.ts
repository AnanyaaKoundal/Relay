import type { Request, Response } from "express";
import * as statsService from "./stats.service.js";
import { wrap } from "../../middleware/wrap.js";

export const getOverviewStats = wrap(async (req: Request, res: Response) => {
    const userId = req.user!.userId as string;
    const overviewStats = await statsService.getOverviewStats(
        req.user!.userId,
        req.query.range as string | undefined,
        req.query.from as string | undefined,
        req.query.to as string | undefined,
    );
    res.json(overviewStats);
})

export const getCourseStats = wrap(async (req: Request, res: Response) => {
    const userId = req.user!.userId as string;
    const courseId = req.params.courseId as string;
    const courseStats = await statsService.getCourseStats(
        userId,
        courseId,
        req.query.range as string | undefined,
        req.query.from as string | undefined,
        req.query.to as string | undefined,
    )
    res.json(courseStats);
})

export const getCoursesAnalytics = wrap(async (req: Request, res: Response) => {
    const coursesStats = await statsService.getCoursesAnalytics(
        req.user!.userId,
        req.query.range as string | undefined,
        req.query.from as string | undefined,
        req.query.to as string | undefined,
    )
    res.json(coursesStats);
})

export const getEarningsStats = wrap(async (req: Request, res: Response) => {
    const earningsStats = await statsService.getEarningsStats(
        req.user!.userId,
        req.query.range as string | undefined,
        req.query.from as string | undefined,
        req.query.to as string | undefined,
    )
    res.json(earningsStats);
})