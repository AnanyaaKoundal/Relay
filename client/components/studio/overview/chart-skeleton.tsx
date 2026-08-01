import { Skeleton } from "@/components/shared/skeleton";

export function ChartSkeleton() {
  return (
    <div className="h-80 w-full">
      <Skeleton className="h-full w-full" />
    </div>
  );
}
