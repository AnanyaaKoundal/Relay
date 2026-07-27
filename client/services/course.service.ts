import type {
  CourseListItem,
  CourseDetail,
  CreateCourseInput,
  UpdateCourseInput,
  PublicCourse,
  PublicCourseDetail,
  BrowseResult,
  CourseWorkspace,
} from "@/types/course.types";
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

/* ─── API ─── */

export async function browseCourses(params?: {
  search?: string;
  category?: string;
  difficulty?: string;
  free?: boolean;
  page?: number;
  limit?: number;
}): Promise<BrowseResult> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.category) qs.set("category", params.category);
  if (params?.difficulty) qs.set("difficulty", params.difficulty);
  if (params?.free !== undefined) qs.set("free", String(params.free));
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return request<BrowseResult>(`/courses${query ? `?${query}` : ""}`);
}

export async function getPublicCourse(slug: string): Promise<PublicCourseDetail> {
  return request<PublicCourseDetail>(`/courses/published/${encodeURIComponent(slug)}`);
}

/* ─── Instructor ─── */

export async function getMyCourses(): Promise<CourseListItem[]> {
  return request<CourseListItem[]>("/courses/instructor");
}

export async function createCourse(input: CreateCourseInput): Promise<CourseDetail> {
  return request<CourseDetail>("/courses/instructor", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCourse(courseId: string, input: UpdateCourseInput): Promise<CourseDetail> {
  return request<CourseDetail>(`/courses/instructor/${courseId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteCourse(courseId: string): Promise<void> {
  await request<{ message: string }>(`/courses/instructor/${courseId}`, { method: "DELETE" });
}

export async function getCourseWorkspace(courseId: string): Promise<CourseWorkspace> {
  return await request<CourseWorkspace>(`/courses/instructor/${courseId}/workspace`, { method: "GET" })
}