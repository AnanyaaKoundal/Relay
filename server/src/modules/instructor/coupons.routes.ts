import { Router } from "express";
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from "./coupons.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router({ mergeParams: true });
router.use(authenticate, authorize("instructor"));

router.get("/", listCoupons);
router.post("/", createCoupon);
router.patch("/:couponId", updateCoupon);
router.delete("/:couponId", deleteCoupon);

export default router;