import { Router } from "express";
import type { Request, Response } from "express";
import { presignUpload, completeUpload } from "./uploads.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { logger } from "../../utils/logger.js";

const router = Router();

router.use(authenticate, authorize("instructor"));

router.post("/presign", presignUpload);
router.post("/complete", completeUpload);

router.put("/proxy", async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    res.status(400).json({ error: "Missing url query parameter" });
    return;
  }

  try {
    const headers: Record<string, string> = {};
    if (req.headers["content-type"]) headers["Content-Type"] = req.headers["content-type"];
    if (req.headers["content-length"]) headers["Content-Length"] = req.headers["content-length"];

    const response = await fetch(targetUrl, {
      method: "PUT",
      headers,
      body: req,
      // @ts-expectable duplex needed for streaming body
      duplex: "half",
    } as RequestInit);

    if (!response.ok) {
      const text = await response.text();
      logger.error("S3 proxy failed", { status: response.status, body: text });
      res.status(response.status).json({ error: `S3 returned ${response.status}` });
      return;
    }

    res.json({ message: "Upload complete" });
  } catch (err) {
    logger.error("S3 proxy error", { error: (err as Error).message });
    res.status(500).json({ error: "Proxy upload failed" });
  }
});

export default router;
