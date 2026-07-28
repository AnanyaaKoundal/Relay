import { Router } from "express";
import { presignUpload, completeUpload, proxyUpload, retryTranscode } from "./uploads.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("instructor"));

router.post("/presign", presignUpload);
router.post("/complete", completeUpload);
router.put("/proxy", proxyUpload);
router.post("/retry-transcode/:lessonId", retryTranscode);

export default router;
