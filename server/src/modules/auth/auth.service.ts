import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../utils/logger.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

export type AuthPayload = {
  userId: string;
  email: string;
  isAdmin: boolean;
  isInstructor: boolean;
};

function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw Object.assign(new Error("Email already in use"), { statusCode: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash },
    select: { id: true, name: true, email: true, isAdmin: true, isInstructor: true },
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
    isInstructor: user.isInstructor,
  });

  return { user, token };
}

export async function login(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    logger.warn(`Invalid password attempt for ${data.email}`);
    throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
    isInstructor: user.isInstructor,
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin, isInstructor: user.isInstructor },
    token,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, isAdmin: true, isInstructor: true, phone: true, createdAt: true },
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  }

  return user;
}
