"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  checkEnrollment,
  getLessonContent,
  markLessonComplete,
} from "@/services/enrollment.service";
import type { EnrollmentDetail, EnrollmentLessonContent } from "@/types/enrollment.types";
import { ChapterSidebar } from "@/components/learner/course-player/chapter-sidebar";
import { CourseNavBar } from "@/components/learner/course-player/course-nav-bar";
import { VideoPlayer } from "@/components/learner/course-player/VideoPlayer";
import { TextRenderer } from "@/components/learner/course-player/text-renderer";
import { QuizPlayer } from "@/components/learner/course-player/quiz-player";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params.slug);

  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<EnrollmentLessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Flatten all lessons into an ordered list for prev/next navigation
  const allLessons = enrollment
    ? enrollment.course.chapters.flatMap((ch) => ch.lessons)
    : [];

  // Load enrollment
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    checkEnrollment(slug)
      .then((data) => {
        if (!data) {
          router.replace(`/courses/${slug}`);
          return;
        }
        setEnrollment(data);
        // Set first incomplete lesson, or first lesson
        const completedIds = new Set(data.progress.map((p) => p.lessonId));
        const firstIncomplete = data.course.chapters
          .flatMap((ch) => ch.lessons)
          .find((l) => !completedIds.has(l.id));
        const firstLesson = data.course.chapters[0]?.lessons[0];
        setCurrentLessonId(
          firstIncomplete?.id ?? firstLesson?.id ?? null,
        );
      })
      .catch(() => router.replace(`/courses/${slug}`))
      .finally(() => setLoading(false));
  }, [slug, router]);

  // Load lesson content when currentLessonId changes
  useEffect(() => {
    if (!currentLessonId) return;
    setContentLoading(true);
    setLessonContent(null);
    getLessonContent(currentLessonId)
      .then(setLessonContent)
      .catch(() => setLessonContent(null))
      .finally(() => setContentLoading(false));
  }, [currentLessonId]);

  const completedLessonIds: Set<string> = enrollment
    ? new Set(enrollment.progress.map((p) => p.lessonId))
    : new Set<string>();

  const lessonCompletedDates: Map<string, string> = enrollment
    ? new Map(enrollment.progress.map((p) => [p.lessonId, p.completedAt]))
    : new Map();

  const handleMarkComplete = useCallback(async () => {
    if (!currentLessonId || completing) return;
    setCompleting(true);
    try {
      const result = await markLessonComplete(currentLessonId);
      // Update enrollment progress locally
      setEnrollment((prev) => {
        if (!prev) return prev;
        const alreadyDone = prev.progress.some(
          (p) => p.lessonId === currentLessonId,
        );
        const newProgress = alreadyDone
          ? prev.progress
          : [
              ...prev.progress,
              { lessonId: currentLessonId, completedAt: new Date().toISOString() },
            ];
        return {
          ...prev,
          progressPercent: result.progressPercent,
          status: result.courseCompleted ? "COMPLETED" : prev.status,
          ...(result.courseCompleted && !prev.completedAt && { completedAt: new Date().toISOString() }),
          progress: newProgress,
        };
      });
    } catch {
      // keep current state
    } finally {
      setCompleting(false);
    }
  }, [currentLessonId, completing]);

  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allLessons.length - 1;

  function goToPrev() {
    if (hasPrev) setCurrentLessonId(allLessons[currentIndex - 1].id);
  }
  function goToNext() {
    if (hasNext) setCurrentLessonId(allLessons[currentIndex + 1].id);
  }

  if (loading || !enrollment) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm gap-2">
        <Spinner />
        Loading course...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 border-r overflow-y-auto">
        <div className="p-4">
          <ChapterSidebar
            chapters={enrollment.course.chapters}
            currentLessonId={currentLessonId ?? ""}
            completedLessonIds={completedLessonIds}
            enrolledAt={enrollment.enrolledAt}
            enrollmentCompletedAt={enrollment.completedAt}
            lessonCompletedDates={lessonCompletedDates}
            onSelectLesson={setCurrentLessonId}
          />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <CourseNavBar
          courseTitle={enrollment.course.title}
          courseSlug={slug}
          progressPercent={enrollment.progressPercent}
          isCompleting={completing}
          isCompleted={currentLessonId ? completedLessonIds.has(currentLessonId) : false}
          onMarkComplete={handleMarkComplete}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
            {contentLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
                <Spinner />
                Loading lesson...
              </div>
            ) : !lessonContent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No content available for this lesson.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold">
                  {lessonContent.title}
                </h2>

                {/* Content renderer */}
                {lessonContent.contentType === "VIDEO" && (
                  <VideoPlayer
                    videoUrl={lessonContent.content?.videoUrl ?? null}
                    hlsUrl={lessonContent.content?.hlsUrl ?? null}
                    processingStatus={lessonContent.content?.processingStatus}
                    title={lessonContent.title}
                  />
                )}

                {lessonContent.contentType === "TEXT" &&
                  lessonContent.content?.body && (
                    <TextRenderer body={lessonContent.content.body} />
                  )}

                {lessonContent.contentType === "QUIZ" &&
                  lessonContent.content?.questions && currentLessonId && (
                    <QuizPlayer
                      lessonId={currentLessonId}
                      questions={lessonContent.content.questions}
                      passThreshold={lessonContent.content.passThreshold}
                      onComplete={(progressPercent, courseCompleted) => {
                        setEnrollment((prev) => {
                          if (!prev) return prev;
                          const alreadyDone = prev.progress.some(
                            (p) => p.lessonId === currentLessonId,
                          );
                          const newProgress = alreadyDone
                            ? prev.progress
                            : [
                                ...prev.progress,
                                { lessonId: currentLessonId, completedAt: new Date().toISOString() },
                              ];
                          return {
                            ...prev,
                            progressPercent,
                            status: courseCompleted ? "COMPLETED" : prev.status,
                            ...(courseCompleted && !prev.completedAt && { completedAt: new Date().toISOString() }),
                            progress: newProgress,
                          };
                        });
                      }}
                    />
                  )}

                {/* Prev / Next navigation */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <button
                    type="button"
                    onClick={goToPrev}
                    disabled={!hasPrev}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    disabled={!hasNext}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
