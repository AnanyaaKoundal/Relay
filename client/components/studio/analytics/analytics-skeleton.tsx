import { Skeleton } from "@/components/shared/skeleton";
import { KpiCardSkeleton } from "@/components/studio/overview/kpi-card-skeleton";

function BarListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="mt-4 space-y-3.5">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i}>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-1.5 h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function CourseAnalyticsSkeleton() {
  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="mt-6 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-72 w-full" />
        </div>
      </div>

      <div className="mt-6">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="mt-4 space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <Skeleton className="mt-1.5 h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5">
            <Skeleton className="h-3.5 w-28" />
            <BarListSkeleton />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border bg-card p-5">
        <Skeleton className="h-3.5 w-32" />
        <div className="mt-2 divide-y">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="mt-1.5 h-1.5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
