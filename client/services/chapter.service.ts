import type { LessonType } from "@/components/lesson-editors";

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

/* ─── Types ─── */

export type ChapterItem = {
  id: string;
  title: string;
  orderIndex: number;
  courseId: string;
  lessons: LessonItem[];
};

export type LessonItem = {
  id: string;
  title: string;
  contentType: LessonType;
  contentId: string;
  orderIndex: number;
  durationSeconds: number | null;
  isPreview: boolean;
  chapterId: string;
  content: Record<string, unknown> | null;
};

/* ─── API ─── */

export async function listChapters(courseId: string): Promise<ChapterItem[]> {
  return request<ChapterItem[]>(`/chapters/course/${courseId}`);
}

export async function createChapter(courseId: string, title: string): Promise<ChapterItem> {
  return request<ChapterItem>(`/chapters/course/${courseId}`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function updateChapter(chapterId: string, data: { title?: string; orderIndex?: number }): Promise<ChapterItem> {
  return request<ChapterItem>(`/chapters/${chapterId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteChapter(chapterId: string): Promise<void> {
  await request<{ message: string }>(`/chapters/${chapterId}`, { method: "DELETE" });
}

export async function reorderChapters(courseId: string, chapterIds: string[]): Promise<{ message: string }> {
  return request<{ message: string }>(`/chapters/course/${courseId}/reorder`, {
    method: "PUT",
    body: JSON.stringify({ chapterIds }),
  });
}
