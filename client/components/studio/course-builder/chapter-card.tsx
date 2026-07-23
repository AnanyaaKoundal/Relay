"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Eye } from "lucide-react";
import type { Lesson, Chapter, LessonType } from "./types";
import { lessonTypeConfig } from "./types";
import { PortalDropdown } from "./portal-dropdown";
import { LessonRow } from "./lesson-row";

export function ChapterCard({
  chapter,
  chapterNumber,
  isPublishedCourse,
  onToggleExpand,
  onUpdateTitle,
  onDelete,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onToggleLessonPreview,
  onToggleChapterPreview,
  onOpenLessonEditor,
  selectedLessons,
  onToggleLessonSelect,
}: {
  chapter: Chapter;
  chapterNumber: number;
  isPublishedCourse: boolean;
  onToggleExpand: () => void;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
  onAddLesson: (type: LessonType) => void;
  onUpdateLesson: (lessonId: string, title: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onToggleLessonPreview: (lessonId: string) => void;
  onToggleChapterPreview: () => void;
  onOpenLessonEditor: (lessonId: string) => void;
  selectedLessons?: Set<string>;
  onToggleLessonSelect?: (lessonId: string) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(chapter.title);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [addBtnRef, setAddBtnRef] = useState<HTMLDivElement | null>(null);

  const allPreview = chapter.lessons.length > 0 && chapter.lessons.every((l) => l.isPreview);
  const somePreview = chapter.lessons.some((l) => l.isPreview) && !allPreview;
  const draftCount = chapter.lessons.filter((l) => l.status === "DRAFT").length;

  const displayTitle = isPublishedCourse && chapter.titleDraft ? chapter.titleDraft : chapter.title;

  const handleSaveTitle = () => {
    if (title.trim()) {
      onUpdateTitle(title.trim());
      setEditingTitle(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card transition-all hover:shadow-sm">
      {/* Chapter Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/20 rounded-t-xl">
        <button
          type="button"
          onClick={onToggleExpand}
          className="shrink-0 text-muted-foreground/40 hover:text-foreground transition-colors"
        >
          {chapter.isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>

        <div className="hidden sm:flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
          {chapterNumber}
        </div>

        {editingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTitle();
              if (e.key === "Escape") {
                setTitle(chapter.title);
                setEditingTitle(false);
              }
            }}
            onBlur={handleSaveTitle}
            className="flex-1 h-7 rounded border border-input bg-background px-2 text-sm font-medium outline-none focus:border-primary"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingTitle(true)}
            className="flex-1 text-left text-sm font-medium hover:text-primary transition-colors"
          >
            {displayTitle}
            {isPublishedCourse && chapter.titleDraft && chapter.titleDraft !== chapter.title && (
              <span className="ml-2 text-[10px] text-amber-600 font-normal">(pending title)</span>
            )}
          </button>
        )}

        <span className="text-xs text-muted-foreground shrink-0">
          {chapter.lessons.length} lesson{chapter.lessons.length !== 1 ? "s" : ""}
        </span>

        {draftCount > 0 && (
          <span className="shrink-0 rounded-full bg-amber-50 text-amber-700 px-1.5 py-0.5 text-[10px] font-medium">
            {draftCount} draft{draftCount !== 1 ? "s" : ""}
          </span>
        )}

        {/* Chapter Preview Toggle */}
        {chapter.lessons.length > 0 && (
          <button
            type="button"
            onClick={onToggleChapterPreview}
            className={`shrink-0 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
              allPreview
                ? "bg-primary/10 text-primary"
                : somePreview
                ? "bg-primary/5 text-primary/60"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
            title={allPreview ? "All lessons are preview" : "Mark all lessons as preview"}
          >
            {allPreview ? <Eye className="size-3" /> : somePreview ? <Eye className="size-3 opacity-50" /> : <Eye className="size-3" />}
            <span className="hidden sm:inline">Chapter</span>
          </button>
        )}

        {/* Add Lesson */}
        <div className="relative shrink-0" ref={setAddBtnRef}>
          <button
            type="button"
            onClick={() => setShowAddLesson(!showAddLesson)}
            className="inline-flex h-7 items-center gap-1 rounded-lg border px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Plus className="size-3" />
            <span className="hidden sm:inline">Lesson</span>
          </button>
          <PortalDropdown
            anchorRef={{ current: addBtnRef }}
            open={showAddLesson}
            onClose={() => setShowAddLesson(false)}
          >
            {(Object.keys(lessonTypeConfig) as LessonType[]).map((type) => {
              const cfg = lessonTypeConfig[type];
              const Icon = cfg.icon;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onAddLesson(type);
                    setShowAddLesson(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Icon className={`size-3.5 ${cfg.color}`} />
                  {cfg.label}
                </button>
              );
            })}
          </PortalDropdown>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 size-7 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Lessons */}
      {chapter.isExpanded && (
        <div className="border-t">
          {chapter.lessons.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-muted-foreground">No lessons yet.</p>
              <button
                type="button"
                onClick={() => setShowAddLesson(true)}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Add your first lesson
              </button>
            </div>
          ) : (
            chapter.lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                onUpdate={(t) => onUpdateLesson(lesson.id, t)}
                onDelete={() => onDeleteLesson(lesson.id)}
                onTogglePreview={() => onToggleLessonPreview(lesson.id)}
                onOpenEditor={() => onOpenLessonEditor(lesson.id)}
                selected={selectedLessons?.has(lesson.id)}
                onToggleSelect={onToggleLessonSelect ? () => onToggleLessonSelect(lesson.id) : undefined}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
