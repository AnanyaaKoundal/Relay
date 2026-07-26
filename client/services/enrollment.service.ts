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

import type {
  Enrollment,
  EnrollmentDetail,
  EnrollmentLessonContent,
  CompletionResult,
} from "@/types/enrollment.types";

/* ─── API ─── */

export async function listEnrolledCourses(): Promise<Enrollment[]> {
  return request<Enrollment[]>("/enrollments/me");
}

export async function checkEnrollment(courseId: string): Promise<EnrollmentDetail | null> {
  try {
    return await request<EnrollmentDetail>(`/enrollments/${courseId}`);
  } catch {
    return null;
  }
}

export async function enrollInCourse(courseId: string): Promise<Enrollment> {
  return request<Enrollment>(`/enrollments/${courseId}`, {
    method: "POST",
  });
}

export async function getLessonContent(lessonId: string): Promise<EnrollmentLessonContent> {
  return request<EnrollmentLessonContent>(`/enrollments/lesson/${lessonId}/content`);
}

export async function markLessonComplete(lessonId: string): Promise<CompletionResult> {
  return request<CompletionResult>(`/enrollments/lesson/${lessonId}/complete`, {
    method: "POST",
  });
}
