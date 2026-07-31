import { Router } from "express";
import { purchase, getPayment, getCountry, checkCoupon } from "./payments.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { rateLimit } from "../../middleware/rate-limit.js";

const router = Router();

router.use(authenticate);

router.get("/country", getCountry); // must be before /:paymentId
router.get("/validate-coupon", rateLimit({ windowMs: 10 * 60 * 1000, max: 30 }), checkCoupon);
router.post("/purchase", rateLimit({ windowMs: 10 * 60 * 1000, max: 10 }), purchase);
router.get("/:paymentId", getPayment);

export default router;
