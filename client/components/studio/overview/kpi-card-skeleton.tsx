import { Skeleton } from "@/components/shared/skeleton";

export function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="size-4 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-7 w-28" />
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
