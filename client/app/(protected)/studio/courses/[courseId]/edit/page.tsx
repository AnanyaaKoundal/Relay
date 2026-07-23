"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCourse, updateCourse } from "@/services/course.service";
import * as chapterApi from "@/services/chapter.service";
import * as lessonApi from "@/services/lesson.service";
import { useConfirm } from "@/components/shared/confirm-modal";
import { useProcessingPolling } from "@/hooks/useProcessingPolling";
import { VideoLessonEditor } from "@/components/studio/VideoLessonEditor";
import { TextLessonEditor } from "@/components/studio/TextLessonEditor";
import { QuizLessonEditor } from "@/components/studio/QuizLessonEditor";
import type {
  LessonType,
  LessonContent,
  VideoContent,
  TextContent,
  QuizContent,
} from "@/types/lesson.types";
import type { CourseDetail } from "@/types/course.types";
import {
  ChapterCard,
  PublishToolbar,
  type Lesson,
  type Chapter,
  mapLessonContent,
  mapBackendChapter,
} from "@/components/studio/course-builder";
import {
  Plus,
  Save,
  Send,
  ArrowLeft,
  BookOpen,
  Settings,
  Check,
  Loader2,
  Undo2,
} from "lucide-react";

/* ─── Helpers ─── */
function quizToBackendPayload(quiz: QuizContent) {
  return quiz.questions.map((q) => ({
    question: q.question,
    options: q.options.map((o) => o.text),
    correctAnswer: q.options.findIndex((o) => o.id === q.correctOptionId),
    explanation: q.explanation,
  }));
}

async function loadAllChapters(courseId: string): Promise<Chapter[]> {
  const chs = await chapterApi.listChapters(courseId);
  const chapters: Chapter[] = [];
  for (const ch of chs) {
    const lessons = await lessonApi.listLessons(ch.id);
    chapters.push(mapBackendChapter({ ...ch, lessons }));
  }
  return chapters;
}

