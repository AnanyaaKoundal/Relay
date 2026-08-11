"use client";

import { Chapter } from "@/components/studio/course-builder/types";
import { getProcessingStatus } from "@/services/lesson.service";
import { useEffect, useRef } from "react";

const POLL_INTERVAL = 3000;
const COOLDOWN_MS = 5000;

export function useProcessingPolling(
  courseId: string,
  chapters: Chapter[],
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>,
  isEditorOpen: boolean
) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSaveRef = useRef<number>(0);
  const chaptersRef = useRef(chapters);
  chaptersRef.current = chapters;

  const markSaved = () => {
    lastSaveRef.current = Date.now();
  };

  function startPolling() {
    if (timerRef.current) return;
    timerRef.current = setInterval(poll, POLL_INTERVAL);
  }

  function stopPolling() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function poll() {
    if (isEditorOpen) return;
    if (Date.now() - lastSaveRef.current < COOLDOWN_MS) return;

    try {
      const statuses = await getProcessingStatus(courseId);
      const statusMap = new Map(statuses.map(s => [s.lessonId, s.processingStatus]));
      const current = chaptersRef.current;

      // Check if any status actually changed before updating state
      let changed = false;
      for (const ch of current) {
        for (const l of ch.lessons) {
          const newStatus = statusMap.get(l.id);
          if (newStatus !== undefined && newStatus !== l.processingStatus) {
            changed = true;
            break;
          }
          if (!statusMap.has(l.id) && (l.processingStatus === "PROCESSING" || l.processingStatus === "PENDING")) {
            changed = true;
            break;
          }
        }
        if (changed) break;
      }

      if (changed) {
        setChapters(prev => prev.map(ch => ({
          ...ch,
          lessons: ch.lessons.map(l => {
            const newStatus = statusMap.get(l.id);
            if (newStatus !== undefined && newStatus !== l.processingStatus) {
              return { ...l, processingStatus: newStatus };
            }
            if (!statusMap.has(l.id) && (l.processingStatus === "PROCESSING" || l.processingStatus === "PENDING")) {
              return { ...l, processingStatus: undefined };
            }
            return l; // same reference — no re-render for this lesson
          })
        })));
      }

      if (statuses.length === 0) stopPolling();
    } catch {
      // Server might be temporarily unreachable — keep polling
    }
  }

  // Start/stop polling based on whether any lesson needs tracking
  useEffect(() => {
    if (isEditorOpen) {
      stopPolling();
      return;
    }
    const needsPolling = chapters.some(ch =>
      ch.lessons.some(l => l.processingStatus === "PROCESSING" || l.processingStatus === "PENDING")
    );
    if (needsPolling) startPolling();
    else stopPolling();

    return stopPolling;
  }, [chapters, courseId, isEditorOpen]);

  return { markSaved };
}
