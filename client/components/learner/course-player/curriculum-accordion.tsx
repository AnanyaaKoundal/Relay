"use client";

import { useState } from "react";
import { formatDuration } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle2,
  Circle,
  Eye,
  Lock,
} from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  contentType: string;
  durationSeconds: number | null;
  isPreview?: boolean;
};

type Chapter = {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
};

type CurriculumAccordionProps = {
  chapters: Chapter[];
  completedLessonIds?: Set<string>;
};

function contentTypeIcon(type: string) {
  switch (type) {
    case "VIDEO":
      return <PlayCircle className="size-4 text-blue-500" />;
    case "TEXT":
      return <FileText className="size-4 text-green-500" />;
    case "QUIZ":
      return <HelpCircle className="size-4 text-amber-500" />;
    default:
      return null;
  }
}

export function CurriculumAccordion({
  chapters,
  completedLessonIds,
}: CurriculumAccordionProps) {
  const [openChapters, setOpenChapters] = useState<Set<string>>(
    new Set(chapters.map((ch) => ch.id)),
  );

  function toggle(chapterId: string) {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  }

  const totalLessons = chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const completedCount = completedLessonIds
    ? chapters.reduce(
        (acc, ch) =>
          acc +
          ch.lessons.filter((l) => completedLessonIds.has(l.id)).length,
        0,
      )
    : null;

  return (
    <div className="space-y-2">
      {completedCount !== null && (
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>
            {completedCount}/{totalLessons} lessons completed
          </span>
          <span>
            {totalLessons > 0
              ? Math.round((completedCount / totalLessons) * 100)
              : 0}
            % complete
          </span>
        </div>
      )}

      {chapters.map((chapter) => {
        const isOpen = openChapters.has(chapter.id);
        const chCompleted = completedLessonIds
          ? chapter.lessons.filter((l) => completedLessonIds.has(l.id)).length
          : null;

        return (
          <div
            key={chapter.id}
            className="rounded-xl border bg-card overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(chapter.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">{chapter.title}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {chCompleted !== null && (
                  <span>
                    {chCompleted}/{chapter.lessons.length}
                  </span>
                )}
                <span>
                  {chapter.lessons.length} lesson
                  {chapter.lessons.length !== 1 ? "s" : ""}
                </span>
              </div>
            </button>

            {isOpen && (
              <ul className="border-t px-4 py-2 space-y-0.5">
                {chapter.lessons.map((lesson) => {
                  const isCompleted = completedLessonIds?.has(lesson.id);
                  return (
                    <li
                      key={lesson.id}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className={`flex-1 ${isCompleted ? "text-green-600 dark:text-green-400" : ""}`}>
                        {lesson.title}
                      </span>
                      {lesson.isPreview && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          <Eye className="size-2.5" />
                          Preview
                        </span>
                      )}
                      {!lesson.isPreview && completedLessonIds && (
                        <Lock className="size-3 text-muted-foreground/40" />
                      )}
                      {lesson.durationSeconds && (
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(lesson.durationSeconds)}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
