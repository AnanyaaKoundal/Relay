"use client";

import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { NewBadge, UpdatedBadge } from "./lesson-badges";

type Lesson = {
  id: string;
  title: string;
  contentType: string;
  durationSeconds: number | null;
  createdAt?: string;
  updatedAt?: string;
};

type Chapter = {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
};

type ChapterSidebarProps = {
  chapters: Chapter[];
  currentLessonId: string;
  completedLessonIds: Set<string>;
  enrolledAt?: string;
  enrollmentCompletedAt?: string | null;
  lessonCompletedDates?: Map<string, string>;
  onSelectLesson: (lessonId: string) => void;
};

function contentTypeIcon(type: string) {
  if (type === "VIDEO") return "🎥";
  if (type === "TEXT") return "📄";
  if (type === "QUIZ") return "❓";
  return "📝";
}

export function ChapterSidebar({
  chapters,
  currentLessonId,
  completedLessonIds,
  enrolledAt,
  enrollmentCompletedAt,
  lessonCompletedDates,
  onSelectLesson,
}: ChapterSidebarProps) {
  return (
    <nav className="space-y-1">
      {chapters.map((chapter) => (
        <div key={chapter.id}>
          <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {chapter.title}
          </h3>
          <ul className="space-y-0.5">
            {chapter.lessons.map((lesson) => {
              const isCurrent = lesson.id === currentLessonId;
              const isCompleted = completedLessonIds.has(lesson.id);

              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => onSelectLesson(lesson.id)}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isCurrent
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                    ) : isCurrent ? (
                      <PlayCircle className="size-4 shrink-0 text-primary" />
                    ) : (
                      <Circle className="size-4 shrink-0" />
                    )}
                    <span className="truncate flex-1">{lesson.title}</span>
                    {!isCompleted && (enrollmentCompletedAt ?? enrolledAt) && lesson.createdAt && lesson.createdAt > (enrollmentCompletedAt ?? enrolledAt)! && (
                      <NewBadge />
                    )}
                    {isCompleted && lessonCompletedDates && lesson.updatedAt && lessonCompletedDates.get(lesson.id) && lesson.updatedAt > lessonCompletedDates.get(lesson.id)! && (
                      <UpdatedBadge />
                    )}
                    <span className="text-xs shrink-0">
                      {contentTypeIcon(lesson.contentType)}
                    </span>
                    {lesson.durationSeconds && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDuration(lesson.durationSeconds)}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
