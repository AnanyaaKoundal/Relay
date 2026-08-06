import { Router } from "express";
import {
  listUsers, getUserDetail, updateUserStatus, updateUserRole,
  listCourses, getCourseDetail, deleteCourse,
  listCategories, createCategory, updateCategory, deleteCategory,
  listPayments, getPaymentDetail, refundPayment,
  listPayouts, approvePayout, rejectPayout, getInstructorBalance,
} from "./admin.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate);
router.use(authorize("admin"));

// Users
router.get("/users", listUsers);
router.get("/users/:userId", getUserDetail);
router.patch("/users/:userId/status", updateUserStatus);
router.patch("/users/:userId/role", updateUserRole);

// Courses
router.get("/courses", listCourses);
router.get("/courses/:courseId", getCourseDetail);
router.delete("/courses/:courseId", deleteCourse);

// Categories
router.get("/categories", listCategories);
router.post("/categories", createCategory);
router.patch("/categories/:categoryId", updateCategory);
router.delete("/categories/:categoryId", deleteCategory);

// Payments
router.get("/payments", listPayments);
router.get("/payments/:paymentId", getPaymentDetail);
router.post("/payments/:paymentId/refund", refundPayment);

// Payouts
router.get("/payouts", listPayouts);
router.post("/payouts/:payoutId/approve", approvePayout);
router.post("/payouts/:payoutId/reject", rejectPayout);

// Instructor Balance
router.get("/instructors/:instructorId/balance", getInstructorBalance);

export default router;
