"use client";

import { Sparkles, RefreshCw } from "lucide-react";

export function NewBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
      <Sparkles className="size-2.5" />
      New
    </span>
  );
}

export function UpdatedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
      <RefreshCw className="size-2.5" />
      Updated
    </span>
  );
}
