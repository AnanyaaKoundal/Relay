"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Plus,
  Trash2,
  HelpCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type { QuizQuestion, QuizContent } from "@/types/lesson.types";

let qId = 0;
function qid() {
  return `q_${++qId}_${Date.now()}`;
}

export function QuizLessonEditor({
  open,
  onClose,
  onSave,
  initial,
  lessonTitle,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: QuizContent, title: string) => void;
  initial: QuizContent;
  lessonTitle: string;
}) {
  const [title, setTitle] = useState(lessonTitle);
  const [questions, setQuestions] = useState<QuizQuestion[]>(initial.questions);

  function addQuestion() {
    const newQ: QuizQuestion = {
      id: qid(),
      question: "",
      options: [
        { id: qid(), text: "" },
        { id: qid(), text: "" },
      ],
      correctOptionId: "",
      explanation: "",
    };
    setQuestions((prev) => [...prev, newQ]);
  }

  function updateQuestion(qId: string, updates: Partial<QuizQuestion>) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, ...updates } : q))
    );
  }

  function deleteQuestion(qId: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== qId));
  }

  function addOption(qId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: [...q.options, { id: qid(), text: "" }] }
          : q
      )
    );
  }

  function updateOption(qId: string, oId: string, text: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
            ...q,
            options: q.options.map((o) =>
              o.id === oId ? { ...o, text } : o
            ),
          }
          : q
      )
    );
  }

  function removeOption(qId: string, oId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.filter((o) => o.id !== oId) }
          : q
      )
    );
  }

  function handleSave() {
    onSave({ questions }, title.trim() || lessonTitle);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="size-4 text-amber-500" />
            Edit Quiz
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Quiz Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              placeholder="e.g. React Hooks Quiz"
            />
          </div>

          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={q.id} className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="size-6 flex items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {qi + 1}
                  </span>
                  <input
                    value={q.question}
                    onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                    className="flex-1 h-8 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                    placeholder="Enter your question..."
                  />
                  <button
                    type="button"
                    onClick={() => deleteQuestion(q.id)}
                    className="shrink-0 size-7 flex items-center justify-center rounded text-muted-foreground/40 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="ml-8 space-y-2">
                  {q.options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuestion(q.id, { correctOptionId: opt.id })}
                        className="shrink-0"
                        title={q.correctOptionId === opt.id ? "Correct answer" : "Mark as correct"}
                      >
                        {q.correctOptionId === opt.id ? (
                          <CheckCircle2 className="size-4 text-emerald-500" />
                        ) : (
                          <Circle className="size-4 text-muted-foreground/30 hover:text-muted-foreground" />
                        )}
                      </button>
                      <input
                        value={opt.text}
                        onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                        className="flex-1 h-8 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                        placeholder={`Option ${q.options.indexOf(opt) + 1}`}
                      />
                      {q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(q.id, opt.id)}
                          className="shrink-0 text-muted-foreground/30 hover:text-red-500"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(q.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="size-3" />
                    Add option
                  </button>
                </div>

                <div className="ml-8">
                  <label className="text-xs text-muted-foreground">Explanation (shown after answer)</label>
                  <textarea
                    value={q.explanation}
                    onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                    rows={2}
                    className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                    placeholder="Explain the correct answer..."
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              <Plus className="size-4" />
              Add Question
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Quiz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
