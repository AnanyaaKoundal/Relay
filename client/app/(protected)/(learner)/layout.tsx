"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isInstructor } = useAuth();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    await logout();
    router.push("/");
  }, [logout, router]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link href="/dashboard" className="font-semibold">Relay</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard">Dashboard</Link>
          {isInstructor ? (
            <Link href="/instructor/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Instructor Studio</Link>
          ) : (
            <Link href="/instructor/onboarding" className="text-muted-foreground hover:text-foreground transition-colors">Teach on Relay</Link>
          )}
          <button type="button" onClick={handleSignOut} className="hover:underline">
            Sign out
          </button>
        </nav>
      </header>
      <main className="flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
