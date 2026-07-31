import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";
import { validateCoupon } from "../instructor/coupons.service.js";
import crypto from "crypto";

export const TAX_RATES: Record<string, number> = {
  IN: 18,
  GB: 20,
  US: 0,
  CA: 13,
  AU: 10,
  SG: 9,
  DE: 19,
  FR: 20,
  AE: 5,
};

interface PurchaseInput {
  userId: string;
  courseId: string;
  billingCountry: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string;
}

export async function purchaseCourse(input: PurchaseInput) {
  const { userId, courseId, billingCountry, subtotal, taxAmount, totalAmount, couponCode } = input;

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
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    couponId = coupon.couponId;
  }

  const taxableBase = Math.round((subtotal - discountAmount) * 100) / 100;
  const expectedTax = Math.round(taxableBase * ((TAX_RATES[billingCountry] ?? 0) / 100) * 100) / 100;
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

    return [payment, enrollment];
  });

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
    enrollment: {
      id: enrollment.id,
      courseId: enrollment.courseId,
    },
  };
}

export async function getPayment(paymentId: string, userId: string) {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId },
    include: {
      enrollments: {
        include: {
          course: { select: { id: true, title: true, thumbnailUrl: true } },
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
