import type { StudioRange } from "@/types/studio.types";

export type ChartBucket = "day" | "week" | "month";

export const formatINR = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function bucketForRange(range: StudioRange, from?: string, to?: string): ChartBucket {
  if (range === "custom") {
    if (from && to) {
      const span = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1;
      return span <= 45 ? "day" : span <= 180 ? "week" : "month";
    }
    return "day";
  }
  if (range === "7d" || range === "30d") return "day";
  if (range === "60d" || range === "90d") return "week";
  return "month";
}

export function rangeText(range: StudioRange): string {
  switch (range) {
    case "7d":
      return "vs previous 7 days";
    case "30d":
      return "vs previous 30 days";
    case "60d":
      return "vs previous 60 days";
    case "90d":
      return "vs previous 90 days";
    case "1y":
      return "vs previous year";
    case "custom":
      return "vs previous period";
  }
}
