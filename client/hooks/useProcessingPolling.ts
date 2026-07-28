"use client";

import { Chapter } from "@/components/studio/course-builder/types";
import { getProcessingStatus } from "@/services/lesson.service";
import { useEffect, useRef } from "react";

const POLL_INTERVAL = 3000;
const COOLDOWN_MS = 5000;

export function useProcessingPolling(
  courseId: string,
  chapters: Chapter[],
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>
) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSaveRef = useRef<number>(0);

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
    if (Date.now() - lastSaveRef.current < COOLDOWN_MS) return;

    try {
      const statuses = await getProcessingStatus(courseId);
      const statusMap = new Map(statuses.map(s => [s.lessonId, s.processingStatus]));

      setChapters(prev => {
        const anyPending = prev.some(ch =>
          ch.lessons.some(l => l.processingStatus === "PROCESSING" || l.processingStatus === "PENDING")
        );
        return prev.map(ch => ({
          ...ch,
          lessons: ch.lessons.map(l =>
            statusMap.has(l.id)
              ? { ...l, processingStatus: statusMap.get(l.id) }
              : l.processingStatus === "PROCESSING" || l.processingStatus === "PENDING"
                ? { ...l, processingStatus: undefined }
                : l
          )
        }));
      });

      if (statuses.length === 0) stopPolling();
    } catch {
      // Server might be temporarily unreachable — keep polling
    }
  }

  // Start/stop polling based on whether any lesson needs tracking
  useEffect(() => {
    const needsPolling = chapters.some(ch =>
      ch.lessons.some(l => l.processingStatus === "PROCESSING" || l.processingStatus === "PENDING")
    );
    if (needsPolling) startPolling();
    else stopPolling();

    return stopPolling;
  }, [chapters, courseId]);

  return { markSaved };
}
