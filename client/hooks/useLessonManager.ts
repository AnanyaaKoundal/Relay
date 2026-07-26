"use client";

import { useCallback, useRef } from "react";
import * as lessonApi from "@/services/lesson.service";
import { quizToBackendPayload } from "@/lib/course-builder-utils";
import type {
    LessonType,
    LessonContent,
    VideoContent,
    TextContent,
    QuizContent,
} from "@/types/lesson.types";
import {
    type Chapter,
} from "@/components/studio/course-builder";

interface useLessonManagerParams {
    editorLesson: { chapterId: string; lessonId: string; } | null,
    setEditorLesson: React.Dispatch<React.SetStateAction<{ chapterId: string; lessonId: string; } | null>>,
    tempLessonMeta: { chapterId: string; type: LessonType; title: string; } | null,
    setTempLessonMeta: React.Dispatch<React.SetStateAction<{ chapterId: string; type: LessonType; title: string; } | null>>,
    chapters: Chapter[],
    setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>,
    markSaved: () => void,
    confirm: (opts: any) => Promise<boolean>;
}

export function useLessonManager({
    editorLesson,
    setEditorLesson,
    tempLessonMeta,
    setTempLessonMeta,
    chapters,
    setChapters,
    markSaved,
    confirm,
}: useLessonManagerParams) {

    const editorLessonRef = useRef(editorLesson);

    /* ── Add Lesson (deferred: only opens editor, no backend call, no UI row) ── */
    const handleAddLesson = useCallback(async (chapterId: string, type: LessonType) => {
        const typeLabels: Record<LessonType, string> = {
            VIDEO: "New Video Lesson",
            TEXT: "New Text Lesson",
            QUIZ: "New Quiz",
        };
        const tempId = `temp_${crypto.randomUUID()}`;
        pendingLessonRef.current = null;
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

    /* ── Pending lesson data (for adding to chapters on modal close) ── */
    const pendingLessonRef = useRef<{
        chapterId: string;
        id: string;
        title: string;
        contentType: LessonType;
        durationSeconds: number | null;
        content: LessonContent;
    } | null>(null);

    /* ── Save lesson content from editor ── */
    const handleSaveContent = useCallback(
        async (type: LessonType, data: LessonContent, newTitle: string) => {
            const current = editorLessonRef.current;
            if (!current) return;
            const { chapterId, lessonId } = current;
            const isNew = !!tempLessonMeta && tempLessonMeta.chapterId === chapterId;

            if (isNew) {
                let savedId = lessonId;

                if (type === "VIDEO") {
                    const v = data as VideoContent;
                    await lessonApi.updateLesson(lessonId, {
                        title: newTitle,
                        videoUrl: v.videoUrl,
                        durationSeconds: v.durationSeconds,
                    });
                    savedId = lessonId;
                } else {
                    const created = await lessonApi.createLesson(chapterId, {
                        title: newTitle,
                        contentType: type,
                        ...(type === "TEXT"
                            ? { body: (data as TextContent).body }
                            : { questions: quizToBackendPayload(data as QuizContent) }),
                    });
                    savedId = created.id;
                }

                // Don't add to chapters yet — wait for modal close
                pendingLessonRef.current = {
                    chapterId,
                    id: savedId,
                    title: newTitle,
                    contentType: type,
                    durationSeconds: type === "VIDEO" ? (data as VideoContent).durationSeconds : null,
                    content: data,
                };
                setEditorLesson({ chapterId, lessonId: savedId });
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
        [markSaved, tempLessonMeta]
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

    /* ── Editor close: add pending lesson to chapters ── */
    const handleEditorClose = useCallback(async (chapterId: string, lessonId: string) => {
        setEditorLesson(null);
        setTempLessonMeta(null);

        const pending = pendingLessonRef.current;
        if (pending && pending.chapterId === chapterId) {
            setChapters((prev) =>
                prev.map((c) =>
                    c.id === chapterId
                        ? {
                            ...c,
                            isExpanded: true,
                            lessons: [
                                ...c.lessons,
                                {
                                    id: pending.id,
                                    title: pending.title,
                                    contentType: pending.contentType,
                                    durationSeconds: pending.durationSeconds,
                                    isPreview: false,
                                    status: "DRAFT" as const,
                                    content: pending.content,
                                },
                            ],
                        }
                        : c
                )
            );
            pendingLessonRef.current = null;
        }
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

    return {
        handleAddLesson,
        handleUpdateLessonTitle,
        handleSaveContent,
        handleDeleteLesson,
        handleToggleLessonPreview,
        handleToggleChapterPreview,
        handleEditorClose,
        resolveLessonId,
        findEditingLesson,
        editorLessonRef,
        pendingLessonRef,
    };

}