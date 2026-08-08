import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";
import { logger } from "../../utils/logger.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

export type AuthPayload = {
  userId: string;
  email: string;
  isAdmin: boolean;
  isInstructor: boolean;
};

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash },
    select: { id: true, name: true, email: true, isAdmin: true, isInstructor: true, avatarUrl: true },
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
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    logger.warn(`Invalid password attempt for ${data.email}`);
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
    isInstructor: user.isInstructor,
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin, isInstructor: user.isInstructor, avatarUrl: user.avatarUrl },
    token,
  };
}

export async function updateProfile(userId: string, data: { name: string; phone?: string | null }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: data.name, phone: data.phone ?? null },
    select: { id: true, name: true, email: true, isAdmin: true, isInstructor: true, phone: true, createdAt: true, avatarUrl: true },
  });

  return user;
}

export async function changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError("Current password is incorrect", 400);
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, isAdmin: true, isInstructor: true, phone: true, createdAt: true, avatarUrl: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}