/* ─── Main Builder ─── */
export default function CourseBuilderWorkspace() {
  const params = useParams<{ courseId: string }>();
  const { confirm } = useConfirm();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const [editorLesson, setEditorLesson] = useState<{
    chapterId: string;
    lessonId: string;
  } | null>(null);

  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  const editorLessonRef = useRef(editorLesson);
  useEffect(() => { editorLessonRef.current = editorLesson; }, [editorLesson]);

  const [tempLessonMeta, setTempLessonMeta] = useState<{
    chapterId: string;
    type: LessonType;
    title: string;
  } | null>(null);

  /* ── Resolve temp lesson ID to real backend ID (video only) ── */
  const resolveLessonId = useCallback(
    async (chapterId: string, tempId: string, type: LessonType, title: string): Promise<string> => {
      const created = await lessonApi.createLesson(chapterId, {
        title,
        contentType: type,
        videoUrl: "",
        durationSeconds: undefined,
      });
      setEditorLesson({ chapterId, lessonId: created.id });
      return created.id;
    },
    []
  );

  /* ── Load course + chapters from backend ── */
  useEffect(() => {
    if (!params?.courseId) return;
    let cancelled = false;

    async function load() {
      try {
        const [c, chs] = await Promise.all([
          getCourse(params!.courseId),
          loadAllChapters(params!.courseId),
        ]);
        if (cancelled) return;

        if (!cancelled) {
          setCourse(c);
          setTitle(c.title);
          setDescription(c.description);
          setChapters(chs);
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

  const isPublishedCourse = course?.status === "PUBLISHED";

  /* ── Selection helpers ── */
  const allLessons = useMemo(
    () => chapters.flatMap((ch) => ch.lessons.map((l) => ({ ...l, chapterId: ch.id }))),
    [chapters]
  );

  const selectedDraftCount = useMemo(
    () => allLessons.filter((l) => selectedLessons.has(l.id) && l.status === "DRAFT").length,
    [allLessons, selectedLessons]
  );

  const selectedPublishedCount = useMemo(
    () => allLessons.filter((l) => selectedLessons.has(l.id) && l.status === "PUBLISHED").length,
    [allLessons, selectedLessons]
  );

  const totalDraftCount = useMemo(
    () => allLessons.filter((l) => l.status === "DRAFT").length,
    [allLessons]
  );

  const toggleLessonSelect = useCallback((lessonId: string) => {
    setSelectedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  }, []);

  /* ── Find the lesson being edited ── */
  function findEditingLesson() {
    if (!editorLesson) return null;
    // Check real chapters first
    for (const ch of chapters) {
      if (ch.id === editorLesson.chapterId) {
        const lesson = ch.lessons.find((l) => l.id === editorLesson.lessonId);
        if (lesson) return lesson;
      }
    }
    // Fallback: temp lesson not yet in chapters
    if (tempLessonMeta && editorLesson.chapterId === tempLessonMeta.chapterId) {
      return {
        id: editorLesson.lessonId,
        title: tempLessonMeta.title,
        contentType: tempLessonMeta.type,
        durationSeconds: null,
        isPreview: false,
        status: "DRAFT" as const,
        content: null,
      };
    }
    return null;
  }

  /* ── Refresh lesson statuses from backend ── */
  const refreshLessonStatuses = useCallback(async () => {
    if (!params?.courseId) return;
    setChapters(await loadAllChapters(params!.courseId));
  }, [params?.courseId]);

  /* ── Auto-poll PROCESSING/PENDING lessons ── */
  const { markSaved } = useProcessingPolling(allLessons, refreshLessonStatuses);

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

  /* ── Publish course (DRAFT → PUBLISHED) ── */
  async function handlePublishCourse() {
    if (!params?.courseId) return;

    const ok = await confirm({
      title: "Publish course",
      description:
        "Your course will become visible to learners. All draft lessons will be published and chapter title changes will be applied.",
      confirmLabel: "Publish",
    });
    if (!ok) return;
    setPublishing(true);
    try {
      const updated = await updateCourse(params.courseId, { status: "PUBLISHED" });
      setCourse((prev) => (prev ? { ...prev, ...updated } : prev));
      await refreshLessonStatuses();
    } catch (err) {
      await confirm({
        title: "Publish failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        confirmLabel: "OK",
      });
    } finally {
      setPublishing(false);
    }
  }

  /* ── Discard draft (PUBLISHED → DRAFT) ── */
  async function handleDiscardDraft() {
    if (!params?.courseId) return;

    const ok = await confirm({
      title: "Revert to draft",
      description:
        "This will un-publish the course and hide it from learners. You can re-publish when ready.",
      confirmLabel: "Revert to Draft",
      variant: "destructive",
    });
    if (!ok) return;
    setPublishing(true);
    try {
      const updated = await updateCourse(params.courseId, { status: "DRAFT" });
      setCourse((prev) => (prev ? { ...prev, ...updated } : prev));
    } catch { /* silent */ } finally {
      setPublishing(false);
    }
  }

  /* ── Batch publish lessons ── */
  async function handleBatchPublish() {
    const ids = allLessons.filter((l) => selectedLessons.has(l.id) && l.status === "DRAFT").map((l) => l.id);
    if (ids.length === 0) return;
    setPublishing(true);
    try {
      await lessonApi.publishLessons(ids);
      setSelectedLessons(new Set());
      await refreshLessonStatuses();
    } catch { /* silent */ } finally {
      setPublishing(false);
    }
  }

  /* ── Batch unpublish lessons ── */
  async function handleBatchUnpublish() {
    const ids = allLessons.filter((l) => selectedLessons.has(l.id) && l.status === "PUBLISHED").map((l) => l.id);
    if (ids.length === 0) return;
    setPublishing(true);
    try {
      await lessonApi.unpublishLessons(ids);
      setSelectedLessons(new Set());
      await refreshLessonStatuses();
    } catch { /* silent */ } finally {
      setPublishing(false);
    }
  }

  /* ── Publish All Changes (published course) ── */
  async function handlePublishAllChanges() {
    if (!params?.courseId) return;
    const draftIds = allLessons.filter((l) => l.status === "DRAFT").map((l) => l.id);
    if (draftIds.length === 0 && totalDraftCount === 0) return;

    const ok = await confirm({
      title: "Publish all changes",
      description: `Publish ${draftIds.length} draft lesson${draftIds.length !== 1 ? "s" : ""} and apply all pending chapter title changes?`,
      confirmLabel: "Publish All",
    });
    if (!ok) return;
    setPublishing(true);
    try {
      if (draftIds.length > 0) {
        await lessonApi.publishLessons(draftIds);
      }
      // Publish all chapter titleDrafts
      const chapterIds = chapters.map((c) => c.id);
      if (chapterIds.length > 0) {
        await chapterApi.publishChapterTitles(chapterIds);
      }
      setSelectedLessons(new Set());
      await refreshLessonStatuses();
    } catch (err) {
      await confirm({
        title: "Publish failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        confirmLabel: "OK",
      });
    } finally {
      setPublishing(false);
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
      markSaved();
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
    } catch { /* silent */ }
  }, [chapters, confirm, markSaved]);

  /* ── Update Chapter Title (immediate backend save) ── */
  const handleUpdateChapterTitle = useCallback(async (chapterId: string, newTitle: string) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, title: newTitle, titleDraft: isPublishedCourse ? newTitle : null } : c))
    );
    try {
      await chapterApi.updateChapter(chapterId, { title: newTitle });
      markSaved();
    } catch { /* silent */ }
  }, [isPublishedCourse, markSaved]);

  /* ── Add Lesson (deferred: only opens editor, no backend call, no UI row) ── */
  const handleAddLesson = useCallback(async (chapterId: string, type: LessonType) => {
    const typeLabels: Record<LessonType, string> = {
      VIDEO: "New Video Lesson",
      TEXT: "New Text Lesson",
      QUIZ: "New Quiz",
    };
    const tempId = `temp_${crypto.randomUUID()}`;
    setTempLessonMeta({ chapterId, type, title: typeLabels[type] });
    setEditorLesson({ chapterId, lessonId: tempId });
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
      markSaved();
    } catch { /* silent */ }
  }, [markSaved]);

  /* ── Save lesson content from editor ── */
  const handleSaveContent = useCallback(
    async (type: LessonType, data: LessonContent, newTitle: string) => {
      const current = editorLessonRef.current;
      if (!current) return;
      const { chapterId, lessonId } = current;
      const isNew = lessonId.startsWith("temp_");

      if (isNew) {
        let savedId = lessonId;

        if (type === "VIDEO") {
          // Video: lesson already created by resolveLessonId, just update
          const v = data as VideoContent;
          await lessonApi.updateLesson(lessonId, {
            title: newTitle,
            videoUrl: v.videoUrl,
            durationSeconds: v.durationSeconds,
          });
          savedId = lessonId;
        } else {
          // Text/Quiz: create on backend now
          const created = await lessonApi.createLesson(chapterId, {
            title: newTitle,
            contentType: type,
            ...(type === "TEXT"
              ? { body: (data as TextContent).body }
              : { questions: quizToBackendPayload(data as QuizContent) }),
          });
          savedId = created.id;
        }

        // Add new lesson to chapters
        setChapters((prev) =>
          prev.map((c) =>
            c.id === chapterId
              ? {
                  ...c,
                  isExpanded: true,
                  lessons: [
                    ...c.lessons,
                    {
                      id: savedId,
                      title: newTitle,
                      contentType: type,
                      durationSeconds: type === "VIDEO" ? (data as VideoContent).durationSeconds : null,
                      isPreview: false,
                      status: "DRAFT" as const,
                      content: data,
                    },
                  ],
                }
              : c
          )
        );
        setEditorLesson({ chapterId, lessonId: savedId });
        setTempLessonMeta(null);
      } else {
        // Existing lesson: update in chapters
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
            await lessonApi.updateLesson(lessonId, {
              title: newTitle,
              questions: quizToBackendPayload(data as QuizContent),
            });
          }
        } catch { /* silent */ }
      }
      markSaved();
    },
    [markSaved]
  );

  /* ── Delete Lesson (immediate backend save) ── */
  const handleDeleteLesson = useCallback(async (chapterId: string, lessonId: string) => {
    try {
      await lessonApi.deleteLesson(lessonId);
      markSaved();
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId
            ? { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) }
            : c
        )
      );
    } catch { /* silent */ }
  }, [markSaved]);

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
      markSaved();
    } catch { /* silent */ }
  }, [chapters, confirm, markSaved]);

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
      markSaved();
    } catch { /* silent */ }
  }, [chapters, confirm, markSaved]);

  /* ── Editor close ── */
  const handleEditorClose = useCallback(async (chapterId: string, lessonId: string) => {
    setEditorLesson(null);
    setTempLessonMeta(null);
  }, []);

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
          {course.status === "PUBLISHED" && totalDraftCount > 0 && (
            <button
              type="button"
              onClick={handlePublishAllChanges}
              disabled={publishing}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {publishing ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              Publish All ({totalDraftCount})
            </button>
          )}
          {course.status === "PUBLISHED" && (
            <button
              type="button"
              onClick={handleDiscardDraft}
              disabled={publishing}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Undo2 className="size-3.5" />
              Revert to Draft
            </button>
          )}
          {course.status !== "PUBLISHED" && (
            <button
              type="button"
              onClick={handlePublishCourse}
              disabled={publishing}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {publishing ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
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
          {totalDraftCount > 0 && (
            <span className="text-amber-600">{totalDraftCount} draft{totalDraftCount !== 1 ? "s" : ""}</span>
          )}
          <span>${Number(course.price).toFixed(2)}</span>
          <span>{course.difficulty ?? "N/A"}</span>
        </div>
      </div>

      {/* Batch Publish Toolbar */}
      <PublishToolbar
        selectedCount={selectedLessons.size}
        draftCount={selectedDraftCount}
        publishedCount={selectedPublishedCount}
        onPublish={handleBatchPublish}
        onUnpublish={handleBatchUnpublish}
        publishing={publishing}
      />

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
                isPublishedCourse={isPublishedCourse}
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
                selectedLessons={selectedLessons}
                onToggleLessonSelect={toggleLessonSelect}
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
          onClose={() => handleEditorClose(editorLesson!.chapterId, editorLesson!.lessonId)}
          onSave={(data, t) => handleSaveContent("VIDEO", data, t)}
          initial={(editingLesson.content as VideoContent) ?? { videoUrl: "", durationSeconds: null, resources: [] }}
          lessonTitle={editingLesson.title}
          lessonId={editingLesson.id}
          onResolveLessonId={
            editingLesson.id.startsWith("temp_")
              ? () => {
                  const el = editorLesson!;
                  return resolveLessonId(el.chapterId, el.lessonId, "VIDEO", editingLesson.title);
                }
              : undefined
          }
        />
      )}
      {editingLesson && editingLesson.contentType === "TEXT" && (
        <TextLessonEditor
          open
          onClose={() => handleEditorClose(editorLesson!.chapterId, editorLesson!.lessonId)}
          onSave={(data, t) => handleSaveContent("TEXT", data, t)}
          initial={(editingLesson.content as TextContent) ?? { body: "" }}
          lessonTitle={editingLesson.title}
        />
      )}
      {editingLesson && editingLesson.contentType === "QUIZ" && (
        <QuizLessonEditor
          open
          onClose={() => handleEditorClose(editorLesson!.chapterId, editorLesson!.lessonId)}
          onSave={(data, t) => handleSaveContent("QUIZ", data, t)}
          initial={(editingLesson.content as QuizContent) ?? { questions: [] }}
          lessonTitle={editingLesson.title}
        />
      )}
    </div>
  );
}
