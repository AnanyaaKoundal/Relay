import { Router } from "express";
import {
  listLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  publishLessons,
  unpublishLessons,
} from "./lessons.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

// All lesson routes require auth + instructor role
router.use(authenticate, authorize("instructor"));

router.post("/publish", publishLessons);
router.post("/unpublish", unpublishLessons);

router.get("/chapter/:chapterId", listLessons);
router.post("/chapter/:chapterId", createLesson);
router.put("/chapter/:chapterId/reorder", reorderLessons);
router.get("/:lessonId", getLesson);
router.patch("/:lessonId", updateLesson);
router.delete("/:lessonId", deleteLesson);

export default router;
