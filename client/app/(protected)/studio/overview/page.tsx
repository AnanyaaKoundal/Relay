"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStudioOverview } from "@/services/studio.service";
import type { StudioOverview, StudioRange } from "@/types/studio.types";
import { RangeSelector } from "@/components/studio/overview/range-selector";
import { KpiCard, type KpiCardProps } from "@/components/studio/overview/kpi-card";
import { KpiCardSkeleton } from "@/components/studio/overview/kpi-card-skeleton";
import { RevenueChart } from "@/components/studio/overview/revenue-chart";
import { ChartSkeleton } from "@/components/studio/overview/chart-skeleton";
import { TopCoursesTable } from "@/components/studio/overview/top-courses-table";
import { TopCoursesSkeleton } from "@/components/studio/overview/top-courses-skeleton";
import { AttentionCard } from "@/components/studio/overview/attention-card";
import { RecentActivity } from "@/components/studio/overview/recent-activity";
import { formatINR, bucketForRange, rangeText } from "@/lib/studio-utils";
import { IndianRupee, Users, Receipt, GraduationCap } from "lucide-react";

type OverviewParams = { range: StudioRange; from?: string; to?: string };
type LoadedStats = { data: StudioOverview; params: string };

export default function StudioOverviewPage() {
  const [params, setParams] = useState<OverviewParams>({ range: "30d" });
  const [loaded, setLoaded] = useState<LoadedStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = `${params.range}|${params.from ?? ""}|${params.to ?? ""}`;
  const isRefreshing = loaded !== null && loaded.params !== paramsKey;

  useEffect(() => {
    let cancelled = false;
    getStudioOverview(params.range, params.from, params.to)
      .then((data) => {
        if (cancelled) return;
        setLoaded({ data, params: paramsKey });
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load your stats.");
      });
    return () => {
      cancelled = true;
    };
  }, [params.range, params.from, params.to, paramsKey]);

  const stats = loaded?.data ?? null;

  const skeletonView = (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="mt-6 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Performance</h2>
          <span className="text-xs text-muted-foreground">Revenue & enrollments</span>
        </div>
        <div className="mt-4">
          <ChartSkeleton />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="h-56 rounded-xl border bg-card p-5">
          <div className="h-3 w-28 rounded bg-muted" />
          <div className="mt-5 space-y-3">
            <div className="h-10 rounded-lg bg-muted/60" />
            <div className="h-10 rounded-lg bg-muted/60" />
            <div className="h-10 rounded-lg bg-muted/60" />
          </div>
        </div>
        <div className="h-56 rounded-xl border bg-card p-5">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="mt-5 space-y-3">
            <div className="h-9 rounded-lg bg-muted/60" />
            <div className="h-9 rounded-lg bg-muted/60" />
            <div className="h-9 rounded-lg bg-muted/60" />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Top Courses</h2>
          <span className="text-xs text-muted-foreground">Your best performers</span>
        </div>
        <div className="mt-2">
          <TopCoursesSkeleton />
        </div>
      </div>
    </>
  );

  const kpiCards: KpiCardProps[] = stats
    ? [
        {
          label: "Revenue",
          value: formatINR(stats.kpis.revenue.value),
          delta: stats.kpis.revenue.delta,
          sub: rangeText(params.range),
          icon: IndianRupee,
          tone: "emerald",
          newBadge: true,
        },
        {
          label: "Students",
          value: String(stats.kpis.students.value),
          delta: stats.kpis.students.delta,
          sub: rangeText(params.range),
          icon: Users,
          tone: "sky",
          newBadge: true,
        },
        {
          label: "Orders",
          value: String(stats.kpis.orders.value),
          delta: stats.kpis.orders.delta,
          sub: rangeText(params.range),
          icon: Receipt,
          tone: "amber",
          newBadge: true,
        },
        {
          label: "Completion",
          value: `${stats.kpis.completionRate}%`,
          delta: null,
          sub: "all-time completion rate",
          icon: GraduationCap,
          tone: "violet",
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your studio at a glance.</p>
        </div>
        <RangeSelector
          value={params.range}
          onChange={(range) => setParams({ range, from: undefined, to: undefined })}
          onApplyCustom={(from, to) => setParams({ range: "custom", from, to })}
          customRange={
            params.range === "custom" ? { from: params.from ?? "", to: params.to ?? "" } : undefined
          }
        />
      </div>

      {!loaded && error ? (
        <div className="mt-8 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
          {error}
        </div>
      ) : !loaded || (isRefreshing && !error) ? (
        skeletonView
      ) : stats ? (
        <>
          {isRefreshing && error && (
            <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2 text-xs text-destructive">
              Couldn&apos;t refresh — {error}
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpiCards.map((card) => (
              <KpiCard key={card.label} {...card} />
            ))}
          </div>

          <div className="mt-6 rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Performance</h2>
              <span className="text-xs text-muted-foreground">Revenue & enrollments</span>
            </div>
            <div className="mt-4">
              <RevenueChart
                data={stats.series}
                bucket={bucketForRange(params.range, params.from, params.to)}
              />
            </div>
          </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-1">
          <AttentionCard attention={stats.attention} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity items={stats.activity} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Top Courses</h2>
          <Link
            href="/studio/courses"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <div className="mt-2">
          <TopCoursesTable courses={stats.topCourses} />
        </div>
      </div>
    </>
  ) : null}
    </div>
  );
}
