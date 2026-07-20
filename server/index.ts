import "dotenv/config";
import app from "./src/app.js";
import { prisma } from "./src/lib/prisma.js";
import { ensureBucket } from "./src/lib/s3.js";
import { startTranscodeWorker } from "./src/modules/uploads/transcode.worker.js";
import { seedAdmin } from "./prisma/seed.js";
import { logger } from "./src/utils/logger.js";

const port = process.env.PORT ?? 5000;

try {
  await prisma.$connect();
  logger.info("Database connected");
} catch (err) {
  logger.error("Database connection failed", { error: (err as Error).message });
  process.exit(1);
}

try {
  await ensureBucket();
  logger.info(`S3 bucket "${process.env.S3_BUCKET ?? "relay-videos"}" ready`);
} catch (err) {
  logger.warn("S3 not available — video uploads will fail", { error: (err as Error).message });
}

startTranscodeWorker();

await seedAdmin();

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
