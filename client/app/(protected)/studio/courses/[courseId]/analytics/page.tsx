"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCourseAnalytics } from "@/services/studio.service";
import type { StudioCourseAnalytics, StudioRange } from "@/types/studio.types";
import { RangeSelector } from "@/components/studio/overview/range-selector";
import { KpiCard, type KpiCardProps } from "@/components/studio/overview/kpi-card";
import { EnrollmentChart } from "@/components/studio/analytics/enrollment-chart";
import { LessonFunnel } from "@/components/studio/analytics/lesson-funnel";
import { CouponUsage } from "@/components/studio/analytics/coupon-usage";
import { CountrySplit } from "@/components/studio/analytics/country-split";
import { RecentEnrollments } from "@/components/studio/analytics/recent-enrollments";
import { CourseAnalyticsSkeleton } from "@/components/studio/analytics/analytics-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatINR, bucketForRange, rangeText } from "@/lib/studio-utils";
import { ArrowLeft, Users, UserCheck, TrendingUp, IndianRupee } from "lucide-react";

type AnalyticsParams = { range: StudioRange; from?: string; to?: string };
type LoadedAnalytics = { data: StudioCourseAnalytics; params: string };

export default function CourseAnalyticsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId ?? "";

  const [range, setRange] = useState<AnalyticsParams>({ range: "30d" });
  const [loaded, setLoaded] = useState<LoadedAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = `${range.range}|${range.from ?? ""}|${range.to ?? ""}`;
  const isRefreshing = loaded !== null && loaded.params !== paramsKey;

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    getCourseAnalytics(courseId, range.range, range.from, range.to)
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
  }, [courseId, range.range, range.from, range.to, paramsKey]);

  const stats = loaded?.data ?? null;

  const kpiCards: KpiCardProps[] = stats
    ? [
        {
          label: "Students",
          value: String(stats.kpis.students.value),
          delta: stats.kpis.students.delta,
          sub: rangeText(range.range),
          icon: Users,
          tone: "sky",
          newBadge: true,
        },
        {
          label: "Revenue",
          value: formatINR(stats.kpis.revenue.value),
          delta: stats.kpis.revenue.delta,
          sub: rangeText(range.range),
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
          label: "Completion",
          value: `${stats.kpis.completionRate}%`,
          delta: null,
          sub: "all-time course completion",
          icon: TrendingUp,
          tone: "amber",
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/studio/courses/${courseId}/edit`}
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Back to course builder"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {stats?.course.title ?? "Course analytics"}
              </h1>
              {stats && <StatusBadge status={stats.course.status} />}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Enrollment, revenue and progress analytics.
            </p>
          </div>
        </div>
        <RangeSelector
          value={range.range}
          onChange={(r) => setRange({ range: r, from: undefined, to: undefined })}
          onApplyCustom={(from, to) => setRange({ range: "custom", from, to })}
          customRange={
            range.range === "custom" ? { from: range.from ?? "", to: range.to ?? "" } : undefined
          }
        />
      </div>

      {!loaded && error ? (
        <div className="mt-8 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
          {error}
        </div>
      ) : !loaded || (isRefreshing && !error) ? (
        <CourseAnalyticsSkeleton />
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
              <h2 className="text-sm font-medium">Enrollment trend</h2>
              <span className="text-xs text-muted-foreground">
                New enrollments in the selected period
              </span>
            </div>
            <div className="mt-4">
              <EnrollmentChart
                data={stats.enrollmentSeries}
                bucket={bucketForRange(range.range, range.from, range.to)}
              />
            </div>
          </div>

          <div className="mt-6">
            <LessonFunnel lessons={stats.lessonFunnel} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <CouponUsage items={stats.couponUsage} />
            <CountrySplit items={stats.countrySplit} />
          </div>

          <div className="mt-6">
            <RecentEnrollments enrollments={stats.recentEnrollments} />
          </div>
        </>
      ) : null}
    </div>
  );
}
