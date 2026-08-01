"use client";

import { Globe } from "lucide-react";
import type { StudioCountrySplitItem } from "@/types/studio.types";

type CountrySplitProps = {
  items: StudioCountrySplitItem[];
};

export function CountrySplit({ items }: CountrySplitProps) {
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <Globe className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-medium">Top countries</h2>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No purchases recorded yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3.5">
          {items.map((item) => (
            <div key={item.country}>
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm">{item.country}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {item.count}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-1"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
