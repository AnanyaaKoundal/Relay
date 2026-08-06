import type { UserListResponse, UserDetail, CourseListResponse, AdminCourseDetail, AdminCategory, PaymentListResponse, AdminPaymentDetail, PayoutListResponse } from "@/types/admin.types";
import { getCached, setCache, invalidateCache } from "@/lib/cache";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export async function listUsers(params: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<UserListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  return request(`/admin/users?${query.toString()}`);
}

export async function getUserDetail(userId: string): Promise<UserDetail> {
  const cacheKey = `user-detail:${userId}`;
  const cached = getCached<UserDetail>(cacheKey);
  if (cached) return cached;

  const data = await request<UserDetail>(`/admin/users/${userId}`);
  setCache(cacheKey, data);
  return data;
}

export async function updateUserStatus(userId: string, status: "ACTIVE" | "BANNED") {
  const result = await request(`/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  invalidateCache(`user-detail:${userId}`);
  return result;
}

export async function updateUserRole(userId: string, role: { isAdmin?: boolean; isInstructor?: boolean }) {
  const result = await request(`/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(role),
  });
  invalidateCache(`user-detail:${userId}`);
  return result;
}

// ─── Courses ──────────────────────────────────────────────────

export async function listCourses(params: {
  search?: string;
  status?: string;
  instructorId?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}): Promise<CourseListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.instructorId) query.set("instructorId", params.instructorId);
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  return request(`/admin/courses?${query.toString()}`);
}

export async function getCourseDetail(courseId: string): Promise<AdminCourseDetail> {
  const cacheKey = `course-detail:${courseId}`;
  const cached = getCached<AdminCourseDetail>(cacheKey);
  if (cached) return cached;

  const data = await request<AdminCourseDetail>(`/admin/courses/${courseId}`);
  setCache(cacheKey, data);
  return data;
}

export async function deleteCourse(courseId: string) {
  const result = await request(`/admin/courses/${courseId}`, { method: "DELETE" });
  invalidateCache(`course-detail:${courseId}`);
  return result;
}

// ─── Categories ───────────────────────────────────────────────

export async function listCategories(): Promise<{ categories: AdminCategory[] }> {
  return request("/admin/categories");
}

export async function createCategory(data: { name: string; slug?: string }) {
  return request("/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateCategory(categoryId: string, data: { name?: string; slug?: string }) {
  return request(`/admin/categories/${categoryId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(categoryId: string) {
  return request(`/admin/categories/${categoryId}`, { method: "DELETE" });
}

// ─── Payments ────────────────────────────────────────────────

export async function listPayments(params: {
  search?: string;
  status?: string;
  instructorId?: string;
  page?: number;
  limit?: number;
}): Promise<PaymentListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.instructorId) query.set("instructorId", params.instructorId);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  return request(`/admin/payments?${query.toString()}`);
}

export async function getPaymentDetail(paymentId: string): Promise<AdminPaymentDetail> {
  return request(`/admin/payments/${paymentId}`);
}

export async function refundPayment(paymentId: string, reason?: string) {
  return request(`/admin/payments/${paymentId}/refund`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
}

// ─── Payouts ─────────────────────────────────────────────────

export async function listPayouts(params: {
  status?: string;
  instructorId?: string;
  page?: number;
  limit?: number;
}): Promise<PayoutListResponse> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.instructorId) query.set("instructorId", params.instructorId);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  return request(`/admin/payouts?${query.toString()}`);
}

export async function approvePayout(payoutId: string, notes?: string) {
  return request(`/admin/payouts/${payoutId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
}

export async function rejectPayout(payoutId: string, notes?: string) {
  return request(`/admin/payouts/${payoutId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
}
