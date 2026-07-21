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

export type EnrollmentCourse = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  category: string | null;
  difficulty: string | null;
  instructor: { id: string; name: string } | null;
  chapters: { lessons: { id: string }[] }[];
};

export type Enrollment = {
  id: string;
  courseId: string;
  progressPercent: number;
  status: "ACTIVE" | "COMPLETED";
  enrolledAt: string;
  course: EnrollmentCourse;
  progress: { lessonId: string; completedAt: string }[];
};

export type EnrollmentDetail = Enrollment & {
  course: EnrollmentCourse & {
    chapters: {
      id: string;
      title: string;
      orderIndex: number;
      lessons: {
        id: string;
        title: string;
        contentType: string;
        durationSeconds: number | null;
        orderIndex: number;
        isPreview: boolean;
      }[];
    }[];
  };
};

export type LessonContent = {
  id: string;
  title: string;
  contentType: "VIDEO" | "TEXT" | "QUIZ";
  durationSeconds: number | null;
  isPreview: boolean;
  content: {
    videoUrl?: string;
    hlsUrl?: string;
    processingStatus?: string;
    body?: string;
    questions?: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }[];
  } | null;
};

export type CompletionResult = {
  lessonId: string;
  completed: boolean;
  progressPercent: number;
  courseCompleted: boolean;
};

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

export async function getLessonContent(lessonId: string): Promise<LessonContent> {
  return request<LessonContent>(`/enrollments/lesson/${lessonId}/content`);
}

export async function markLessonComplete(lessonId: string): Promise<CompletionResult> {
  return request<CompletionResult>(`/enrollments/lesson/${lessonId}/complete`, {
    method: "POST",
  });
}
