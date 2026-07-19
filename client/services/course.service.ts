import type { CourseListItem, CourseDetail, CreateCourseInput, UpdateCourseInput } from "@/types/course.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
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

export async function getMyCourses(): Promise<CourseListItem[]> {
  return request<CourseListItem[]>("/courses/instructor");
}

export async function getCourse(courseId: string): Promise<CourseDetail> {
  return request<CourseDetail>(`/courses/instructor/${courseId}`);
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
