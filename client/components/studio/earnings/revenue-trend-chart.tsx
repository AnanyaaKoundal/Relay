"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR } from "@/lib/studio-utils";
import type { ChartBucket } from "@/lib/studio-utils";
import type { StudioTrendCourse, StudioTrendPoint } from "@/types/studio.types";

const LINE_COLORS = [
  "var(--chart-1)",
  "#7C3AED",
  "#2563EB",
  "#EA580C",
  "#DB2777",
  "#0891B2",
  "#65A30D",
  "#4F46E5",
];

const MAX_SELECTED = 8;

function formatLabel(label: string, bucket: ChartBucket) {
  const date = new Date(`${label}T00:00:00Z`);
  const options: Intl.DateTimeFormatOptions =
    bucket === "month"
      ? { month: "short", year: "numeric", timeZone: "UTC" }
      : { month: "short", day: "numeric", timeZone: "UTC" };
  return date.toLocaleDateString("en-US", options);
}

type RevenueTrendChartProps = {
  courses: StudioTrendCourse[];
  series: StudioTrendPoint[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  bucket: ChartBucket;
};

export function RevenueTrendChart({
  courses,
  series,
  selected,
  onSelect,
  bucket,
}: RevenueTrendChartProps) {
  const [open, setOpen] = useState(false);

  const colorFor = (courseId: string) => {
    const index = courses.findIndex((course) => course.id === courseId);
    return LINE_COLORS[index >= 0 ? index % LINE_COLORS.length : 0];
  };

  const activeSelected = selected.filter((id) =>
    courses.some((course) => course.id === id),
  );

  const data = series;

  const lines =
    activeSelected.length === 0
      ? [
          <Line
            key="all"
            type="monotone"
            dataKey="total"
            name="All courses"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
          />,
        ]
      : activeSelected.map((courseId) => (
          <Line
            key={courseId}
            type="monotone"
            dataKey={(point) => point.byCourse[courseId] ?? 0}
            name={courses.find((course) => course.id === courseId)?.title ?? "Course"}
            stroke={colorFor(courseId)}
            strokeWidth={2}
            dot={false}
          />
        ));

  const toggle = (courseId: string) => {
    if (activeSelected.includes(courseId)) {
      onSelect(activeSelected.filter((id) => id !== courseId));
    } else if (activeSelected.length < MAX_SELECTED) {
      onSelect([...activeSelected, courseId]);
    }
  };

  const selectAll = () => onSelect([]);

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Revenue trend</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Compare sales over time across courses.
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            <TrendingUp className="size-3.5 text-muted-foreground" />
            {activeSelected.length === 0
              ? "All courses"
              : `${activeSelected.length} course${activeSelected.length !== 1 ? "s" : ""}`}
            {open ? (
              <ChevronUp className="size-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-3.5 text-muted-foreground" />
            )}
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border bg-popover p-3 shadow-lg">
                <p className="px-1 text-xs font-medium text-muted-foreground">
                  Compare up to {MAX_SELECTED} courses
                </p>

                <div className="mt-2 max-h-60 overflow-y-auto">
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm transition-colors hover:bg-muted/60">
                    <input
                      type="checkbox"
                      checked={activeSelected.length === 0}
                      onChange={selectAll}
                      className="size-3.5 accent-[var(--chart-1)]"
                    />
                    <span className="font-medium">All courses</span>
                  </label>

                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm transition-colors hover:bg-muted/60"
                    >
                      <input
                        type="checkbox"
                        checked={activeSelected.includes(course.id)}
                        onChange={() => toggle(course.id)}
                        disabled={
                          !activeSelected.includes(course.id) &&
                          activeSelected.length >= MAX_SELECTED
                        }
                        className="size-3.5 accent-[var(--chart-1)] disabled:cursor-not-allowed"
                      />
                      <span className="truncate">{course.title}</span>
                    </label>
                  ))}
                </div>

                {activeSelected.length >= MAX_SELECTED && (
                  <p className="mt-2 px-1 text-[11px] text-muted-foreground">
                    Uncheck a course to add another.
                  </p>
                )}

                <div className="mt-2 border-t pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80"
                  >
                    <Check className="size-3.5" />
                    Done
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {courses.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
          No sales in this period — revenue trend will appear once you make a sale.
        </p>
      ) : (
        <>
          <div className="mt-4 min-h-0 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
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
                  tickFormatter={(value: number) =>
                    value >= 1000 ? `₹${(value / 1000).toFixed(1)}k` : `₹${value}`
                  }
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  stroke="transparent"
                  tickLine={false}
                  axisLine={false}
                  width={48}
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
                  formatter={(value, name) => [formatINR(Number(value)), String(name)]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
                {lines}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
