"use client";

import { formatINR } from "@/lib/studio-utils";
import type { StudioEarningsMoneyFlow } from "@/types/studio.types";

type EarningsFlowProps = {
  data: StudioEarningsMoneyFlow;
  topCourseShare: number | null;
};

export function EarningsFlow({ data, topCourseShare }: EarningsFlowProps) {
  const pctOfGross = (value: number) =>
    data.gross > 0 ? Math.round((value / data.gross) * 100) : 0;
  const pctOfList = (value: number) =>
    data.listPrice > 0 ? Math.round((value / data.listPrice) * 100) : 0;

  const netPct = pctOfGross(data.net);
  const feePct = pctOfGross(data.fee);

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Money flow</h2>
        <span className="text-xs text-muted-foreground">You keep 90% of gross collected</span>
      </div>

      {data.gross <= 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No sales in this period.
        </p>
      ) : (
        <>
          <div className="mt-5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Your list price</span>
              <span className="font-medium tabular-nums text-foreground">
                {formatINR(data.listPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Discounts given{" "}
                <span className="text-muted-foreground/70">({pctOfList(data.discounts)}% of list)</span>
              </span>
              <span className="font-medium tabular-nums text-foreground">
                &minus;{formatINR(data.discounts)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Tax collected{" "}
                <span className="text-muted-foreground/70">({pctOfList(data.tax)}% of list)</span>
              </span>
              <span className="font-medium tabular-nums text-foreground">
                +{formatINR(data.tax)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2.5">
              <span className="font-medium text-foreground">Gross collected</span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatINR(data.gross)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Platform fee (10% of gross)</span>
              <span className="font-medium tabular-nums text-foreground">
                &minus;{formatINR(data.fee)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="size-1.5 rounded-full bg-chart-1" />
                Net earnings
              </span>
              <span className="font-semibold tabular-nums text-chart-1">
                {formatINR(data.net)}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-1 flex-col justify-center">
            <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="bg-chart-1" style={{ width: `${netPct}%` }} />
              <div className="bg-chart-4" style={{ width: `${feePct}%` }} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted p-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-chart-1" />
                  <span className="text-muted-foreground">Net earnings</span>
                </div>
                <p className="mt-1 font-semibold tabular-nums">{formatINR(data.net)}</p>
                <p className="text-[11px] text-muted-foreground">
                  {netPct}% of gross · goes to you
                </p>
              </div>
              <div className="rounded-lg bg-muted p-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-chart-4" />
                  <span className="text-muted-foreground">Platform fee</span>
                </div>
                <p className="mt-1 font-semibold tabular-nums">{formatINR(data.fee)}</p>
                <p className="text-[11px] text-muted-foreground">
                  {feePct}% of gross · to Relay
                </p>
              </div>
            </div>
          </div>

          {topCourseShare !== null && (
            <p className="mt-5 rounded-lg bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              Your top course brings in{" "}
              <span className="font-semibold text-foreground">{topCourseShare}%</span> of this
              period&apos;s net earnings.
            </p>
          )}
        </>
      )}
    </div>
  );
}
