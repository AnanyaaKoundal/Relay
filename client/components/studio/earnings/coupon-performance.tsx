"use client";

import { formatINR } from "@/lib/studio-utils";
import type { StudioCouponPerformance } from "@/types/studio.types";

const TOP = 5;

type CouponPerformanceProps = {
  coupons: StudioCouponPerformance[];
};

export function CouponPerformance({ coupons }: CouponPerformanceProps) {
  const shown = coupons.slice(0, TOP);
  const rest = coupons.slice(TOP);
  const restRevenue = rest.reduce((sum, coupon) => sum + coupon.revenue, 0);
  const restOrders = rest.reduce((sum, coupon) => sum + coupon.orders, 0);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Coupon performance</h2>
        <span className="text-xs text-muted-foreground">Selected period</span>
      </div>

      {coupons.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No coupon orders in this period. Coupons are managed in each course&apos;s Settings.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {shown.map((coupon) => {
            const utilization =
              coupon.maxUses > 0
                ? Math.min(100, Math.round((coupon.usedCount / coupon.maxUses) * 100))
                : null;
            const active = coupon.status === "active";

            return (
              <div key={coupon.code} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-mono text-sm font-medium">{coupon.code}</p>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${
                        active
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-muted bg-muted text-muted-foreground"
                      }`}
                    >
                      {coupon.status === "active"
                        ? "Active"
                        : coupon.status === "expired"
                          ? "Expired"
                          : "Inactive"}
                    </span>
                  </div>
                  {utilization !== null && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {coupon.usedCount} of {coupon.maxUses} uses
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatINR(coupon.revenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {coupon.orders} order{coupon.orders !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            );
          })}

          {rest.length > 0 && (
            <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>
                {rest.length} more coupon{rest.length !== 1 ? "s" : ""}
              </span>
              <span className="tabular-nums">
                {formatINR(restRevenue)} · {restOrders} order{restOrders !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
