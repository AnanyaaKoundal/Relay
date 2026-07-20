"use client";

import { useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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
  FileText,
  HelpCircle,
  Video,
  Clock,
  LinkIcon,
  CheckCircle2,
  Circle,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Code,
  Undo,
  Redo,
  Loader2,
} from "lucide-react";
import { VideoUploader, useVideoDuration } from "@/components/video-uploader";
import { presignUpload, completeUpload, uploadFileWithProgress } from "@/services/upload.service";
import { resolveUrl } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

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
  lessonId,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: VideoContent, title: string) => void;
  initial: VideoContent;
  lessonTitle: string;
  lessonId: string;
}) {
  const [title, setTitle] = useState(lessonTitle);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const autoDuration = useVideoDuration(file);

  const hasExistingVideo = !!initial.videoUrl;
  const canSave = hasExistingVideo || (file && uploadStatus === "idle");
  const isUploading = uploadStatus === "uploading";

  function formatDuration(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function handleFileSelect(f: File) {
    setFile(f);
    setUploadStatus("idle");
    setUploadProgress(0);
    if (!title || title === lessonTitle) {
      setTitle(f.name.replace(/\.[^.]+$/, ""));
    }
  }

  async function handleUploadAndSave() {
    if (!file || saving) return;
    setSaving(true);
    try {
      setUploadStatus("uploading");
      setUploadProgress(0);

      const { uploadUrl, fileKey } = await presignUpload(file.name, file.type, lessonId);
      await uploadFileWithProgress(API_URL, uploadUrl, file, setUploadProgress);
      await completeUpload(lessonId, fileKey);

      setUploadStatus("done");
      onSave(
        { videoUrl: `${API_URL}/s3/${fileKey}`, durationSeconds: autoDuration, resources: [] },
        title.trim() || lessonTitle,
      );
      onClose();
    } catch {
      setUploadStatus("idle");
    } finally {
      setSaving(false);
    }
  }

  function handleSave() {
    onSave(
      { videoUrl: initial.videoUrl, durationSeconds: initial.durationSeconds, resources: [] },
      title.trim() || lessonTitle,
    );
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="size-4 text-blue-500" />
            {hasExistingVideo ? "Edit Video Lesson" : "New Video Lesson"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Lesson Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              placeholder="e.g. Introduction to React Hooks"
            />
          </div>

          {hasExistingVideo ? (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Video</label>
              <div className="mt-1.5 rounded-xl overflow-hidden bg-black/5">
                <video src={resolveUrl(initial.videoUrl) ?? ""} controls className="w-full max-h-48" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Video cannot be replaced. Delete this lesson and create a new one to upload a different video.
              </p>
            </div>
          ) : (
            <VideoUploader
              file={file}
              status={uploadStatus}
              progress={uploadProgress}
              onFileSelect={handleFileSelect}
            />
          )}

          {!hasExistingVideo && autoDuration != null && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3" />
              Duration: {formatDuration(autoDuration)}
            </div>
          )}
          {hasExistingVideo && initial.durationSeconds != null && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3" />
              Duration: {formatDuration(initial.durationSeconds)}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          {hasExistingVideo ? (
            <Button onClick={handleSave}>Save</Button>
          ) : (
            <Button onClick={handleUploadAndSave} disabled={!canSave || isUploading || saving}>
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload & Save"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ════════════════════════════════════════════
   TEXT EDITOR (TipTap)
   ════════════════════════════════════════════ */
function TipTapToolbar({ editor }: { editor: ReturnType<typeof useEditor> | null }) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 rounded-lg border bg-muted/50 p-1 flex-wrap">
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className="size-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className="size-3.5" />
      </ToolbarBtn>

      <div className="w-px h-4 bg-border mx-1" />

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading"
      >
        <Heading2 className="size-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List className="size-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered list"
      >
        <ListOrdered className="size-3.5" />
      </ToolbarBtn>

      <div className="w-px h-4 bg-border mx-1" />

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Code block"
      >
        <Code className="size-3.5" />
      </ToolbarBtn>

      <div className="w-px h-4 bg-border mx-1" />

      <ToolbarBtn
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo className="size-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo className="size-3.5" />
      </ToolbarBtn>
    </div>
  );
}

function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`size-7 flex items-center justify-center rounded transition-colors ${active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-background hover:text-foreground"
        } ${disabled ? "opacity-30 pointer-events-none" : ""}`}
    >
      {children}
    </button>
  );
}

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

  const editor = useEditor({
    extensions: [StarterKit],
    content: initial.body || "",
    immediatelyRender: false,
  });

  const handleSave = useCallback(() => {
    if (!editor) return;
    onSave({ body: editor.getHTML() }, title.trim() || lessonTitle);
    onClose();
  }, [editor, onSave, onClose, title, lessonTitle]);

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
          <div>
            <label className="text-xs font-medium text-muted-foreground">Lesson Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              placeholder="e.g. Understanding closures"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Content</label>
            <div className="mt-1.5 space-y-2">
              <TipTapToolbar editor={editor} />
              <div className="min-h-60 rounded-xl border bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-colors">
                <EditorContent
                  editor={editor}
                  className="prose prose-sm max-w-none p-4 [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-50 [&_.ProseMirror]:placeholder:text-muted-foreground/40"
                />
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
