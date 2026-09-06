"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VideoPlayer } from "@/components/learner/course-player/VideoPlayer";
import { TextRenderer } from "@/components/learner/course-player/text-renderer";
import { Spinner } from "@/components/shared/spinner";
import { getPreviewLesson } from "@/services/enrollment.service";
import type { EnrollmentLessonContent } from "@/types/enrollment.types";
import { PlayCircle, FileText, HelpCircle } from "lucide-react";

type PreviewModalProps = {
  lessonId: string;
  lessonTitle: string;
  contentType: string;
  open: boolean;
  onClose: () => void;
};

function QuizPreview({ content }: { content: EnrollmentLessonContent["content"] }) {
  const questions = content?.questions ?? [];
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Preview only — submit after enrolling.
      </p>
      {questions.map((q, i) => (
        <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
          <p className="text-sm font-medium">
            <span className="text-muted-foreground mr-2">{i + 1}.</span>
            {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, j) => (
              <div
                key={j}
                className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm bg-background"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                  {String.fromCharCode(65 + j)}
                </span>
                <span>{opt}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function contentTypeIcon(type: string) {
  switch (type) {
    case "VIDEO":
      return <PlayCircle className="size-4 text-blue-500" />;
    case "TEXT":
      return <FileText className="size-4 text-green-500" />;
    case "QUIZ":
      return <HelpCircle className="size-4 text-amber-500" />;
    default:
      return null;
  }
}

export function PreviewModal({ lessonId, lessonTitle, contentType, open, onClose }: PreviewModalProps) {
  const [data, setData] = useState<EnrollmentLessonContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !lessonId) {
      setData(null);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    getPreviewLesson(lessonId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load preview"))
      .finally(() => setLoading(false));
  }, [open, lessonId]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {contentTypeIcon(contentType)}
            {lessonTitle}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
            <Spinner />
            Loading preview...
          </div>
        )}

        {error && (
          <p className="text-sm text-muted-foreground py-8 text-center">{error}</p>
        )}

        {data && data.content && (
          <>
            {data.contentType === "VIDEO" && (
              <VideoPlayer
                videoUrl={data.content.videoUrl ?? null}
                hlsUrl={data.content.hlsUrl ?? null}
                processingStatus={data.content.processingStatus}
                title={data.title}
              />
            )}
            {data.contentType === "TEXT" && data.content.body && (
              <TextRenderer body={data.content.body} />
            )}
            {data.contentType === "QUIZ" && (
              <QuizPreview content={data.content} />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
