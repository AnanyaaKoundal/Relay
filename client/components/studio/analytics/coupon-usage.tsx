"use client";

import { TicketPercent } from "lucide-react";
import type { StudioCouponUsageItem } from "@/types/studio.types";

type CouponUsageProps = {
  items: StudioCouponUsageItem[];
};

export function CouponUsage({ items }: CouponUsageProps) {
  const max = Math.max(1, ...items.map((item) => item.uses));

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <TicketPercent className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-medium">Coupon usage</h2>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No coupons used yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3.5">
          {items.map((item) => (
            <div key={item.code}>
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-mono text-xs">{item.code}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {item.uses}×
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-4"
                  style={{ width: `${(item.uses / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
