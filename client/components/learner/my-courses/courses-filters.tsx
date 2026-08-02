import { LayoutGrid, List, Search } from "lucide-react";
import type { View } from "./types";

export function CoursesFilters({
  query,
  onQueryChange,
  view,
  onViewChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  view: View;
  onViewChange: (view: View) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search courses..."
          className="h-9 w-48 sm:w-56 rounded-lg border bg-card pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
        />
      </div>

      <div className="flex h-9 items-center rounded-lg border bg-card p-0.5">
        <button
          type="button"
          onClick={() => onViewChange("grid")}
          title="Grid view"
          className={`flex h-7 w-8 items-center justify-center rounded-md transition-colors ${
            view === "grid"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutGrid className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onViewChange("table")}
          title="Table view"
          className={`flex h-7 w-8 items-center justify-center rounded-md transition-colors ${
            view === "table"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <List className="size-4" />
        </button>
      </div>
    </div>
  );
}
