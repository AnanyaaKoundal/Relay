import { Skeleton } from "@/components/shared/skeleton";

const ROWS = 5;

export function TopCoursesSkeleton() {
  return (
    <div className="-mx-2 divide-y">
      {Array.from({ length: ROWS }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-2 py-3.5 first:pt-2 last:pb-2">
          <Skeleton className="h-3 w-5" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-3.5 w-44" />
            <div className="mt-2 flex items-center gap-2">
              <Skeleton className="h-1.5 w-28 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="shrink-0 text-right">
            <Skeleton className="ml-auto h-3.5 w-16" />
            <Skeleton className="ml-auto mt-2 h-3 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}
