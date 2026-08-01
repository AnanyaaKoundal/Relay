"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpDown,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { formatINR } from "@/lib/studio-utils";
import type { StudioEarningsCourse } from "@/types/studio.types";

type SortKey = "net" | "gross" | "orders" | "growth";

const DEFAULT_SHOWN = 5;

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "net", label: "Net", align: "right" },
  { key: "gross", label: "Gross", align: "right" },
  { key: "orders", label: "Orders", align: "right" },
  { key: "growth", label: "Growth", align: "right" },
];

function GrowthCell({ growth }: { growth: number | null }) {
  if (growth === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
        New
      </span>
    );
  }
  if (growth > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-success">
        <ArrowUpRight className="size-3.5" />
        {growth}%
      </span>
    );
  }
  if (growth < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-destructive">
        <ArrowDownRight className="size-3.5" />
        {Math.abs(growth)}%
      </span>
    );
  }
  return <span className="text-muted-foreground">0%</span>;
}

type CourseEarningsTableProps = {
  courses: StudioEarningsCourse[];
};

export function CourseEarningsTable({ courses }: CourseEarningsTableProps) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("net");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? courses.filter((course) => course.title.toLowerCase().includes(q))
      : courses;
    return [...list].sort((a, b) => {
      const aNull = a[sortKey] === null;
      const bNull = b[sortKey] === null;
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;
      const diff = (a[sortKey] as number) - (b[sortKey] as number);
      return sortDir === "asc" ? diff : -diff;
    });
  }, [courses, query, sortKey, sortDir]);

  const searching = query.trim().length > 0;
  const shown = searching || expanded ? filtered : filtered.slice(0, DEFAULT_SHOWN);
  const hiddenCount = Math.max(0, filtered.length - DEFAULT_SHOWN);
  const hiddenNet = filtered
    .slice(DEFAULT_SHOWN)
    .reduce((sum, course) => sum + course.net, 0);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (key !== sortKey) return <ArrowUpDown className="size-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ChevronUp className="size-3" />
    ) : (
      <ChevronDown className="size-3" />
    );
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="text-sm font-medium">Course earnings</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {courses.length} course{courses.length !== 1 ? "s" : ""} · {formatINR(
              courses.reduce((sum, course) => sum + course.net, 0),
            )} net in this period
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses..."
            className="h-8 w-52 rounded-lg border bg-card pl-8 pr-3 text-xs outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {query ? "No courses match your search." : "No course earnings in this period."}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Course</th>
                  {COLUMNS.map((column) => (
                    <th key={column.key} className="px-3 py-3 text-right font-medium">
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className="inline-flex items-center justify-end gap-1 transition-colors hover:text-foreground"
                      >
                        {column.label}
                        {sortIndicator(column.key)}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {shown.map((course) => (
                  <tr key={course.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/studio/courses/${course.id}/analytics`}
                        className="block max-w-72 truncate font-medium transition-colors hover:text-primary"
                      >
                        {course.title}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium">
                      {formatINR(course.net)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                      {formatINR(course.gross)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{course.orders}</td>
                    <td className="px-3 py-3 text-right">
                      <GrowthCell growth={course.growth} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!searching && hiddenCount > 0 && (
            <div className="flex items-center justify-between border-t px-5 py-3">
              <p className="text-xs text-muted-foreground">
                {hiddenCount} more course{hiddenCount !== 1 ? "s" : ""} ·{" "}
                <span className="tabular-nums text-foreground">{formatINR(hiddenNet)}</span> net
              </p>
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                {expanded ? (
                  <>
                    Collapse
                    <ChevronUp className="size-3.5" />
                  </>
                ) : (
                  <>
                    Show all {filtered.length} courses
                    <ChevronDown className="size-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
