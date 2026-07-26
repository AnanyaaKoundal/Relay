"use client"

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { useConfirm } from "@/components/shared/confirm-modal";
import * as chapterApi from "@/services/chapter.service";
import {
    type Chapter,
    mapBackendChapter,
} from "@/components/studio/course-builder";

interface useChapterManagerParams {
    courseId: string,
    chapters: Chapter[],
    setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>,
    markSaved: () => void,
    isPublishedCourse: boolean,
    confirm: (opts: any) => Promise<boolean>;
}

export function useChapterManager({
    courseId,
    chapters,
    setChapters,
    markSaved,
    isPublishedCourse,
    confirm
}: useChapterManagerParams) {

    /* ── Add Chapter (immediate backend save) ── */
    const handleAddChapter = useCallback(async () => {
        if (!courseId) return;
        try {
            const ch = await chapterApi.createChapter(courseId, `Chapter ${chapters.length + 1}`);
            setChapters((prev) => [...prev, mapBackendChapter(ch)]);
        } catch { /* silent */ }
    }, [courseId, chapters.length]);

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

    return {
        handleAddChapter,
        handleDeleteChapter,
        handleUpdateChapterTitle
    }
}