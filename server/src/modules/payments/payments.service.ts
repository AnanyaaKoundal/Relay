import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";
import { Prisma, type Payment } from "@prisma/client";
import { validateCoupon } from "../instructor/coupons.service.js";
import crypto from "crypto";
import type { PurchaseInput } from "./payments.schema.js";

async function getTaxRates(): Promise<Record<string, number>> {
  const settings = await prisma.platformSettings.findUnique({
    where: { id: "default" },
  });
  if (settings?.data && typeof settings.data === "object" && "taxRates" in settings.data) {
    return settings.data.taxRates as Record<string, number>;
  }
  // Fallback defaults
  return { IN: 18, GB: 20, US: 0, CA: 13, AU: 10, SG: 9, DE: 19, FR: 20, AE: 5 };
}


function formatPayment(payment: Payment, enrollment: { id: string; courseId: string }) {
  return {
    payment: {
      id: payment.id,
      subtotal: Number(payment.subtotal),
      discountAmount: Number(payment.discountAmount),
      taxAmount: Number(payment.taxAmount),
      totalAmount: Number(payment.totalAmount),
      currency: payment.currency,
      billingCountry: payment.billingCountry,
      gatewayTransactionId: payment.gatewayTransactionId,
      status: payment.status,
      createdAt: payment.createdAt,
    },
    enrollment: { id: enrollment.id, courseId: enrollment.courseId },
  };
}

export async function purchaseCourse(input: PurchaseInput) {
  const { userId, courseId, billingCountry, subtotal, taxAmount, totalAmount, couponCode, idempotencyKey } = input;

  if (idempotencyKey) {
    const existing = await prisma.payment.findFirst({
      where: { userId, idempotencyKey },
      include: { enrollments: { select: { id: true, courseId: true } } },
    });
    if (existing?.enrollments[0]) {
      return formatPayment(existing, existing.enrollments[0]);
    }
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, status: "PUBLISHED" },
    select: { id: true, title: true, price: true },
  });

  if (!course) {
    throw new AppError("Course not found or not published", 404);
  }

  if (Number(course.price) === 0) {
    throw new AppError("This course is free. Use /enrollments to enroll.", 400);
  }

  if (Number(course.price) !== subtotal) {
    throw new AppError("Subtotal does not match course price", 400);
  }

  let discountAmount = 0;
  let couponId: string | null = null;

  if (couponCode) {
    const coupon = await validateCoupon(couponCode, courseId);

    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = Math.round(subtotal * (coupon.discountValue / 100) * 100) / 100;
    } else {
      if (coupon.discountValue > subtotal) {
        throw new AppError("This coupon exceeds the course price", 400);
      }
      discountAmount = coupon.discountValue;
    }

    couponId = coupon.couponId;
  }

  const taxableBase = Math.round((subtotal - discountAmount) * 100) / 100;
  const taxRates = await getTaxRates();
  const expectedTax = Math.round(taxableBase * ((taxRates[billingCountry] ?? 0) / 100) * 100) / 100;
  if (Math.abs(expectedTax - taxAmount) > 0.01) {
    throw new AppError("Tax amount does not match expected rate", 400);
  }

  const expectedTotal = Math.round((taxableBase + taxAmount) * 100) / 100;
  if (Math.abs(expectedTotal - totalAmount) > 0.01) {
    throw new AppError("Total amount does not match subtotal - discount + tax", 400);
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing) {
    throw new AppError("Already enrolled in this course", 409);
  }

  const gatewayTransactionId = `MOCK_TXN_${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    const [payment, enrollment] = await prisma.$transaction(async (tx) => {
      if (couponId) {
        const coupon = await tx.coupon.findUnique({ where: { id: couponId } });
        if (!coupon || !coupon.isActive) {
          throw new AppError("This coupon is no longer active", 400);
        }
        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
          throw new AppError("This coupon has reached its usage limit", 400);
        }
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
          throw new AppError("This coupon has expired", 400);
        }
        if (coupon.discountType === "FIXED" && Number(coupon.discountValue) > subtotal) {
          throw new AppError("This coupon exceeds the course price", 400);
        }
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      const payment = await tx.payment.create({
        data: {
          userId,
          subtotal,
          discountAmount,
          taxAmount,
          totalAmount,
          currency: "INR",
          billingCountry,
          gateway: "MOCK",
          gatewayTransactionId,
          status: "SUCCEEDED",
          couponId,
          idempotencyKey,
        },
      });

      const enrollment = await tx.enrollment.create({
        data: {
          userId,
          courseId,
          paymentId: payment.id,
        },
        include: {
          course: { select: { id: true, title: true } },
        },
      });

      return [payment, enrollment] as const;
    });

    return formatPayment(payment, enrollment);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002" && idempotencyKey) {
      const winner = await prisma.payment.findFirst({
        where: { userId, idempotencyKey },
        include: { enrollments: { select: { id: true, courseId: true } } },
      });
      if (winner?.enrollments[0]) {
        return formatPayment(winner, winner.enrollments[0]);
      }
    }
    throw e;
  }
}

export async function getPayment(paymentId: string, userId: string) {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId },
    include: {
      enrollments: {
        include: {
          course: { select: { id: true, title: true, bannerUrl: true } },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  return {
    id: payment.id,
    subtotal: Number(payment.subtotal),
    discountAmount: Number(payment.discountAmount),
    taxAmount: Number(payment.taxAmount),
    totalAmount: Number(payment.totalAmount),
    currency: payment.currency,
    billingCountry: payment.billingCountry,
    gatewayTransactionId: payment.gatewayTransactionId,
    status: payment.status,
    createdAt: payment.createdAt,
    course: payment.enrollments[0]?.course ?? null,
  };
}

export async function listMyPayments(userId: string) {
  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      enrollments: {
        include: {
          course: { select: { id: true, title: true, bannerUrl: true } },
        },
      },
    },
  });

  const couponIds = payments
    .map((p) => p.couponId)
    .filter((id): id is string => id !== null);
  const coupons = couponIds.length
    ? await prisma.coupon.findMany({
        where: { id: { in: couponIds } },
        select: { id: true, code: true },
      })
    : [];
  const codeById = new Map(coupons.map((c) => [c.id, c.code]));

  return payments.map((payment) => ({
    id: payment.id,
    subtotal: Number(payment.subtotal),
    discountAmount: Number(payment.discountAmount),
    taxAmount: Number(payment.taxAmount),
    totalAmount: Number(payment.totalAmount),
    currency: payment.currency,
    billingCountry: payment.billingCountry,
    gatewayTransactionId: payment.gatewayTransactionId,
    invoiceUrl: payment.invoiceUrl,
    gateway: payment.gateway,
    status: payment.status,
    createdAt: payment.createdAt,
    couponCode: payment.couponId ? (codeById.get(payment.couponId) ?? null) : null,
    course: payment.enrollments[0]?.course ?? null,
  }));
}
