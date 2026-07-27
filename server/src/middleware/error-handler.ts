import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/app-error.js";
import { logger } from "../utils/logger.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "Invalid JSON in request body" });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Backwards compat: legacy Object.assign errors
  const legacy = err as Error & { statusCode?: number };
  if (legacy.statusCode) {
    res.status(legacy.statusCode).json({ error: err.message });
    return;
  }

  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: "Something went wrong. Please try again." });
}
