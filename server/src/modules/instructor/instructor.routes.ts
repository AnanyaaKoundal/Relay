import { Router } from "express";
import { onboard, getProfile, updateProfile, getCategories } from "./instructor.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import couponsRoutes from "./coupons.routes.js";
import { getCourseStats, getCoursesAnalytics, getEarningsStats, getOverviewStats } from "./stats.controller.js";
import { getMyBalance, requestPayout, getMyPayouts } from "./payout.controller.js";

const router = Router();

// Instructor onboarding
router.post("/onboard", authenticate, onboard);

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

// Categories (for course creation)
router.get("/categories", getCategories);

router.use("/courses/:courseId/coupons", couponsRoutes);

router.get("/stats/overview", authenticate, getOverviewStats);
router.get("/stats/courses", authenticate, getCoursesAnalytics);
router.get("/stats/course/:courseId", authenticate, getCourseStats);
router.get("/stats/earnings", authenticate, getEarningsStats);

// Payouts
router.get("/balance", authenticate, getMyBalance);
router.post("/payouts/request", authenticate, requestPayout);
router.get("/payouts", authenticate, getMyPayouts);

export default router;
