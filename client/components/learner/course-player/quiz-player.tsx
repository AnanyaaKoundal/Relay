"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

type QuizPlayerProps = {
  questions: Question[];
};

export function QuizPlayer({ questions }: QuizPlayerProps) {
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSelect(qIndex: number, oIndex: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }));
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function score() {
    let correct = 0;
    for (const q of questions) {
      const qIndex = questions.indexOf(q);
      if (answers[qIndex] === q.correctAnswer) correct++;
    }
    return correct;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {questions.length} Question{questions.length !== 1 ? "s" : ""}
        </h3>
        {submitted && (
          <span className="text-sm text-muted-foreground">
            {score()}/{questions.length} correct
          </span>
        )}
      </div>

      {questions.map((q, qIndex) => {
        const selected = answers[qIndex] ?? null;
        const isCorrect = q.correctAnswer === selected;

        return (
          <div
            key={qIndex}
            className="rounded-xl border bg-card p-5 space-y-4"
          >
            <p className="text-sm font-medium">
              <span className="text-muted-foreground mr-2">{qIndex + 1}.</span>
              {q.question}
            </p>

            <div className="space-y-2">
              {q.options.map((opt, oIndex) => {
                const isSelected = selected === oIndex;
                const isCorrectOption = q.correctAnswer === oIndex;

                let optionClass = "border bg-background hover:border-primary/50";
                if (submitted) {
                  if (isCorrectOption) {
                    optionClass = "border-green-500 bg-green-500/10";
                  } else if (isSelected && !isCorrectOption) {
                    optionClass = "border-red-500 bg-red-500/10";
                  }
                } else if (isSelected) {
                  optionClass = "border-primary bg-primary/5";
                }

                return (
                  <button
                    key={oIndex}
                    type="button"
                    onClick={() => handleSelect(qIndex, oIndex)}
                    disabled={submitted}
                    className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${optionClass}`}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                      {String.fromCharCode(65 + oIndex)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {submitted && isCorrectOption && (
                      <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                    )}
                    {submitted && isSelected && !isCorrectOption && (
                      <XCircle className="size-4 text-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {submitted && q.explanation && (
              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                <span className="font-medium">Explanation:</span>{" "}
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Quiz
        </button>
      )}
    </div>
  );
}
