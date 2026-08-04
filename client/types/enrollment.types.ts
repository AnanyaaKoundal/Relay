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
  lastAccessedAt: string | null;
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

export type EnrollmentLessonContent = {
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
      explanation?: string;
    }[];
    passThreshold?: number;
  } | null;
};

export type CompletionResult = {
  lessonId: string;
  completed: boolean;
  progressPercent: number;
  courseCompleted: boolean;
};

export type QuizAttemptResult = {
  attemptId: string;
  score: number;
  total: number;
  passed: boolean;
  perQuestionCorrect: boolean[];
  passThreshold: number;
  lessonId: string;
  completed: boolean;
  progressPercent: number;
  courseCompleted: boolean;
};

export type QuizAttemptSummary = {
  id: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  createdAt: string;
};

export type QuizAttemptsResponse = {
  attempts: QuizAttemptSummary[];
  bestScore: number;
  bestTotal: number;
};
