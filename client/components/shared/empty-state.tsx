import Link from "next/link";
import { BookOpen, type LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon = BookOpen,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void } | { label: string; href: string };
}) {
  return (
    <div className="rounded-xl border-2 border-dashed bg-card/50 p-10 text-center">
      <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Icon className="size-6 text-muted-foreground/40" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>
      )}
      {action && "onClick" in action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          {action.label}
        </button>
      )}
      {action && "href" in action && (
        <Link
          href={action.href}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
