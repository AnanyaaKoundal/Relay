import { API_URL } from "@/lib/config";
import { PaymentDetail, PurchaseRequest, PurchaseResponse, ValidateCouponResult } from "@/types/payment.types";

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

export async function validateCoupon(code: string, courseId: string, subtotal?: number): Promise<ValidateCouponResult> {
  const params = `code=${encodeURIComponent(code)}&courseId=${encodeURIComponent(courseId)}${
    subtotal !== undefined ? `&subtotal=${subtotal}` : ""
  }`;
  return request<ValidateCouponResult>(`/payments/validate-coupon?${params}`);
}
