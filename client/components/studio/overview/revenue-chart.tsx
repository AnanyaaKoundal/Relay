"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StudioSeriesPoint } from "@/types/studio.types";
import { formatINR } from "@/lib/studio-utils";
import type { ChartBucket } from "@/lib/studio-utils";

type RevenueChartProps = {
  data: StudioSeriesPoint[];
  bucket: ChartBucket;
};

function formatLabel(label: string, bucket: ChartBucket) {
  const date = new Date(`${label}T00:00:00Z`);
  const options: Intl.DateTimeFormatOptions =
    bucket === "month"
      ? { month: "short", year: "numeric", timeZone: "UTC" }
      : { month: "short", day: "numeric", timeZone: "UTC" };
  return date.toLocaleDateString("en-US", options);
}

export function RevenueChart({ data, bucket }: RevenueChartProps) {
  const hasData = data.some((point) => point.revenue > 0 || point.enrollments > 0);

  if (!hasData) {
    return (
      <div className="flex h-80 w-full items-center justify-center">
        <p className="text-center text-sm text-muted-foreground">
          No sales or enrollments in this period.
        </p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

          <XAxis
            dataKey="label"
            tickFormatter={(label: string) => formatLabel(label, bucket)}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            stroke="transparent"
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />

          <YAxis
            yAxisId="revenue"
            tickFormatter={(value: number) => formatINR(value)}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            stroke="transparent"
            tickLine={false}
            axisLine={false}
            width={72}
          />

          <YAxis
            yAxisId="enrollments"
            orientation="right"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            stroke="transparent"
            tickLine={false}
            axisLine={false}
            width={32}
            allowDecimals={false}
          />

          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--popover)",
              fontSize: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
            labelFormatter={(label) => formatLabel(String(label), bucket)}
            formatter={(value, name) =>
              name === "revenue"
                ? [formatINR(Number(value)), "Revenue"]
                : [value, "Enrollments"]
            }
          />

          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-xs text-muted-foreground">
                {value === "revenue" ? "Revenue" : "Enrollments"}
              </span>
            )}
          />

          <Area
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            name="revenue"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#revenueFill)"
          />

          <Bar
            yAxisId="enrollments"
            dataKey="enrollments"
            name="enrollments"
            fill="var(--chart-2)"
            radius={[3, 3, 0, 0]}
            maxBarSize={24}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
