"use client";

import { formatINR } from "@/lib/studio-utils";
import type { StudioRevenueComposition } from "@/types/studio.types";

type RevenueCompositionProps = {
  data: StudioRevenueComposition;
};

export function RevenueComposition({ data }: RevenueCompositionProps) {
  const net = data.subtotal - data.discount;
  const couponRate =
    data.totalOrders > 0 ? Math.round((data.couponOrders / data.totalOrders) * 100) : 0;

  const segments =
    data.subtotal > 0
      ? [
          { key: "Net", label: "Net revenue", value: net, className: "bg-chart-1" },
          { key: "Discount", label: "Discounts given", value: data.discount, className: "bg-chart-4" },
          { key: "Tax", label: "Tax collected", value: data.tax, className: "bg-chart-2" },
        ]
      : [];

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Revenue composition</h2>
        <span className="text-xs text-muted-foreground">
          Selected period · {data.totalOrders} order{data.totalOrders !== 1 ? "s" : ""}
        </span>
      </div>

      {data.subtotal <= 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No sales in this period.
        </p>
      ) : (
        <>
          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-muted">
            {segments.map((segment) => (
              <div
                key={segment.key}
                className={`h-full ${segment.className}`}
                style={{ width: `${Math.max(0, (segment.value / data.subtotal) * 100)}%` }}
              />
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {segments.map((segment) => (
              <div key={segment.key}>
                <div className="flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${segment.className}`} />
                  <p className="text-xs text-muted-foreground">{segment.label}</p>
                </div>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {formatINR(segment.value)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">
              {data.couponOrders} of {data.totalOrders} orders ({couponRate}%) used a coupon
            </span>
            <span>
              List price {formatINR(data.subtotal)} · collected{" "}
              {formatINR(net + data.tax)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
