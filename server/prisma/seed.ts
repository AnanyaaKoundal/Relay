import { prisma } from "../src/lib/prisma.js";
import { logger } from "../src/utils/logger.js";

export async function seedAdmin() {
  const existing = await prisma.user.findFirst({ where: { isAdmin: true } });
  if (existing) return;

  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const bcrypt = await import("bcrypt");
  const hash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@relay.com",
      passwordHash: hash,
      isAdmin: true,
      isInstructor: false,
    },
  });

  logger.info("Admin user seeded: admin@relay.com");
}
