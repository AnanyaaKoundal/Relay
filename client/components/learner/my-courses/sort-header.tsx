import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { SortKey } from "./types";

export function SortHeader({
  label,
  column,
  sortKey,
  sortDir,
  onToggle,
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onToggle: (key: SortKey) => void;
}) {
  const active = sortKey === column;
  return (
    <button
      type="button"
      onClick={() => onToggle(column)}
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      {active ? (
        sortDir === "asc" ? (
          <ArrowUp className="size-3" />
        ) : (
          <ArrowDown className="size-3" />
        )
      ) : (
        <ArrowUpDown className="size-3 text-muted-foreground/50" />
      )}
    </button>
  );
}
