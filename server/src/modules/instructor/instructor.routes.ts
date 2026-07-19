import { Router } from "express";
import { onboard } from "./instructor.controller.js";
import { listCourses, getCourse, createCourse, updateCourse, deleteCourse } from "./course.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

router.post("/onboard", authenticate, onboard);

router.get("/courses", authenticate, listCourses);
router.get("/courses/:courseId", authenticate, getCourse);
router.post("/courses", authenticate, createCourse);
router.patch("/courses/:courseId", authenticate, updateCourse);
router.delete("/courses/:courseId", authenticate, deleteCourse);

export default router;
