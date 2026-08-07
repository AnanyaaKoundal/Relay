import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";

const PLATFORM_FEE_PERCENT = 10;

async function calculateBalance(userId: string) {
  // Calculate total earned from successful payments for instructor's courses
  const enrollments = await prisma.enrollment.findMany({
    where: { course: { instructorId: userId } },
    select: { payment: { select: { totalAmount: true, status: true } } },
  });

  const totalEarned = enrollments
    .filter((e) => e.payment?.status === "SUCCEEDED")
    .reduce((sum, e) => sum + Number(e.payment?.totalAmount ?? 0), 0) * (1 - PLATFORM_FEE_PERCENT / 100);

  // Calculate total paid out from completed payouts
  const completedPayouts = await prisma.payout.aggregate({
    where: { instructorId: userId, status: "COMPLETED" },
    _sum: { amount: true },
  });

  const totalPaidOut = Number(completedPayouts._sum.amount ?? 0);
  const pendingBalance = Math.round((totalEarned - totalPaidOut) * 100) / 100;

  // Get last payout date
  const lastPayout = await prisma.payout.findFirst({
    where: { instructorId: userId, status: "COMPLETED" },
    orderBy: { processedAt: "desc" },
    select: { processedAt: true },
  });

  return {
    pendingBalance: Math.max(0, pendingBalance),
    totalEarned: Math.round(totalEarned * 100) / 100,
    lastPayoutAt: lastPayout?.processedAt ?? null,
  };
}

export async function getMyBalance(userId: string) {
  return calculateBalance(userId);
}

export async function requestPayout(userId: string, bankDetails: {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
}) {
  const balance = await calculateBalance(userId);

  if (balance.pendingBalance <= 0) {
    throw new AppError("No pending balance available for payout", 400);
  }

  const MIN_PAYOUT = 500;
  if (balance.pendingBalance < MIN_PAYOUT) {
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
