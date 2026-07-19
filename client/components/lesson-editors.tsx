"use client";

import { useState, useRef } from "react";
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
  Upload,
  X,
  Plus,
  Trash2,
  FileText,
  HelpCircle,
  Video,
  Clock,
  LinkIcon,
  Code,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  ImageIcon,
  CheckCircle2,
  Circle,
} from "lucide-react";

/* ─── Shared Types ─── */
export type LessonType = "VIDEO" | "TEXT" | "QUIZ";

export type VideoContent = {
  videoUrl: string;
  durationSeconds: number | null;
  resources: { name: string; url: string }[];
};

export type TextContent = {
  body: string;
};

export type QuizOption = { id: string; text: string };
export type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
};
export type QuizContent = {
  questions: QuizQuestion[];
};

export type LessonContent = VideoContent | TextContent | QuizContent;

let qId = 0;
function qid() {
  return `q_${++qId}_${Date.now()}`;
}

/* ════════════════════════════════════════════
   VIDEO EDITOR
   ════════════════════════════════════════════ */
export function VideoLessonEditor({
  open,
  onClose,
  onSave,
  initial,
  lessonTitle,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: VideoContent, title: string) => void;
  initial: VideoContent;
  lessonTitle: string;
}) {
  const [title, setTitle] = useState(lessonTitle);
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl);
  const [duration, setDuration] = useState(
    initial.durationSeconds != null ? formatDurationInput(initial.durationSeconds) : ""
  );
  const [resources, setResources] = useState(initial.resources);
  const [newResName, setNewResName] = useState("");
  const [newResUrl, setNewResUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function formatDurationInput(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function parseDuration(str: string): number | null {
    if (!str) return null;
    const parts = str.split(":");
    if (parts.length === 2) {
      const m = parseInt(parts[0], 10);
      const s = parseInt(parts[1], 10);
      if (!isNaN(m) && !isNaN(s)) return m * 60 + s;
    }
    return null;
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setTitle(file.name.replace(/\.[^.]+$/, ""));
    }
  }

  function handleAddResource() {
    if (newResName.trim() && newResUrl.trim()) {
      setResources((prev) => [...prev, { name: newResName.trim(), url: newResUrl.trim() }]);
      setNewResName("");
      setNewResUrl("");
    }
  }

  function handleSave() {
    onSave(
      {
        videoUrl,
        durationSeconds: parseDuration(duration),
        resources,
      },
      title.trim() || lessonTitle
    );
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="size-4 text-blue-500" />
            Edit Video Lesson
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Lesson Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              placeholder="e.g. Introduction to React Hooks"
            />
          </div>

          {/* Video Upload */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Video</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              {videoUrl ? (
                <div className="text-center space-y-2">
                  <CheckCircle2 className="size-8 mx-auto text-emerald-500" />
                  <p className="text-sm font-medium">Video selected</p>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">{videoUrl}</p>
                  <p className="text-xs text-primary hover:underline">Click to replace</p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Upload className="size-8 mx-auto text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Click to upload a video
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    MP4, WebM, or MOV up to 2GB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {videoUrl && (
              <div className="mt-3 rounded-lg overflow-hidden bg-black/5">
                <video src={videoUrl} controls className="w-full max-h-48" />
              </div>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              <Clock className="inline size-3 mr-1" />
              Duration (mm:ss)
            </label>
            <Input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1.5 max-w-[140px]"
              placeholder="0:00"
            />
          </div>

          {/* Resources */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Resources</label>
            <div className="mt-1.5 space-y-2">
              {resources.map((r, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <LinkIcon className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-sm truncate">{r.name}</span>
                  <button
                    type="button"
                    onClick={() => setResources((prev) => prev.filter((_, j) => j !== i))}
                    className="shrink-0 text-muted-foreground/40 hover:text-red-500"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newResName}
                  onChange={(e) => setNewResName(e.target.value)}
                  placeholder="Resource name"
                  className="h-8 text-xs"
                  onKeyDown={(e) => e.key === "Enter" && handleAddResource()}
                />
                <Input
                  value={newResUrl}
                  onChange={(e) => setNewResUrl(e.target.value)}
                  placeholder="URL"
                  className="h-8 text-xs"
                  onKeyDown={(e) => e.key === "Enter" && handleAddResource()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddResource}
                  className="shrink-0"
                >
                  <Plus className="size-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Lesson</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ════════════════════════════════════════════
   TEXT EDITOR
   ════════════════════════════════════════════ */
export function TextLessonEditor({
  open,
  onClose,
  onSave,
  initial,
  lessonTitle,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: TextContent, title: string) => void;
  initial: TextContent;
  lessonTitle: string;
}) {
  const [title, setTitle] = useState(lessonTitle);
  const [body, setBody] = useState(initial.body);
  const editorRef = useRef<HTMLDivElement>(null);

  function execCmd(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  }

  function handleSave() {
    onSave({ body }, title.trim() || lessonTitle);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4 text-emerald-500" />
            Edit Text Lesson
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Lesson Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              placeholder="e.g. Understanding closures"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-0.5 rounded-lg border bg-muted/50 p-1">
            <button
              type="button"
              onClick={() => execCmd("bold")}
              className="size-7 flex items-center justify-center rounded hover:bg-background transition-colors"
              title="Bold"
            >
              <Bold className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("italic")}
              className="size-7 flex items-center justify-center rounded hover:bg-background transition-colors"
              title="Italic"
            >
              <Italic className="size-3.5" />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              type="button"
              onClick={() => execCmd("formatBlock", "h2")}
              className="size-7 flex items-center justify-center rounded hover:bg-background transition-colors"
              title="Heading"
            >
              <Heading2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("insertUnorderedList")}
              className="size-7 flex items-center justify-center rounded hover:bg-background transition-colors"
              title="Bullet list"
            >
              <List className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("insertOrderedList")}
              className="size-7 flex items-center justify-center rounded hover:bg-background transition-colors"
              title="Numbered list"
            >
              <ListOrdered className="size-3.5" />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              type="button"
              onClick={() => {
                const url = prompt("Enter image URL:");
                if (url) execCmd("insertImage", url);
              }}
              className="size-7 flex items-center justify-center rounded hover:bg-background transition-colors"
              title="Insert image"
            >
              <ImageIcon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const code = prompt("Enter code:");
                if (code) execCmd("insertHTML", `<pre class="bg-muted rounded-lg p-3 my-2 text-sm font-mono overflow-x-auto"><code>${code}</code></pre>`);
              }}
              className="size-7 flex items-center justify-center rounded hover:bg-background transition-colors"
              title="Code block"
            >
              <Code className="size-3.5" />
            </button>
          </div>

          {/* Content Editable */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="min-h-[240px] rounded-xl border bg-background px-4 py-3 text-sm leading-relaxed outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 prose prose-sm max-w-none [&:empty]:before:text-muted-foreground/40 [&:empty]:before:content-['Write_your_lesson_content_here...']"
            onInput={(e) => setBody((e.target as HTMLDivElement).innerHTML)}
            dangerouslySetInnerHTML={{ __html: initial.body }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Lesson</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ════════════════════════════════════════════
   QUIZ EDITOR
   ════════════════════════════════════════════ */
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
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Quiz Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              placeholder="e.g. React Hooks Quiz"
            />
          </div>

          {/* Questions */}
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

                {/* Options */}
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

                {/* Explanation */}
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
