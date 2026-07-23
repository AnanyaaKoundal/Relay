"use client";

import { useEffect, useRef } from "react";

const POLL_INTERVAL = 3000;
const COOLDOWN_MS = 5000;

export function useProcessingPolling(
  lessons: { id: string; processingStatus?: string }[],
  onRefresh: () => void,
) {
  const hasActive = lessons.some(
    (l) => l.processingStatus === "PENDING" || l.processingStatus === "PROCESSING"
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSaveRef = useRef<number>(0);

  const markSaved = () => {
    lastSaveRef.current = Date.now();
  };

  useEffect(() => {
    if (!hasActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      if (Date.now() - lastSaveRef.current > COOLDOWN_MS) {
        onRefresh();
      }
    }, POLL_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [hasActive, onRefresh]);

  return { markSaved };
}
