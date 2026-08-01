"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartBucket } from "@/lib/studio-utils";
import type { StudioEnrollmentPoint } from "@/types/studio.types";

type EnrollmentChartProps = {
  data: StudioEnrollmentPoint[];
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

export function EnrollmentChart({ data, bucket }: EnrollmentChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
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
            formatter={(value) => [value, "Enrollments"]}
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          />
          <Bar dataKey="count" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
