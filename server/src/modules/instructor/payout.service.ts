import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";

export async function getMyBalance(userId: string) {
  const balance = await prisma.instructorBalance.findUnique({
    where: { userId },
    select: {
      pendingBalance: true,
      totalEarned: true,
      lastPayoutAt: true,
    },
  });

  if (!balance) {
    return { pendingBalance: 0, totalEarned: 0, lastPayoutAt: null };
  }

  return {
    pendingBalance: Number(balance.pendingBalance),
    totalEarned: Number(balance.totalEarned),
    lastPayoutAt: balance.lastPayoutAt,
  };
}

export async function requestPayout(userId: string, bankDetails: {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
}) {
  const balance = await prisma.instructorBalance.findUnique({
    where: { userId },
    select: { pendingBalance: true },
  });

  if (!balance || Number(balance.pendingBalance) <= 0) {
    throw new AppError("No pending balance available for payout", 400);
  }

  const MIN_PAYOUT = 500;
  if (Number(balance.pendingBalance) < MIN_PAYOUT) {
    throw new AppError(`Minimum payout amount is ₹${MIN_PAYOUT}`, 400);
  }

  const existingPending = await prisma.payout.findFirst({
    where: { instructorId: userId, status: "PENDING" },
  });

  if (existingPending) {
    throw new AppError("You already have a pending payout request", 409);
  }

  const payout = await prisma.payout.create({
    data: {
      instructorId: userId,
      amount: balance.pendingBalance,
      bankDetails,
    },
    select: {
      id: true,
      amount: true,
      status: true,
      createdAt: true,
    },
  });

  return { ...payout, amount: Number(payout.amount) };
}

export async function getMyPayouts(userId: string) {
  const payouts = await prisma.payout.findMany({
    where: { instructorId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amount: true,
      status: true,
      notes: true,
      createdAt: true,
      processedAt: true,
    },
  });

  return payouts.map((p) => ({
    ...p,
    amount: Number(p.amount),
  }));
}
