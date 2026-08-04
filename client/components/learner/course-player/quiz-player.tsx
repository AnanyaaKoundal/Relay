"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";
import { submitQuizAttempt, getQuizAttempts } from "@/services/enrollment.service";
import type { QuizAttemptResult } from "@/types/enrollment.types";

type Question = {
  question: string;
  options: string[];
  explanation?: string;
};

type QuizPlayerProps = {
  lessonId: string;
  questions: Question[];
  passThreshold?: number;
  onComplete?: (progressPercent: number, courseCompleted: boolean) => void;
};

export function QuizPlayer({ lessonId, questions, passThreshold = 60, onComplete }: QuizPlayerProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [bestScore, setBestScore] = useState<{ score: number; total: number } | null>(null);
  const [error, setError] = useState("");

  // Load previous attempts on mount
  useEffect(() => {
    getQuizAttempts(lessonId)
      .then((res) => {
        if (res.bestTotal > 0) {
          setBestScore({ score: res.bestScore, total: res.bestTotal });
        }
      })
      .catch(() => {});
  }, [lessonId]);

  function handleSelect(qIndex: number, oIndex: number) {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const answersArray = questions.map((_, i) => answers[i] ?? -1);
      const res = await submitQuizAttempt(lessonId, answersArray);
      setResult(res);
      setBestScore((prev) => {
        if (!prev || res.score > prev.score) {
          return { score: res.score, total: res.total };
        }
        return prev;
      });
      onComplete?.(res.progressPercent, res.courseCompleted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
    setError("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {questions.length} Question{questions.length !== 1 ? "s" : ""}
        </h3>
        {result && (
          <div className="flex items-center gap-3">
            {bestScore && bestScore.score === result.score && (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <Trophy className="size-3.5" />
                Best score
              </span>
            )}
            <span className={`text-sm font-medium ${result.passed ? "text-emerald-600" : "text-amber-600"}`}>
              {result.score}/{result.total} correct ({Math.round((result.score / result.total) * 100)}%)
            </span>
          </div>
        )}
        {!result && bestScore && (
          <span className="text-xs text-muted-foreground">
            Best: {bestScore.score}/{bestScore.total}
          </span>
        )}
      </div>

      {/* Pass threshold note */}
      {!result && passThreshold > 0 && (
        <p className="text-xs text-muted-foreground">
          Pass threshold: {passThreshold}%
        </p>
      )}

      {/* Error */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Questions */}
      {questions.map((q, qIndex) => {
        const selected = answers[qIndex] ?? null;
        const isCorrect = result?.perQuestionCorrect[qIndex] ?? null;

        return (
          <div key={qIndex} className="rounded-xl border bg-card p-5 space-y-4">
            <p className="text-sm font-medium">
              <span className="text-muted-foreground mr-2">{qIndex + 1}.</span>
              {q.question}
            </p>

            <div className="space-y-2">
              {q.options.map((opt, oIndex) => {
                const isSelected = selected === oIndex;

                let optionClass = "border bg-background hover:border-primary/50";
                if (result) {
                  // Server judged: show correct/incorrect
                  if (isCorrect !== null) {
                    if (isCorrect && isSelected) {
                      optionClass = "border-green-500 bg-green-500/10";
                    } else if (!isCorrect && isSelected) {
                      optionClass = "border-red-500 bg-red-500/10";
                    }
                  }
                } else if (isSelected) {
                  optionClass = "border-primary bg-primary/5";
                }

                return (
                  <button
                    key={oIndex}
                    type="button"
                    onClick={() => handleSelect(qIndex, oIndex)}
                    disabled={!!result}
                    className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${optionClass}`}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                      {String.fromCharCode(65 + oIndex)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {result && isCorrect !== null && (
                      <>
                        {isCorrect && isSelected && (
                          <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                        )}
                        {!isCorrect && isSelected && (
                          <XCircle className="size-4 text-red-500 shrink-0" />
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation after submission */}
            {result && (
              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                {q.explanation ? (
                  <>
                    <span className="font-medium">Explanation:</span> {q.explanation}
                  </>
                ) : (
                  <span className="text-muted-foreground/60">No explanation provided.</span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Actions */}
      {!result && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length < questions.length}
          className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit Quiz"}
        </button>
      )}

      {result && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex h-10 items-center gap-2 rounded-lg border px-6 text-sm font-medium hover:bg-muted transition-colors"
          >
            <RotateCcw className="size-4" />
            Try again
          </button>
          {result.passed && (
            <span className="text-sm text-emerald-600 font-medium">
              Passed! You can continue to the next lesson.
            </span>
          )}
          {!result.passed && (
            <span className="text-sm text-amber-600">
              Below {passThreshold}% threshold. Try again to pass.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
