import { Router } from "express";
import { onboard } from "./instructor.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import couponsRoutes from "./coupons.routes.js";

const router = Router();

// Instructor onboarding — the only thing this module handles
router.post("/onboard", authenticate, onboard);

router.use("/courses/:courseId/coupons", couponsRoutes);

export default router;
