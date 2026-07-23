import type { LessonType, LessonContent, VideoContent, TextContent, QuizContent } from "@/types/lesson.types";
import type { ChapterItem } from "@/types/chapter.types";
import { Video, FileText, HelpCircle, Play } from "lucide-react";

export type { LessonType, LessonContent, VideoContent, TextContent, QuizContent };

export type Lesson = {
  id: string;
  title: string;
  contentType: LessonType;
  durationSeconds: number | null;
  isPreview: boolean;
  status: "DRAFT" | "PUBLISHED";
  processingStatus?: string;
  content: LessonContent | null;
};

export type Chapter = {
  id: string;
  title: string;
  titleDraft: string | null;
  lessons: Lesson[];
  isExpanded: boolean;
};

export const lessonTypeConfig: Record<LessonType, { icon: typeof Play; label: string; color: string }> = {
  VIDEO: { icon: Video, label: "Video", color: "text-blue-500" },
  TEXT: { icon: FileText, label: "Text", color: "text-emerald-500" },
  QUIZ: { icon: HelpCircle, label: "Quiz", color: "text-amber-500" },
};

export function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `0:${s.toString().padStart(2, "0")}`;
}

export function mapLessonContent(
  contentType: string,
  content: Record<string, unknown> | null
): LessonContent | null {
  if (!content) return null;
  if (contentType === "VIDEO") {
    return {
      videoUrl: (content.videoUrl as string) ?? "",
      durationSeconds: (content.durationSeconds as number) ?? null,
      resources: [],
    } as VideoContent;
  }
  if (contentType === "TEXT") {
    return { body: (content.body as string) ?? "" } as TextContent;
  }
  if (contentType === "QUIZ") {
    const raw = content.questions;
    const questions = typeof raw === "string" ? JSON.parse(raw as string) : raw ?? [];
    return { questions } as QuizContent;
  }
  return null;
}

export function mapBackendChapter(ch: ChapterItem): Chapter {
  return {
    id: ch.id,
    title: ch.title,
    titleDraft: ch.titleDraft ?? null,
    isExpanded: true,
    lessons: (ch.lessons ?? []).map((l) => ({
      id: l.id,
      title: l.title,
      contentType: l.contentType,
      durationSeconds: l.durationSeconds,
      isPreview: l.isPreview,
      status: l.status,
      processingStatus: (l.content as Record<string, unknown>)?.processingStatus as string | undefined,
      content: mapLessonContent(l.contentType, l.content),
    })),
  };
}
