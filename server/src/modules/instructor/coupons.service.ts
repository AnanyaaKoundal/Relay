import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";
import { assertCourseOwnership } from "../../lib/ownership.js";

interface CreateCouponInput {
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    maxUses: number;
    isPublic: boolean;
    label?: string;
    expiresAt?: string;
}

export async function listCoupons(courseId: string, userId: string) {
    await assertCourseOwnership(userId, courseId);
    return prisma.coupon.findMany({
        where: { courseId },
        orderBy: { createdAt: "desc" },
    });
}

async function assertOnlyOnePublicCoupon(courseId: string, excludeId?: string) {
    if (excludeId) {
        const existing = await prisma.coupon.findFirst({
            where: { courseId, isPublic: true, id: { not: excludeId } },
        });
        if (existing) throw new AppError("Only one public coupon allowed per course. Make the other private first.", 400);
    } else {
        const existing = await prisma.coupon.findFirst({
            where: { courseId, isPublic: true },
        });
        if (existing) throw new AppError("Only one public coupon allowed per course.", 400);
    }
}

export async function createCoupon(courseId: string, userId: string, input: CreateCouponInput) {
    await assertCourseOwnership(userId, courseId);

    if (!["PERCENTAGE", "FIXED"].includes(input.discountType)) {
        throw new AppError("Invalid discount type", 400);
    }
    if (input.discountValue <= 0) {
        throw new AppError("Discount value must be positive", 400);
    }
    if (input.maxUses < 0) {
        throw new AppError("maxUses cannot be negative", 400);
    }
    if (input.discountType === "PERCENTAGE" && input.discountValue > 100) {
        throw new AppError("Percentage discount cannot exceed 100", 400);
    }

    if (input.isPublic) {
        await assertOnlyOnePublicCoupon(courseId);
    }

    return prisma.coupon.create({
        data: {
            courseId,
            code: input.code.toUpperCase(),
            discountType: input.discountType,
            discountValue: input.discountValue,
            maxUses: input.maxUses,
            isPublic: input.isPublic,
            label: input.label || null,
            expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        },
    });
}

export async function updateCoupon(
    couponId: string,
    courseId: string,
    userId: string,
    data: Partial<CreateCouponInput>,
) {
    await assertCourseOwnership(userId, courseId);

    const existing = await prisma.coupon.findFirst({
        where: { id: couponId, courseId },
    });
    if (!existing) throw new AppError("Coupon not found", 404);

    const becomingPublic = data.isPublic === true && !existing.isPublic;
    if (becomingPublic) {
        await assertOnlyOnePublicCoupon(courseId, couponId);
    }

    return prisma.coupon.update({
        where: { id: couponId },
        data: {
            ...(data.code && { code: data.code.toUpperCase() }),
            ...(data.discountType && { discountType: data.discountType }),
            ...(data.discountValue !== undefined && { discountValue: data.discountValue }),
            ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
            ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
            ...(data.label !== undefined && { label: data.label }),
            ...(data.expiresAt !== undefined && {
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            }),
        },
    });
}

export async function deleteCoupon(couponId: string, courseId: string, userId: string) {
    await assertCourseOwnership(userId, courseId);

    const existing = await prisma.coupon.findFirst({
        where: { id: couponId, courseId },
    });
    if (!existing) throw new AppError("Coupon not found", 404);

    await prisma.coupon.delete({ where: { id: couponId } });
}

export async function validateCoupon(code: string, courseId: string) {
    const coupon = await prisma.coupon.findUnique({
        where: { courseId_code: { courseId, code: code.toUpperCase() } },
    });

    if (!coupon) throw new AppError("Invalid coupon code", 404);
    if (!coupon.isActive) throw new AppError("This coupon is no longer active", 400);
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
        throw new AppError("This coupon has reached its usage limit", 400);
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        throw new AppError("This coupon has expired", 400);
    }

    return {
        couponId: coupon.id,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        label: coupon.label,
    };
}