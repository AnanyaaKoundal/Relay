import { API_URL } from "@/lib/config";
import type {
  InstructorProfile,
  InstructorProfileData,
  StudioCourseAnalytics,
  StudioCoursesAnalytics,
  StudioEarnings,
  StudioOverview,
  StudioRange,
} from "@/types/studio.types";

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

export async function getStudioOverview(
  range: StudioRange = "30d",
  from?: string,
  to?: string,
): Promise<StudioOverview> {
  const params = new URLSearchParams({ range });
  if (range === "custom") {
    if (from) params.set("from", from);
    if (to) params.set("to", to);
  }
  return request<StudioOverview>(`/instructor/stats/overview?${params.toString()}`);
}

export async function getCourseAnalytics(
  courseId: string,
  range: StudioRange = "30d",
  from?: string,
  to?: string,
): Promise<StudioCourseAnalytics> {
  const params = new URLSearchParams({ range });
  if (range === "custom") {
    if (from) params.set("from", from);
    if (to) params.set("to", to);
  }
  return request<StudioCourseAnalytics>(
    `/instructor/stats/course/${courseId}?${params.toString()}`,
  );
}

export async function getCoursesAnalytics(
  range: StudioRange = "30d",
  from?: string,
  to?: string,
): Promise<StudioCoursesAnalytics> {
  const params = new URLSearchParams({ range });
  if (range === "custom") {
    if (from) params.set("from", from);
    if (to) params.set("to", to);
  }
  return request<StudioCoursesAnalytics>(`/instructor/stats/courses?${params.toString()}`);
}

export async function getEarningsStats(
  range: StudioRange = "30d",
  from?: string,
  to?: string,
): Promise<StudioEarnings> {
  const params = new URLSearchParams({ range });
  if (range === "custom") {
    if (from) params.set("from", from);
    if (to) params.set("to", to);
  }
  return request<StudioEarnings>(`/instructor/stats/earnings?${params.toString()}`);
}

export async function getInstructorProfile(): Promise<InstructorProfile> {
  return request<InstructorProfile>("/instructor/profile");
}

export async function updateInstructorProfile(
  data: Partial<InstructorProfileData>,
): Promise<InstructorProfile> {
  return request<InstructorProfile>("/instructor/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ─── Payouts ─────────────────────────────────────────────────

import type { InstructorBalance, InstructorPayout } from "@/types/studio.types";

export async function getMyBalance(): Promise<InstructorBalance> {
  return request<InstructorBalance>("/instructor/balance");
}

export async function requestPayout(bankDetails: {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
}): Promise<InstructorPayout> {
  return request<InstructorPayout>("/instructor/payouts/request", {
    method: "POST",
    body: JSON.stringify(bankDetails),
  });
}

export async function getMyPayouts(): Promise<{ payouts: InstructorPayout[] }> {
  return request<{ payouts: InstructorPayout[] }>("/instructor/payouts");
}

// ─── Categories ───────────────────────────────────────────────

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>("/instructor/categories");
}
