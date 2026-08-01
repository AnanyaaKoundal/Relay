import { Skeleton } from "@/components/shared/skeleton";
import { KpiCardSkeleton } from "@/components/studio/overview/kpi-card-skeleton";

export function CoursesAnalyticsSkeleton() {
  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="mt-4 space-y-3.5">
              {Array.from({ length: 4 }, (_, j) => (
                <div key={j}>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-1.5 h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="mt-4 h-3 w-full rounded-full" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-1.5 h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="space-y-0 divide-y">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="ml-auto h-4 w-10" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
