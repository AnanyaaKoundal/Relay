import { Router } from "express";
import { onboard } from "./instructor.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

// Instructor onboarding — the only thing this module handles
router.post("/onboard", authenticate, onboard);

export default router;
