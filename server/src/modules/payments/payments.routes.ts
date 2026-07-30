import { Router } from "express";
import { purchase, getPayment, getCountry } from "./payments.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/country", getCountry); // must be before /:paymentId
router.post("/purchase", purchase);
router.get("/:paymentId", getPayment);

export default router;
