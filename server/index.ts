import "dotenv/config";
import app from "./src/app.js";
import { prisma } from "./src/lib/prisma.js";
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

await seedAdmin();

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
