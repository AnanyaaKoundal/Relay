"use client";

import { updateCourse } from "@/services/course.service";
import * as chapterApi from "@/services/chapter.service";
import * as lessonApi from "@/services/lesson.service";
import type { CourseDetail } from "@/types/course.types";
import type { Chapter, Lesson } from "@/components/studio/course-builder";

interface UseCourseActionsParams {
  courseId: string;
  course: CourseDetail;
  setCourse: React.Dispatch<React.SetStateAction<CourseDetail | null>>;
  title: string;
  description: string;
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  allLessons: Lesson[];
  selectedLessons: Set<string>;
  setSelectedLessons: React.Dispatch<React.SetStateAction<Set<string>>>;
  totalDraftCount: number;
  confirm: (opts: any) => Promise<boolean>;
  refreshLessonStatuses: () => Promise<void>;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  setSaved: React.Dispatch<React.SetStateAction<boolean>>;
  setPublishing: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useCourseActions({
  courseId,
  course,
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
}: UseCourseActionsParams) {
  /* ── Save course details (title/description) ── */
  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updateCourse(courseId, { title, description });
      setCourse({ ...course, ...updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  }

  /* ── Publish course (DRAFT → PUBLISHED) ── */
  async function handlePublishCourse() {
    const ok = await confirm({
      title: "Publish course",
      description:
        "Your course will become visible to learners. All draft lessons will be published and chapter title changes will be applied.",
      confirmLabel: "Publish",
    });
    if (!ok) return;
    setPublishing(true);
    try {
      const updated = await updateCourse(courseId, { status: "PUBLISHED" });
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
      const updated = await updateCourse(courseId, { status: "DRAFT" });
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
      setChapters(prev => prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(l =>
          ids.includes(l.id) ? { ...l, status: "PUBLISHED" as const } : l
        )
      })));
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
      setChapters(prev => prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(l =>
          ids.includes(l.id) ? { ...l, status: "DRAFT" as const } : l
        )
      })));
    } catch { /* silent */ } finally {
      setPublishing(false);
    }
  }

  /* ── Publish All Changes (published course) ── */
  async function handlePublishAllChanges() {
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
      const chapterIds = chapters.map((c) => c.id);
      if (chapterIds.length > 0) {
        await chapterApi.publishChapterTitles(chapterIds);
      }
      setSelectedLessons(new Set());
      setChapters(prev => prev.map(ch => ({
        ...ch,
        title: ch.titleDraft ?? ch.title,
        titleDraft: null,
        lessons: ch.lessons.map(l =>
          draftIds.includes(l.id) ? { ...l, status: "PUBLISHED" as const } : l
        )
      })));
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

  return {
    handleSave,
    handlePublishCourse,
    handleDiscardDraft,
    handleBatchPublish,
    handleBatchUnpublish,
    handlePublishAllChanges,
  };
}
