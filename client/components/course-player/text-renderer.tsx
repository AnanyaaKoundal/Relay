"use client";

type TextRendererProps = {
  body: string;
};

export function TextRenderer({ body }: TextRendererProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
}
