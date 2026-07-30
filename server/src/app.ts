import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import s3, { S3_BUCKET } from "./lib/s3.js";
import authRoutes from "./modules/auth/auth.routes.js";
import instructorRoutes from "./modules/instructor/instructor.routes.js";
import coursesRoutes from "./modules/courses/courses.routes.js";
import chaptersRoutes from "./modules/chapters/chapters.routes.js";
import lessonsRoutes from "./modules/lessons/lessons.routes.js";
import enrollmentsRoutes from "./modules/enrollments/enrollments.routes.js";
import paymentsRoutes from "./modules/payments/payments.routes.js";
import uploadsRoutes from "./modules/uploads/uploads.routes.js";
import { requestLogger } from "./middleware/request-logger.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ─── S3 file proxy (serves files from RustFS without CORS issues) ───
app.use("/s3", async (req, res) => {
  const key = req.path.slice(1); // remove leading "/"
  try {
    const response = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    if (response.ContentType) res.setHeader("Content-Type", response.ContentType);
    if (response.ContentLength) res.setHeader("Content-Length", String(response.ContentLength));
    res.setHeader("Cache-Control", "public, max-age=86400");
    const body = response.Body;
    if (body && typeof body.transformToByteArray === "function") {
      const bytes = await body.transformToByteArray();
      res.send(Buffer.from(bytes));
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch {
    res.status(404).json({ error: "File not found" });
  }
});

// ─── Routes ────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/instructor", instructorRoutes);        // onboarding only
app.use("/courses", coursesRoutes);              // public browse + instructor CRUD
app.use("/chapters", chaptersRoutes);            // chapter management (instructor)
app.use("/lessons", lessonsRoutes);              // lesson management (instructor)
app.use("/enrollments", enrollmentsRoutes);      // enrollment + lesson content + progress
app.use("/payments", paymentsRoutes);            // purchase + payment history
app.use("/uploads", uploadsRoutes);              // presigned URLs for file uploads

app.use(errorHandler);

export default app;
