import { Router } from "express";
import { onboard } from "./instructor.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import couponsRoutes from "./coupons.routes.js";
import { getCourseStats, getCoursesAnalytics, getEarningsStats, getOverviewStats } from "./stats.controller.js";

const router = Router();

// Instructor onboarding — the only thing this module handles
router.post("/onboard", authenticate, onboard);

router.use("/courses/:courseId/coupons", couponsRoutes);

router.get("/stats/overview", authenticate, getOverviewStats);
router.get("/stats/courses", authenticate, getCoursesAnalytics);
router.get("/stats/course/:courseId", authenticate, getCourseStats);
router.get("/stats/earnings", authenticate, getEarningsStats);

export default router;
