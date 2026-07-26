"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCourse } from "@/services/course.service";
import { useConfirm } from "@/components/shared/confirm-modal";
import { useProcessingPolling } from "@/hooks/useProcessingPolling";
import { useCourseActions } from "@/hooks/useCourseActions";
import { VideoLessonEditor } from "@/components/studio/VideoLessonEditor";
import { TextLessonEditor } from "@/components/studio/TextLessonEditor";
import { QuizLessonEditor } from "@/components/studio/QuizLessonEditor";
import { loadAllChapters } from "@/lib/course-builder-utils";
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
} from "@/components/studio/course-builder";
import {
  Loader2,
} from "lucide-react";
import { useChapterManager } from "@/hooks/useChapterManager";
import { useLessonManager } from "@/hooks/useLessonManager";
import { ActionBar } from "@/components/studio/course-builder/action-bar";
import { CourseDetailsForm } from "@/components/studio/course-builder/course-details-form";
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



  /* ── Refresh lesson statuses from backend ── */
  const refreshLessonStatuses = useCallback(async () => {
    if (!params?.courseId) return;
    setChapters(await loadAllChapters(params!.courseId));
  }, [params?.courseId]);

  /* ── Auto-poll PROCESSING/PENDING lessons ── */
  const { markSaved } = useProcessingPolling(allLessons, refreshLessonStatuses);

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
      <ActionBar
        courseStatus={course.status}
        totalDraftCount={totalDraftCount}
        publishing={publishing}
        onPublishAllChanges={handlePublishAllChanges}
        onDiscardDraft={handleDiscardDraft}
        onPublishCourse={handlePublishCourse}
      />

      {/* Course Details */}
      <CourseDetailsForm
        price={course.price}
        difficulty={course.difficulty}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        chapters={chapters}
        totalLessons={totalLessons}
        totalDraftCount={totalDraftCount}
        saved={saved}
        saving={saving}
        onSave={handleSave}
      />

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
