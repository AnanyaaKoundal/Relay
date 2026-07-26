"use client";

import { ChapterCard, type Chapter } from "@/components/studio/course-builder";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { LessonType } from "./types";

export function ChapterSection({
    chapters,
    setChapters,
    totalLessons,
    isPublishedCourse,
    selectedLessons,
    onToggleLessonSelect,
    onAddChapter,
    onUpdateChapterTitle,
    onDeleteChapter,
    onAddLesson,
    onUpdateLessonTitle,
    onDeleteLesson,
    onToggleLessonPreview,
    onToggleChapterPreview,
    onOpenLessonEditor
}: {
    chapters: Chapter[],
    setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>,
    totalLessons: number,
    isPublishedCourse: boolean,
    onToggleLessonSelect: (lessonId: string) => void,
    onAddChapter: () => void,
    onUpdateChapterTitle: (chapterId: string, title: string) => void;
    onDeleteChapter: (chapterId: string) => void;
    onAddLesson: (chapterId: string, type: LessonType) => void;
    onUpdateLessonTitle: (chapterId: string, lessonId: string, title: string) => void;
    onDeleteLesson: (chapterId: string, lessonId: string) => void;
    onToggleLessonPreview: (chapterId: string, lessonId: string) => void;
    onToggleChapterPreview: (chapterId: string) => void;
    onOpenLessonEditor: (chapterId: string, lessonId: string) => void;
    selectedLessons: Set<string>;

}) {

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Chapters & Lessons</h2>
                <span className="text-xs text-muted-foreground">
                    {chapters.length} chapter{chapters.length !== 1 ? "s" : ""} · {totalLessons} lesson
                    {totalLessons !== 1 ? "s" : ""}
                </span>
            </div>

            {chapters.length === 0 ? (
                <EmptyState
                    title="No chapters yet"
                    description="Add chapters to organize your course content."
                    action={{ label: "Add First Chapter", onClick: onAddChapter }}
                />
            ) : (
                <div className="space-y-3">
                    {chapters.map((chapter, i) => (
                        <ChapterCard
                            key={chapter.id}
                            chapter={chapter}
                            chapterNumber={i + 1}
                            isPublishedCourse={isPublishedCourse}
                            onToggleExpand={() =>
                                setChapters((prev) =>
                                    prev.map((c) => (c.id === chapter.id ? { ...c, isExpanded: !c.isExpanded } : c))
                                )
                            }
                            onUpdateTitle={(t) => onUpdateChapterTitle(chapter.id, t)}
                            onDelete={() => onDeleteChapter(chapter.id)}
                            onAddLesson={(type) => onAddLesson(chapter.id, type)}
                            onUpdateLesson={(lessonId, t) => onUpdateLessonTitle(chapter.id, lessonId, t)}
                            onDeleteLesson={(lessonId) => onDeleteLesson(chapter.id, lessonId)}
                            onToggleLessonPreview={(lessonId) => onToggleLessonPreview(chapter.id, lessonId)}
                            onToggleChapterPreview={() => onToggleChapterPreview(chapter.id)}
                            onOpenLessonEditor={(lessonId) => onOpenLessonEditor(chapter.id, lessonId)}
                            selectedLessons={selectedLessons}
                            onToggleLessonSelect={onToggleLessonSelect}
                        />
                    ))}

                    <button
                        type="button"
                        onClick={onAddChapter}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                        <Plus className="size-4" />
                        Add Chapter
                    </button>
                </div>
            )}
        </div>
    )
}