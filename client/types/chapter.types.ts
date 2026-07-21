import type { LessonType } from "./lesson.types";

export type ChapterItem = {
  id: string;
  title: string;
  orderIndex: number;
  courseId: string;
  lessons: ChapterLessonItem[];
};

export type ChapterLessonItem = {
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
