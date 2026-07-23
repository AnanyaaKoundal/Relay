"use client";

import { useState, useCallback } from "react";
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
  FileText,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Code,
  Undo,
  Redo,
} from "lucide-react";
import type { TextContent } from "@/types/lesson.types";

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

export function TextLessonEditor({
  open,
  onClose,
  onSave,
  initial,
  lessonTitle,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: TextContent, title: string) => void | Promise<void>;
  initial: TextContent;
  lessonTitle: string;
}) {
  const [title, setTitle] = useState(lessonTitle);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initial.body || "",
    immediatelyRender: false,
  });

  const handleSave = useCallback(async () => {
    if (!editor) return;
    await onSave({ body: editor.getHTML() }, title.trim() || lessonTitle);
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
