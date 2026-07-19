"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCourse, updateCourse } from "@/services/course.service";
import * as chapterApi from "@/services/chapter.service";
import * as lessonApi from "@/services/lesson.service";
import { useConfirm } from "@/components/confirm-modal";
import {
  VideoLessonEditor,
  TextLessonEditor,
  QuizLessonEditor,
  type LessonType,
  type LessonContent,
  type VideoContent,
  type TextContent,
  type QuizContent,
} from "@/components/lesson-editors";
import type { CourseDetail } from "@/types/course.types";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Lock,
  Eye,
  Pencil,
  Save,
  Send,
  ArrowLeft,
  Video,
  FileText,
  HelpCircle,
  BookOpen,
  Settings,
  Check,
  Play,
  Loader2,
} from "lucide-react";

/* ─── Domain types (backend-mapped) ─── */

type Lesson = {
  id: string;
  title: string;
  contentType: LessonType;
  durationSeconds: number | null;
  isPreview: boolean;
  content: LessonContent | null;
  _saving?: boolean;
};

type Chapter = {
  id: string;
  title: string;
  lessons: Lesson[];
  isExpanded: boolean;
  _saving?: boolean;
};

/* ─── Mapping helpers ─── */

function mapLessonContent(
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

function mapBackendChapter(ch: chapterApi.ChapterItem): Chapter {
  return {
    id: ch.id,
    title: ch.title,
    isExpanded: true,
    lessons: (ch.lessons ?? []).map((l) => ({
      id: l.id,
      title: l.title,
      contentType: l.contentType,
      durationSeconds: l.durationSeconds,
      isPreview: l.isPreview,
      content: mapLessonContent(l.contentType, l.content),
    })),
  };
}

/* ─── Constants ─── */

const lessonTypeConfig: Record<LessonType, { icon: typeof Play; label: string; color: string }> = {
  VIDEO: { icon: Video, label: "Video", color: "text-blue-500" },
  TEXT: { icon: FileText, label: "Text", color: "text-emerald-500" },
  QUIZ: { icon: HelpCircle, label: "Quiz", color: "text-amber-500" },
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `0:${s.toString().padStart(2, "0")}`;
}

/* ─── Portal Dropdown ─── */
function PortalDropdown({
  anchorRef,
  open,
  onClose,
  children,
}: {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[99]" onClick={onClose} />
      <div
        className="fixed z-[100] w-44 rounded-xl border bg-popover p-1 shadow-lg"
        style={{ top: pos.top, right: pos.right }}
      >
        {children}
      </div>
    </>,
    document.body
  );
}

/* ─── Lesson Row ─── */
function LessonRow({
  lesson,
  onUpdate,
  onDelete,
  onTogglePreview,
  onOpenEditor,
}: {
  lesson: Lesson;
  onUpdate: (title: string) => void;
  onDelete: () => void;
  onTogglePreview: () => void;
  onOpenEditor: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const typeInfo = lessonTypeConfig[lesson.contentType];
  const TypeIcon = typeInfo.icon;

  const hasContent = lesson.content !== null;
  const handleSave = () => {
    if (title.trim()) {
      onUpdate(title.trim());
      setEditing(false);
    }
  };

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      <div className="hidden sm:flex size-6 items-center justify-center text-muted-foreground/30 group-hover:text-muted-foreground cursor-grab transition-colors">
        <GripVertical className="size-3.5" />
      </div>

      <TypeIcon className={`size-4 shrink-0 ${typeInfo.color}`} />

      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setTitle(lesson.title);
              setEditing(false);
            }
          }}
          onBlur={handleSave}
          className="flex-1 h-6 rounded border border-input bg-background px-2 text-sm outline-none focus:border-primary"
        />
      ) : (
        <button
          type="button"
          onClick={onOpenEditor}
          className="flex-1 text-left text-sm truncate hover:text-primary transition-colors"
        >
          {lesson.title}
          {!hasContent && (
            <span className="ml-2 text-[10px] text-muted-foreground/60">(click to edit)</span>
          )}
        </button>
      )}

      <span className="text-xs text-muted-foreground shrink-0">
        {lesson.contentType === "VIDEO" && lesson.durationSeconds
          ? formatDuration(lesson.durationSeconds)
          : lesson.contentType === "QUIZ" && lesson.content && "questions" in lesson.content
          ? `${(lesson.content as QuizContent).questions.length} Q`
          : "—"}
      </span>

      <button
        type="button"
        onClick={onTogglePreview}
        className={`shrink-0 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
          lesson.isPreview
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground/50 hover:text-muted-foreground"
        }`}
        title={lesson.isPreview ? "Free preview" : "Locked"}
      >
        {lesson.isPreview ? <Eye className="size-3" /> : <Lock className="size-3" />}
        <span className="hidden sm:inline">{lesson.isPreview ? "Preview" : "Locked"}</span>
      </button>

      <button
        type="button"
        onClick={onOpenEditor}
        className="shrink-0 size-6 flex items-center justify-center rounded text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
        title="Edit content"
      >
        <Pencil className="size-3" />
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 size-6 flex items-center justify-center rounded text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="size-3" />
      </button>
    </div>
  );
}

