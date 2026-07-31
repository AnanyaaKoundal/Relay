import { API_URL } from "@/lib/config";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new Error("Unable to reach the server. Check your connection.");
  }

  let data: Record<string, unknown>;
  try {
    data = await res.json();
  } catch {
    throw new Error("Received an invalid response from the server.");
  }

  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Something went wrong");
  }

  return data as T;
}

export interface PurchaseRequest {
  courseId: string;
  billingCountry: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string;
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

export async function getCountry(): Promise<{ country: string | null }> {
  return request<{ country: string | null }>("/payments/country");
}

export async function purchaseCourse(input: PurchaseRequest): Promise<PurchaseResponse> {
  return request<PurchaseResponse>("/payments/purchase", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getPayment(paymentId: string): Promise<PaymentDetail> {
  return request<PaymentDetail>(`/payments/${paymentId}`);
}

export async function validateCoupon(code: string, courseId: string): Promise<ValidateCouponResult> {
  return request<ValidateCouponResult>(`/payments/validate-coupon?code=${encodeURIComponent(code)}&courseId=${courseId}`);
}
