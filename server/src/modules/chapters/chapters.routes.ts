import { Router } from "express";
import {
  listChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  reorderChapters,
  publishChapterTitles,
} from "./chapters.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

// All chapter routes require auth + instructor role
router.use(authenticate, authorize("instructor"));

router.post("/publish-title", publishChapterTitles);

router.get("/course/:courseId", listChapters);
router.post("/course/:courseId", createChapter);
router.put("/course/:courseId/reorder", reorderChapters);
router.patch("/:chapterId", updateChapter);
router.delete("/:chapterId", deleteChapter);

export default router;
