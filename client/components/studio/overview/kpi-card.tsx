"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TONES = {
  emerald: "bg-emerald-500/10 text-emerald-600",
  sky: "bg-sky-500/10 text-sky-600",
  amber: "bg-amber-500/10 text-amber-600",
  violet: "bg-violet-500/10 text-violet-600",
  primary: "bg-chart-1/10 text-chart-1",
} as const;

export type KpiCardProps = {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  delta: number | null;
  newBadge?: boolean;
  tone?: keyof typeof TONES;
};

export function KpiCard({ label, value, sub, icon: Icon, delta, newBadge, tone }: KpiCardProps) {
  const positive = delta !== null && delta > 0;
  const negative = delta !== null && delta < 0;

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span
          className={`inline-flex size-8 items-center justify-center rounded-lg ${
            tone ? TONES[tone] : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <p className="mt-2 truncate text-2xl font-semibold tracking-tight">{value}</p>

      <div className="mt-2 flex items-center gap-1.5">
        {positive && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-1.5 py-0.5 text-[11px] font-medium text-success">
            <ArrowUpRight className="size-3" />
            {delta}%
          </span>
        )}
        {negative && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
            <ArrowDownRight className="size-3" />
            {Math.abs(delta!)}%
          </span>
        )}
        {delta === 0 && (
          <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            0%
          </span>
        )}
        {delta === null && newBadge && (
          <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            New
          </span>
        )}
        <span className="truncate text-xs text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}
