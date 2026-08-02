export interface PurchaseRequest {
    courseId: string;
    billingCountry: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    couponCode?: string;
    idempotencyKey?: string;
}

export interface ValidateCouponResult {
    valid: boolean;
    couponId: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    label: string | null;
}

export interface PurchaseResponse {
    payment: {
        id: string;
        subtotal: number;
        taxAmount: number;
        totalAmount: number;
        currency: string;
        billingCountry: string;
        gatewayTransactionId: string;
        status: string;
        createdAt: string;
    };
    enrollment: {
        id: string;
        courseId: string;
    };
}

export interface PaymentDetail {
    id: string;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    billingCountry: string;
    gatewayTransactionId: string;
    status: string;
    createdAt: string;
    course: {
        id: string;
        title: string;
        thumbnailUrl: string | null;
    } | null;
}

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "REFUNDED" | "FAILED";

export interface Purchase {
    id: string;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    billingCountry: string;
    gatewayTransactionId: string;
    invoiceUrl: string | null;
    gateway: string;
    status: PaymentStatus;
    createdAt: string;
    couponCode: string | null;
    course: {
        id: string;
        title: string;
        thumbnailUrl: string | null;
    } | null;
}