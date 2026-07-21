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
