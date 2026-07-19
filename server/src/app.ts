import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import instructorRoutes from "./modules/instructor/instructor.routes.js";
import coursesRoutes from "./modules/courses/courses.routes.js";
import chaptersRoutes from "./modules/chapters/chapters.routes.js";
import lessonsRoutes from "./modules/lessons/lessons.routes.js";
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

// ─── Routes ────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/instructor", instructorRoutes);        // onboarding only
app.use("/courses", coursesRoutes);              // public browse + instructor CRUD
app.use("/chapters", chaptersRoutes);            // chapter management (instructor)
app.use("/lessons", lessonsRoutes);              // lesson management (instructor)

app.use(errorHandler);

export default app;
