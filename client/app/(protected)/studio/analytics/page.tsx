"use client";

import { useEffect, useState } from "react";
import { getCoursesAnalytics } from "@/services/studio.service";
import type { StudioCoursesAnalytics, StudioRange } from "@/types/studio.types";
import { RangeSelector } from "@/components/studio/overview/range-selector";
import { KpiCard, type KpiCardProps } from "@/components/studio/overview/kpi-card";
import { ProgressDistribution } from "@/components/studio/analytics/progress-distribution";
import { ContentTypeCompletion } from "@/components/studio/analytics/content-type-completion";
import { RevenueComposition } from "@/components/studio/analytics/revenue-composition";
import { CoursesTable } from "@/components/studio/analytics/courses-table";
import { CoursesAnalyticsSkeleton } from "@/components/studio/analytics/courses-analytics-skeleton";
import { formatINR, rangeText } from "@/lib/studio-utils";
import { Users, IndianRupee, UserCheck, GraduationCap } from "lucide-react";

type AnalyticsParams = { range: StudioRange; from?: string; to?: string };
type LoadedAnalytics = { data: StudioCoursesAnalytics; params: string };

export default function StudioAnalyticsPage() {
  const [params, setParams] = useState<AnalyticsParams>({ range: "30d" });
  const [loaded, setLoaded] = useState<LoadedAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = `${params.range}|${params.from ?? ""}|${params.to ?? ""}`;
  const isRefreshing = loaded !== null && loaded.params !== paramsKey;

  useEffect(() => {
    let cancelled = false;
    getCoursesAnalytics(params.range, params.from, params.to)
      .then((data) => {
        if (cancelled) return;
        setLoaded({ data, params: paramsKey });
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load analytics.");
      });
    return () => {
      cancelled = true;
    };
  }, [params.range, params.from, params.to, paramsKey]);

  const stats = loaded?.data ?? null;

  const kpiCards: KpiCardProps[] = stats
    ? [
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
          label: "Revenue",
          value: formatINR(stats.kpis.revenue.value),
          delta: stats.kpis.revenue.delta,
          sub: rangeText(params.range),
          icon: IndianRupee,
          tone: "emerald",
          newBadge: true,
        },
        {
          label: "Active learners",
          value: String(stats.kpis.activeLearners),
          delta: null,
          sub: "active in the last 7 days",
          icon: UserCheck,
          tone: "violet",
        },
        {
          label: "Avg completion",
          value: `${stats.kpis.completionRate}%`,
          delta: null,
          sub: "all-time completion rate",
          icon: GraduationCap,
          tone: "amber",
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Learner engagement and monetization across your courses.
          </p>
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
        <CoursesAnalyticsSkeleton />
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

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <ProgressDistribution buckets={stats.progressDistribution} />
            <ContentTypeCompletion stats={stats.contentTypeCompletion} />
          </div>

          <div className="mt-6">
            <RevenueComposition data={stats.revenueComposition} />
          </div>

          <div className="mt-6">
            <CoursesTable courses={stats.courses} />
          </div>
        </>
      ) : null}
    </div>
  );
}