/* ─── Chapter Card ─── */
function ChapterCard({
  chapter,
  chapterNumber,
  onToggleExpand,
  onUpdateTitle,
  onDelete,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onToggleLessonPreview,
  onToggleChapterPreview,
  onOpenLessonEditor,
}: {
  chapter: Chapter;
  chapterNumber: number;
  onToggleExpand: () => void;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
  onAddLesson: (type: LessonType) => void;
  onUpdateLesson: (lessonId: string, title: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onToggleLessonPreview: (lessonId: string) => void;
  onToggleChapterPreview: () => void;
  onOpenLessonEditor: (lessonId: string) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(chapter.title);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [addBtnRef, setAddBtnRef] = useState<HTMLDivElement | null>(null);

  const allPreview = chapter.lessons.length > 0 && chapter.lessons.every((l) => l.isPreview);
  const somePreview = chapter.lessons.some((l) => l.isPreview) && !allPreview;

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
            {chapter.title}
          </button>
        )}

        <span className="text-xs text-muted-foreground shrink-0">
          {chapter.lessons.length} lesson{chapter.lessons.length !== 1 ? "s" : ""}
        </span>

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
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Builder ─── */
export default function CourseBuilderWorkspace() {
  const params = useParams<{ courseId: string }>();
  const { confirm } = useConfirm();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const [editorLesson, setEditorLesson] = useState<{
    chapterId: string;
    lessonId: string;
  } | null>(null);

  /* ── Load course + chapters from backend ── */
  useEffect(() => {
    if (!params?.courseId) return;
    let cancelled = false;

    async function load() {
      try {
        const [c, chs] = await Promise.all([
          getCourse(params!.courseId),
          chapterApi.listChapters(params!.courseId),
        ]);
        if (cancelled) return;

        // Enrich each chapter's lessons with content from backend
        const finalChapters: Chapter[] = [];
        for (const ch of chs) {
          const lessons = await lessonApi.listLessons(ch.id);
          finalChapters.push({
            id: ch.id,
            title: ch.title,
            isExpanded: true,
            lessons: lessons.map((l) => ({
              id: l.id,
              title: l.title,
              contentType: l.contentType,
              durationSeconds: l.durationSeconds,
              isPreview: l.isPreview,
              content: mapLessonContent(l.contentType, l.content as Record<string, unknown> | null),
            })),
          });
        }

        if (!cancelled) {
          setCourse(c);
          setTitle(c.title);
          setDescription(c.description);
          setChapters(finalChapters);
        }
      } catch {
        if (!cancelled) setCourse(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [params?.courseId]);

  /* ── Find the lesson being edited ── */
  function findEditingLesson() {
    if (!editorLesson) return null;
    for (const ch of chapters) {
      if (ch.id === editorLesson.chapterId) {
        const lesson = ch.lessons.find((l) => l.id === editorLesson.lessonId);
        if (lesson) return lesson;
      }
    }
    return null;
  }

  /* ── Save course details (title/description) ── */
  async function handleSave() {
    if (!course || !params?.courseId) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updateCourse(params.courseId, { title, description });
      setCourse({ ...course, ...updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  }

  /* ── Publish ── */
  async function handlePublish() {
    if (!params?.courseId) return;

    const totalLessons = chapters.reduce((acc, c) => acc + c.lessons.length, 0);
    if (chapters.length === 0 || totalLessons === 0) {
      await confirm({
        title: "Cannot publish",
        description:
          "You need at least one chapter with one lesson before publishing.",
        confirmLabel: "OK",
      });
      return;
    }

    const ok = await confirm({
      title: "Publish course",
      description:
        "Your course will become visible to learners. Make sure everything looks good.",
      confirmLabel: "Publish",
    });
    if (!ok) return;
    setSaving(true);
    try {
      const updated = await updateCourse(params.courseId, { status: "PUBLISHED" });
      setCourse((prev) => (prev ? { ...prev, ...updated } : prev));
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  }

  /* ── Add Chapter (immediate backend save) ── */
  const handleAddChapter = useCallback(async () => {
    if (!params?.courseId) return;
    try {
      const ch = await chapterApi.createChapter(params.courseId, `Chapter ${chapters.length + 1}`);
      setChapters((prev) => [...prev, mapBackendChapter(ch)]);
    } catch { /* silent */ }
  }, [params?.courseId, chapters.length]);

  /* ── Delete Chapter (immediate backend save) ── */
  const handleDeleteChapter = useCallback(async (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    const ok = await confirm({
      title: "Delete chapter",
      description: `Are you sure you want to delete "${chapter?.title ?? "this chapter"}" and all its lessons?`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await chapterApi.deleteChapter(chapterId);
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
    } catch { /* silent */ }
  }, [chapters, confirm]);

  /* ── Update Chapter Title (immediate backend save) ── */
  const handleUpdateChapterTitle = useCallback(async (chapterId: string, newTitle: string) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, title: newTitle } : c))
    );
    try {
      await chapterApi.updateChapter(chapterId, { title: newTitle });
    } catch { /* silent */ }
  }, []);

  /* ── Add Lesson (immediate backend save) ── */
  const handleAddLesson = useCallback(async (chapterId: string, type: LessonType) => {
    const typeLabels: Record<LessonType, string> = {
      VIDEO: "New Video Lesson",
      TEXT: "New Text Lesson",
      QUIZ: "New Quiz",
    };
    try {
      const l = await lessonApi.createLesson(chapterId, {
        title: typeLabels[type],
        contentType: type,
        ...(type === "VIDEO"
          ? { videoUrl: "", durationSeconds: undefined }
          : type === "TEXT"
          ? { body: "" }
          : { questions: [] }),
      });
      const newLesson: Lesson = {
        id: l.id,
        title: l.title,
        contentType: l.contentType,
        durationSeconds: l.durationSeconds,
        isPreview: false,
        content: mapLessonContent(l.contentType, l.content as Record<string, unknown> | null),
      };
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId
            ? { ...c, lessons: [...c.lessons, newLesson], isExpanded: true }
            : c
        )
      );
      setEditorLesson({ chapterId, lessonId: l.id });
    } catch { /* silent */ }
  }, []);

  /* ── Update Lesson Title (immediate backend save) ── */
  const handleUpdateLessonTitle = useCallback(async (chapterId: string, lessonId: string, newTitle: string) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? { ...c, lessons: c.lessons.map((l) => (l.id === lessonId ? { ...l, title: newTitle } : l)) }
          : c
      )
    );
    try {
      await lessonApi.updateLesson(lessonId, { title: newTitle });
    } catch { /* silent */ }
  }, []);

  /* ── Save lesson content from editor (immediate backend save) ── */
  const handleSaveContent = useCallback(
    async (type: LessonType, data: LessonContent, newTitle: string) => {
      if (!editorLesson) return;
      const { chapterId, lessonId } = editorLesson;

      // Update local state
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId
            ? {
                ...c,
                lessons: c.lessons.map((l) =>
                  l.id === lessonId
                    ? {
                        ...l,
                        title: newTitle,
                        content: data,
                        durationSeconds:
                          type === "VIDEO" ? (data as VideoContent).durationSeconds : l.durationSeconds,
                      }
                    : l
                ),
              }
            : c
        )
      );

      // Persist to backend
      try {
        if (type === "VIDEO") {
          const v = data as VideoContent;
          await lessonApi.updateLesson(lessonId, {
            title: newTitle,
            videoUrl: v.videoUrl,
            durationSeconds: v.durationSeconds,
          });
        } else if (type === "TEXT") {
          await lessonApi.updateLesson(lessonId, {
            title: newTitle,
            body: (data as TextContent).body,
          });
        } else if (type === "QUIZ") {
          const q = data as QuizContent;
          await lessonApi.updateLesson(lessonId, {
            title: newTitle,
            questions: q.questions.map((question) => ({
              question: question.question,
              options: question.options.map((o) => o.text),
              correctAnswer: question.options.findIndex((o) => o.id === question.correctOptionId),
              explanation: question.explanation,
            })),
          });
        }
      } catch { /* silent */ }
    },
    [editorLesson]
  );

  /* ── Delete Lesson (immediate backend save) ── */
  const handleDeleteLesson = useCallback(async (chapterId: string, lessonId: string) => {
    try {
      await lessonApi.deleteLesson(lessonId);
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId
            ? { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) }
            : c
        )
      );
    } catch { /* silent */ }
  }, []);

  /* ── Toggle preview (persisted with confirmation) ── */
  const handleToggleLessonPreview = useCallback(async (chapterId: string, lessonId: string) => {
    const lesson = chapters
      .find((c) => c.id === chapterId)
      ?.lessons.find((l) => l.id === lessonId);
    if (!lesson) return;
    const newValue = !lesson.isPreview;
    const ok = await confirm({
      title: newValue ? "Enable free preview" : "Disable free preview",
      description: newValue
        ? `Learners will be able to view "${lesson.title}" without enrolling.`
        : `Learners will need to enroll to view "${lesson.title}".`,
      confirmLabel: newValue ? "Enable Preview" : "Disable Preview",
    });
    if (!ok) return;
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? { ...c, lessons: c.lessons.map((l) => (l.id === lessonId ? { ...l, isPreview: newValue } : l)) }
          : c
      )
    );
    try {
      await lessonApi.updateLesson(lessonId, { isPreview: newValue });
    } catch { /* silent */ }
  }, [chapters, confirm]);

  /* ── Toggle chapter preview (all lessons in chapter) ── */
  const handleToggleChapterPreview = useCallback(async (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter || chapter.lessons.length === 0) return;
    const allPreview = chapter.lessons.every((l) => l.isPreview);
    const newValue = !allPreview;
    const ok = await confirm({
      title: newValue ? "Enable chapter preview" : "Disable chapter preview",
      description: newValue
        ? `All ${chapter.lessons.length} lesson${chapter.lessons.length !== 1 ? "s" : ""} in "${chapter.title}" will be marked as free preview.`
        : `All lessons in "${chapter.title}" will be locked. Learners will need to enroll.`,
      confirmLabel: newValue ? "Enable All" : "Lock All",
    });
    if (!ok) return;
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? { ...c, lessons: c.lessons.map((l) => ({ ...l, isPreview: newValue })) }
          : c
      )
    );
    try {
      await Promise.all(
        chapter.lessons.map((l) => lessonApi.updateLesson(l.id, { isPreview: newValue }))
      );
    } catch { /* silent */ }
  }, [chapters, confirm]);

  const totalLessons = chapters.reduce((acc, c) => acc + c.lessons.length, 0);
  const editingLesson = findEditingLesson();

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-muted-foreground text-sm gap-2">
        <Loader2 className="size-4 animate-spin" />
        Loading course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-12 text-center text-sm text-red-500">
        Course not found.{" "}
        <Link href="/studio/courses" className="text-primary underline">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/studio/courses"
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
              course.status === "PUBLISHED"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : course.status === "DRAFT"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {course.status === "PENDING_APPROVAL"
              ? "Pending"
              : course.status.charAt(0) + course.status.slice(1).toLowerCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {course.status !== "PUBLISHED" && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={saving}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              <Send className="size-3.5" />
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Course Details */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Settings className="size-3.5" />
            <span className="font-medium">Course Details</span>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 animate-in fade-in">
                <Check className="size-3" />
                Saved
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Save className="size-3.5" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="course-title" className="text-xs text-muted-foreground font-medium">
            Title
          </label>
          <input
            id="course-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            placeholder="Course title"
          />
        </div>
        <div>
          <label htmlFor="course-desc" className="text-xs text-muted-foreground font-medium">
            Description
          </label>
          <textarea
            id="course-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
            placeholder="What will students learn in this course?"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
          <span>{chapters.length} chapters</span>
          <span>{totalLessons} lessons</span>
          <span>${Number(course.price).toFixed(2)}</span>
          <span>{course.difficulty ?? "N/A"}</span>
        </div>
      </div>

      {/* Chapters */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Chapters & Lessons</h2>
          <span className="text-xs text-muted-foreground">
            {chapters.length} chapter{chapters.length !== 1 ? "s" : ""} · {totalLessons} lesson
            {totalLessons !== 1 ? "s" : ""}
          </span>
        </div>

        {chapters.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed bg-card/50 p-10 text-center">
            <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <BookOpen className="size-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No chapters yet</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Add chapters to organize your course content.
            </p>
            <button
              type="button"
              onClick={handleAddChapter}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
            >
              <Plus className="size-4" />
              Add First Chapter
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {chapters.map((chapter, i) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                chapterNumber={i + 1}
                onToggleExpand={() =>
                  setChapters((prev) =>
                    prev.map((c) => (c.id === chapter.id ? { ...c, isExpanded: !c.isExpanded } : c))
                  )
                }
                onUpdateTitle={(t) => handleUpdateChapterTitle(chapter.id, t)}
                onDelete={() => handleDeleteChapter(chapter.id)}
                onAddLesson={(type) => handleAddLesson(chapter.id, type)}
                onUpdateLesson={(lessonId, t) => handleUpdateLessonTitle(chapter.id, lessonId, t)}
                onDeleteLesson={(lessonId) => handleDeleteLesson(chapter.id, lessonId)}
                onToggleLessonPreview={(lessonId) => handleToggleLessonPreview(chapter.id, lessonId)}
                onToggleChapterPreview={() => handleToggleChapterPreview(chapter.id)}
                onOpenLessonEditor={(lessonId) => setEditorLesson({ chapterId: chapter.id, lessonId })}
              />
            ))}

            <button
              type="button"
              onClick={handleAddChapter}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              <Plus className="size-4" />
              Add Chapter
            </button>
          </div>
        )}
      </div>

      {/* Lesson Editors */}
      {editingLesson && editingLesson.contentType === "VIDEO" && (
        <VideoLessonEditor
          open
          onClose={() => setEditorLesson(null)}
          onSave={(data, t) => handleSaveContent("VIDEO", data, t)}
          initial={(editingLesson.content as VideoContent) ?? { videoUrl: "", durationSeconds: null, resources: [] }}
          lessonTitle={editingLesson.title}
        />
      )}
      {editingLesson && editingLesson.contentType === "TEXT" && (
        <TextLessonEditor
          open
          onClose={() => setEditorLesson(null)}
          onSave={(data, t) => handleSaveContent("TEXT", data, t)}
          initial={(editingLesson.content as TextContent) ?? { body: "" }}
          lessonTitle={editingLesson.title}
        />
      )}
      {editingLesson && editingLesson.contentType === "QUIZ" && (
        <QuizLessonEditor
          open
          onClose={() => setEditorLesson(null)}
          onSave={(data, t) => handleSaveContent("QUIZ", data, t)}
          initial={(editingLesson.content as QuizContent) ?? { questions: [] }}
          lessonTitle={editingLesson.title}
        />
      )}
    </div>
  );
}
