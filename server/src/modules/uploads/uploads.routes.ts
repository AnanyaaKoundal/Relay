import { Router } from "express";
import { presignUpload, completeUpload, retryTranscode, presignBanner, saveBanner, presignAvatar, saveAvatar } from "./uploads.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("instructor"));

// Video uploads
router.post("/presign", presignUpload);
router.post("/complete", completeUpload);
router.post("/retry-transcode/:lessonId", retryTranscode);

// Banner uploads
router.post("/presign-banner", presignBanner);
router.post("/save-banner", saveBanner);

// Avatar uploads
router.post("/presign-avatar", presignAvatar);
router.post("/save-avatar", saveAvatar);

export default router;
