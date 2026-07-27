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

  useEffect(() => {
    timerRef.current = setInterval(async () => {
      if (Date.now() - lastSaveRef.current < COOLDOWN_MS) return;

      const statuses = await getProcessingStatus(courseId);
      if (statuses.length === 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        return;
      }

      const statusMap = new Map(statuses.map(s => [s.lessonId, s.processingStatus]));
      setChapters(prev => prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(l =>
          statusMap.has(l.id)
            ? { ...l, processingStatus: statusMap.get(l.id) }
            : l
        )
      })));
    }, POLL_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [courseId]);

  return { markSaved };
}
