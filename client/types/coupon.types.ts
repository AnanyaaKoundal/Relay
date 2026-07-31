export interface Coupon {
    id: string;
    courseId: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    maxUses: number;
    usedCount: number;
    isActive: boolean;
    isPublic: boolean;
    label: string | null;
    startsAt: string | null;
    expiresAt: string | null;
    createdAt: string;
}

export interface CreateCouponInput {
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    maxUses: number;
    isPublic: boolean;
    label?: string;
    startsAt?: string;
    expiresAt?: string;
}