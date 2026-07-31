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
  expiresAt?: string;
}

export async function listCoupons(courseId: string): Promise<Coupon[]> {
  return request<Coupon[]>(`/instructor/courses/${courseId}/coupons`);
}

export async function createCoupon(courseId: string, input: CreateCouponInput): Promise<Coupon> {
  return request<Coupon>(`/instructor/courses/${courseId}/coupons`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCoupon(
  courseId: string,
  couponId: string,
  input: Partial<CreateCouponInput>,
): Promise<Coupon> {
  return request<Coupon>(`/instructor/courses/${courseId}/coupons/${couponId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteCoupon(courseId: string, couponId: string): Promise<void> {
  await request<{ message: string }>(`/instructor/courses/${courseId}/coupons/${couponId}`, {
    method: "DELETE",
  });
}
