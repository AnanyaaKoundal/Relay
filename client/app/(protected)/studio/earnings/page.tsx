"use client";

import { useEffect, useState } from "react";
import { getEarningsStats } from "@/services/studio.service";
import type { StudioEarnings, StudioRange } from "@/types/studio.types";
import { bucketForRange, formatINR, rangeText } from "@/lib/studio-utils";
import { RangeSelector } from "@/components/studio/overview/range-selector";
import { KpiCard, type KpiCardProps } from "@/components/studio/overview/kpi-card";
import { EarningsFlow } from "@/components/studio/earnings/earnings-flow";
import { RevenueTrendChart } from "@/components/studio/earnings/revenue-trend-chart";
import { CourseEarningsTable } from "@/components/studio/earnings/course-earnings-table";
import { CouponPerformance } from "@/components/studio/earnings/coupon-performance";
import { TransactionsTable } from "@/components/studio/earnings/transactions-table";
import { EarningsSkeleton } from "@/components/studio/earnings/earnings-skeleton";
import { BalanceCard } from "@/components/studio/earnings/balance-card";
import { PayoutRequestDrawer } from "@/components/studio/earnings/payout-request-drawer";
import { PayoutHistory } from "@/components/studio/earnings/payout-history";
import { IndianRupee, Wallet, Receipt, Percent } from "lucide-react";

type EarningsParams = { range: StudioRange; from?: string; to?: string };
type LoadedEarnings = { data: StudioEarnings; params: string };

export default function StudioEarningsPage() {
  const [params, setParams] = useState<EarningsParams>({ range: "30d" });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<LoadedEarnings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPayoutDrawer, setShowPayoutDrawer] = useState(false);
  const [balanceKey, setBalanceKey] = useState(0);

  const paramsKey = `${params.range}|${params.from ?? ""}|${params.to ?? ""}`;
  const isRefreshing = loaded !== null && loaded.params !== paramsKey;

  useEffect(() => {
    let cancelled = false;
    getEarningsStats(params.range, params.from, params.to)
      .then((data) => {
        if (cancelled) return;
        setLoaded({ data, params: paramsKey });
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load earnings.");
      });
    return () => {
      cancelled = true;
    };
  }, [params.range, params.from, params.to, paramsKey]);

  const stats = loaded?.data ?? null;
  const bucket = bucketForRange(params.range, params.from, params.to);

  const earningCourses = (stats?.courses ?? []).filter((course) => course.net > 0);
  const totalEarnings = earningCourses.reduce((sum, course) => sum + course.net, 0);
  const topCourseShare =
    totalEarnings > 0
      ? Math.round(
          (Math.max(...earningCourses.map((course) => course.net)) / totalEarnings) * 100,
        )
      : null;

  const kpiCards: KpiCardProps[] = stats
    ? [
        {
          label: "Gross revenue",
          value: formatINR(stats.kpis.gross.value),
          delta: stats.kpis.gross.delta,
          sub: rangeText(params.range),
          icon: IndianRupee,
          tone: "sky",
          newBadge: true,
        },
        {
          label: "Net earnings",
          value: formatINR(stats.kpis.net.value),
          delta: stats.kpis.net.delta,
          sub: "after 10% platform fee",
          icon: Wallet,
          tone: "emerald",
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
          label: "Discounts given",
          value: formatINR(stats.kpis.discounts.value),
          delta: stats.kpis.discounts.delta,
          sub: "coupon discounts applied",
          icon: Percent,
          tone: "violet",
          newBadge: true,
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Earnings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your revenue after the 10% platform fee.
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
        <EarningsSkeleton />
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

          <div className="mt-4">
            <BalanceCard
              key={balanceKey}
              onRequestPayout={() => setShowPayoutDrawer(true)}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <EarningsFlow data={stats.moneyFlow} topCourseShare={topCourseShare} />
            <RevenueTrendChart
              courses={stats.trend.courses}
              series={stats.trend.series}
              selected={selectedCourses}
              onSelect={setSelectedCourses}
              bucket={bucket}
            />
          </div>

          <div className="mt-6">
            <CourseEarningsTable courses={stats.courses} />
          </div>

          <div className="mt-6">
            <CouponPerformance coupons={stats.coupons} />
          </div>

          <div className="mt-6">
            <TransactionsTable transactions={stats.transactions} />
          </div>

          <div className="mt-6">
            <PayoutHistory key={balanceKey} />
          </div>
        </>
      ) : null}

      <PayoutRequestDrawer
        open={showPayoutDrawer}
        onClose={() => setShowPayoutDrawer(false)}
        onSubmitted={() => setBalanceKey((k) => k + 1)}
      />
    </div>
  );
}
