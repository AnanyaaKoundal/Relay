export type LessonType = "VIDEO" | "TEXT" | "QUIZ";

export type VideoContent = {
  videoUrl: string;
  durationSeconds: number | null;
  resources: { name: string; url: string }[];
};

export type TextContent = {
  body: string;
};

export type QuizOption = { id: string; text: string };
export type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
};
export type QuizContent = {
  questions: QuizQuestion[];
  passThreshold?: number;
};

export type LessonContent = VideoContent | TextContent | QuizContent;

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

export type CreateLessonInput = {
  title: string;
  contentType: LessonType;
  durationSeconds?: number | null;
  isPreview?: boolean;
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
  isPreview?: boolean;
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

export type LessonItem = {
  id: string;
  title: string;
  contentType: LessonType;
  contentId: string;
  orderIndex: number;
  durationSeconds: number | null;
  isPreview: boolean;
  status: "DRAFT" | "PUBLISHED";
  publishedContentId?: string | null;
  chapterId: string;
  content: VideoContentData | TextContentData | QuizContentData | null;
};
