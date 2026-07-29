"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as courseApi from "@/services/course.service";
import * as lessonApi from "@/services/lesson.service";
import { useConfirm } from "@/components/shared/confirm-modal";
import { useProcessingPolling } from "@/hooks/useProcessingPolling";
import { useCourseActions } from "@/hooks/useCourseActions";
import { VideoLessonEditor } from "@/components/studio/VideoLessonEditor";
import { TextLessonEditor } from "@/components/studio/TextLessonEditor";
import { QuizLessonEditor } from "@/components/studio/QuizLessonEditor";
import type {
  LessonType,
  VideoContent,
  TextContent,
  QuizContent,
} from "@/types/lesson.types";
import type { CourseDetail } from "@/types/course.types";
import {
  PublishToolbar,
  type Chapter,
  mapBackendChapter
} from "@/components/studio/course-builder";
import Image from "next/image";
import { BookOpen, FileText, Users, FileEdit, DollarSign } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { useChapterManager } from "@/hooks/useChapterManager";
import { useLessonManager } from "@/hooks/useLessonManager";
import { ActionBar } from "@/components/studio/course-builder/action-bar";
import { ChapterSection } from "@/components/studio/course-builder/chapters-section";

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

  useEffect(() => { editorLessonRef.current = editorLesson; }, [editorLesson]);

  const [tempLessonMeta, setTempLessonMeta] = useState<{
    chapterId: string;
    type: LessonType;
    title: string;
  } | null>(null);





  /* ── Load course + chapters from backend ── */
  useEffect(() => {
    if (!params?.courseId) return;
    let cancelled = false;

    async function load() {
      try {
        const workspace = await courseApi.getCourseWorkspace(params!.courseId);

        if (cancelled) return;

        if (!cancelled) {
          setCourse(workspace);
          setTitle(workspace.title);
          setDescription(workspace.description);
          setChapters(workspace.chapters.map(mapBackendChapter));
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



  const refreshLessonStatuses = useCallback(async () => {
    if (!params?.courseId) return;
    const workspace = await courseApi.getCourseWorkspace(params!.courseId);
    setChapters(workspace.chapters.map(mapBackendChapter));
  }, [params?.courseId]);

  /* ── Auto-poll PROCESSING/PENDING lessons ── */
  const { markSaved } = useProcessingPolling(params!.courseId, chapters, setChapters);

  /* ── Course publish/save actions (extracted) ── */
  const {
    handleSave,
    handlePublishCourse,
    handleDiscardDraft,
    handleBatchPublish,
    handleBatchUnpublish,
    handlePublishAllChanges,
  } = useCourseActions({
    courseId: params.courseId!,
    course: course!,
    setCourse,
    title,
    description,
    chapters,
    setChapters,
    allLessons,
    selectedLessons,
    setSelectedLessons,
    totalDraftCount,
    confirm,
    refreshLessonStatuses,
    setSaving,
    setSaved,
    setPublishing,
  });

  const { handleAddChapter, handleDeleteChapter, handleUpdateChapterTitle } = useChapterManager({
    courseId: params.courseId!,
    chapters,
    setChapters,
    markSaved,
    isPublishedCourse,
    confirm
  });

  const { handleAddLesson, handleUpdateLessonTitle, handleSaveContent, handleDeleteLesson,
    handleToggleLessonPreview, handleToggleChapterPreview, handleEditorClose, resolveLessonId,
    findEditingLesson, editorLessonRef, pendingLessonRef,
  } = useLessonManager({
    editorLesson,
    setEditorLesson,
    tempLessonMeta,
    setTempLessonMeta,
    chapters,
    setChapters,
    markSaved,
    confirm
  })


  const handleRetryTranscode = useCallback(async (lessonId: string) => {
    const el = editorLessonRef.current;
    if (!el) return;
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === el.chapterId
          ? { ...ch, lessons: ch.lessons.map((l) => (l.id === lessonId ? { ...l, processingStatus: "PROCESSING" } : l)) }
          : ch
      )
    );
    await lessonApi.retryTranscode(lessonId);
  }, []);

  const totalLessons = chapters.reduce((acc, c) => acc + c.lessons.length, 0);
  const editingLesson = findEditingLesson();
  const isContentLoading = editorLesson && !editorLesson.lessonId.startsWith("temp_") && editingLesson && !editingLesson.content;

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-muted-foreground text-sm gap-2">
        <Spinner />
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
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Top Action Bar */}
      <ActionBar
        courseId={params.courseId!}
        courseStatus={course.status}
        totalDraftCount={totalDraftCount}
        publishing={publishing}
        onPublishAllChanges={handlePublishAllChanges}
        onDiscardDraft={handleDiscardDraft}
        onPublishCourse={handlePublishCourse}
      />

      {/* Course Banner */}
      <div className="rounded-xl border bg-card flex overflow-hidden h-60">
        <div className="relative w-1/2 shrink-0 bg-muted">
          <Image
            src={course.thumbnailUrl || "/thumbnail.avif"}
            alt={course.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col p-4 min-w-0">
          <h1 className="text-2xl font-bold leading-tight truncate mb-0.5">{course.title}</h1>
          <div className="mb-1.5 flex items-center gap-2">
            <StatusBadge status={course.status} />
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {Number(course.price) === 0 ? "Free" : `$${Number(course.price).toFixed(2)}`}
            </span>
          </div>
          {course.description && (
            <p className="mt-0.5 text-xs text-foreground leading-relaxed line-clamp-2">
              <span className="text-muted-foreground">Description: </span>
              {course.description}
            </p>
          )}
          <Link
            href={`/studio/courses/${params.courseId}/settings`}
            className="mt-1 text-xs text-primary hover:underline w-fit"
          >
            Edit course details →
          </Link>
          <div className="mt-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-1.5">
                <BookOpen className="size-7 text-muted-foreground" />
                <span className="text-lg font-semibold">{chapters.length}</span>
                <span className="text-[15px] text-muted-foreground">chapters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="size-7 text-muted-foreground" />
                <span className="text-lg font-semibold">{totalLessons}</span>
                <span className="text-[15px] text-muted-foreground">lessons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileEdit className="size-7 text-muted-foreground" />
                <span className="text-lg font-semibold">{totalDraftCount}</span>
                <span className="text-[15px] text-muted-foreground">drafts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="size-7 text-muted-foreground" />
                <span className="text-lg font-semibold">{(course._count?.enrollments ?? 0).toLocaleString()}</span>
                <span className="text-[15px] text-muted-foreground">enrolled</span>
              </div>
            </div>
          </div>
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
      <ChapterSection
        chapters={chapters}
        setChapters={setChapters}
        totalLessons={totalLessons}
        isPublishedCourse={isPublishedCourse}
        selectedLessons={selectedLessons}
        onToggleLessonSelect={toggleLessonSelect}
        onAddChapter={handleAddChapter}
        onUpdateChapterTitle={handleUpdateChapterTitle}
        onDeleteChapter={handleDeleteChapter}
        onAddLesson={handleAddLesson}
        onUpdateLessonTitle={handleUpdateLessonTitle}
        onDeleteLesson={handleDeleteLesson}
        onToggleLessonPreview={handleToggleLessonPreview}
        onToggleChapterPreview={handleToggleChapterPreview}
        onOpenLessonEditor={(chapterId, lessonId) => setEditorLesson({ chapterId, lessonId })}
      />

      {/* Lesson Editors */}
      {editingLesson && editingLesson.contentType === "VIDEO" && (
        <VideoLessonEditor
          open
          onClose={() => handleEditorClose(editorLesson!.chapterId, editorLesson!.lessonId)}
          onSave={(data, t) => handleSaveContent("VIDEO", data, t)}
          initial={(editingLesson.content as VideoContent) ?? { videoUrl: "", durationSeconds: null, resources: [] }}
          lessonTitle={editingLesson.title}
          lessonId={editingLesson.id}
          processingStatus={editingLesson.processingStatus}
          onRetry={handleRetryTranscode}
          isLoading={!!isContentLoading}
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
          isLoading={!!isContentLoading}
        />
      )}
      {editingLesson && editingLesson.contentType === "QUIZ" && (
        <QuizLessonEditor
          open
          onClose={() => handleEditorClose(editorLesson!.chapterId, editorLesson!.lessonId)}
          onSave={(data, t) => handleSaveContent("QUIZ", data, t)}
          initial={(editingLesson.content as QuizContent) ?? { questions: [] }}
          lessonTitle={editingLesson.title}
          isLoading={!!isContentLoading}
        />
      )}
    </div>
  );
}
