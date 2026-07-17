"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function InstructorDashboardPage() {
  const { user, isInstructor, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/signin");
    } else if (!isInstructor) {
      router.replace("/instructor/onboarding");
    }
  }, [user, isInstructor, loading, router]);

  if (loading || !user || !isInstructor) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Instructor Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground">Courses</h3>
          <p className="mt-2 text-3xl font-semibold">0</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Draft courses</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground">Students</h3>
          <p className="mt-2 text-3xl font-semibold">0</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Enrolled learners</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground">Earnings</h3>
          <p className="mt-2 text-3xl font-semibold">$0</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Total revenue</p>
        </div>
      </div>
      <div className="mt-8 rounded-xl border border-dashed bg-card p-8 text-center">
        <h3 className="font-medium">Create your first course</h3>
        <p className="mt-1 text-sm text-muted-foreground">Start building and share your knowledge with learners.</p>
        <p className="mt-4 text-xs text-muted-foreground">Course creation will be available in the next update.</p>
      </div>
    </div>
  );
}
