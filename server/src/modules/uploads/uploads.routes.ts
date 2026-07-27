import { Router } from "express";
import { presignUpload, completeUpload, proxyUpload } from "./uploads.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("instructor"));

router.post("/presign", presignUpload);
router.post("/complete", completeUpload);
router.put("/proxy", proxyUpload);

export default router;
