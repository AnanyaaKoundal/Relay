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

export type VideoContentData = {
  videoUrl: string;
  durationSeconds: number | null;
  s3Key: string;
};

export type TextContentData = {
  body: string;
};

export type QuizContentData = {
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }[];
};

export type LessonItem = {
  id: string;
  title: string;
  contentType: LessonType;
  contentId: string;
  orderIndex: number;
  durationSeconds: number | null;
  chapterId: string;
  content: VideoContentData | TextContentData | QuizContentData | null;
};

export type CreateLessonInput = {
  title: string;
  contentType: LessonType;
  durationSeconds?: number | null;
  videoUrl?: string;
  s3Key?: string;
  body?: string;
  questions?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }[];
};

export type UpdateLessonInput = {
  title?: string;
  orderIndex?: number;
  durationSeconds?: number | null;
  videoUrl?: string | null;
  s3Key?: string | null;
  body?: string;
  questions?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }[];
};

/* ─── API ─── */

export async function listLessons(chapterId: string): Promise<LessonItem[]> {
  return request<LessonItem[]>(`/lessons/chapter/${chapterId}`);
}

export async function getLesson(lessonId: string): Promise<LessonItem> {
  return request<LessonItem>(`/lessons/${lessonId}`);
}

export async function createLesson(chapterId: string, input: CreateLessonInput): Promise<LessonItem> {
  return request<LessonItem>(`/lessons/chapter/${chapterId}`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateLesson(lessonId: string, input: UpdateLessonInput): Promise<LessonItem> {
  return request<LessonItem>(`/lessons/${lessonId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await request<{ message: string }>(`/lessons/${lessonId}`, { method: "DELETE" });
}

export async function reorderLessons(chapterId: string, lessonIds: string[]): Promise<{ message: string }> {
  return request<{ message: string }>(`/lessons/chapter/${chapterId}/reorder`, {
    method: "PUT",
    body: JSON.stringify({ lessonIds }),
  });
}
