import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back!</p>
        </div>
        <Link
          href="/dashboard/new-course"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Start your own course
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Enrolled courses</h3>
          <p className="mt-1 text-sm text-muted-foreground">You haven&apos;t enrolled in any courses yet.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">In progress</h3>
          <p className="mt-1 text-sm text-muted-foreground">No active courses.</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Completed</h3>
          <p className="mt-1 text-sm text-muted-foreground">No completed courses yet.</p>
        </div>
      </div>
    </div>
  );
}
