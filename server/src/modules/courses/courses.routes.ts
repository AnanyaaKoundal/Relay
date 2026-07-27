import { Router } from "express";
import {
  browseCourses,
  getPublicCourse,
  listInstructorCourses,
  getInstructorCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getWorkspace
} from "./courses.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

/* ─── Public ─── */
router.get("/", browseCourses);
router.get("/published/:slug", getPublicCourse);

/* ─── Instructor (auth + role required) ─── */
router.get(
  "/instructor",
  authenticate,
  authorize("instructor"),
  listInstructorCourses,
);
router.get(
  "/instructor/:courseId/workspace",
  authenticate,
  authorize("instructor"),
  getWorkspace);
router.get(
  "/instructor/:courseId",
  authenticate,
  authorize("instructor"),
  getInstructorCourse,
);
router.post(
  "/instructor",
  authenticate,
  authorize("instructor"),
  createCourse,
);
router.patch(
  "/instructor/:courseId",
  authenticate,
  authorize("instructor"),
  updateCourse,
);
router.delete(
  "/instructor/:courseId",
  authenticate,
  authorize("instructor"),
  deleteCourse,
);

export default router;
