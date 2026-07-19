import { Router } from "express";
import {
  enrollInCourse,
  checkEnrollment,
  listEnrolledCourses,
  getLessonContent,
  markLessonComplete,
} from "./enrollments.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

// All enrollment routes require authentication
router.use(authenticate);

router.get("/me", listEnrolledCourses);
router.post("/:courseId", enrollInCourse);
router.get("/:courseId", checkEnrollment);

// Lesson content + progress (enrollment-gated in service)
router.get("/lesson/:lessonId/content", getLessonContent);
router.post("/lesson/:lessonId/complete", markLessonComplete);

export default router;
