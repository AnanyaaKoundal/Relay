import { Skeleton } from "@/components/shared/skeleton";
import { KpiCardSkeleton } from "@/components/studio/overview/kpi-card-skeleton";

export function EarningsSkeleton() {
  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-28" />
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

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
          <Skeleton className="mt-4 h-48 w-full" />
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="mt-1.5 h-3 w-40" />
          </div>
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        <div className="space-y-0 divide-y">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="ml-auto h-4 w-16" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="mt-1.5 h-3 w-16" />
              </div>
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-0 divide-y">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="ml-auto h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
