"use client";

import { useState } from "react";
import { Calendar, Check } from "lucide-react";
import type { StudioRange } from "@/types/studio.types";

const PRESETS: { value: StudioRange; label: string }[] = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "60d", label: "60d" },
  { value: "90d", label: "90d" },
  { value: "1y", label: "1y" },
];

function shortDate(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

type RangeSelectorProps = {
  value: StudioRange;
  onChange: (range: StudioRange) => void;
  onApplyCustom: (from: string, to: string) => void;
  customRange?: { from: string; to: string };
};

export function RangeSelector({ value, onChange, onApplyCustom, customRange }: RangeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const openPopover = () => {
    setFrom(customRange?.from ?? "");
    setTo(customRange?.to ?? "");
    setOpen(true);
  };

  const apply = () => {
    if (!from || !to) return;
    onApplyCustom(from, to);
    setOpen(false);
  };

  const customLabel =
    value === "custom" && customRange
      ? `${shortDate(customRange.from)} – ${shortDate(customRange.to)}`
      : "Custom";

  return (
    <div className="relative">
      <div className="flex items-center rounded-lg border bg-card p-0.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              value === preset.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={openPopover}
          className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            value === "custom"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="size-3.5" />
          <span className="max-w-40 truncate">{customLabel}</span>
        </button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border bg-popover p-4 shadow-lg">
            <p className="text-sm font-medium">Custom range</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Stats are bucketed daily, weekly or monthly based on the span.</p>

            <div className="mt-4 flex items-end gap-2">
              <label className="flex-1">
                <span className="mb-1.5 block text-[11px] font-medium text-muted-foreground">From</span>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-card px-2.5 text-xs text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </label>
              <span className="pb-2.5 text-xs text-muted-foreground">→</span>
              <label className="flex-1">
                <span className="mb-1.5 block text-[11px] font-medium text-muted-foreground">To</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-card px-2.5 text-xs text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </label>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={apply}
                disabled={!from || !to}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Check className="size-3.5" />
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
