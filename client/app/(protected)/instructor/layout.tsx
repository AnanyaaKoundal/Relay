"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const instructorNav = [
  { label: "Dashboard", href: "/instructor/dashboard" },
  { label: "Courses", href: "/instructor/courses" },
  { label: "Settings", href: "/instructor/settings" },
  { label: "Earnings", href: "/instructor/earnings" },
];

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isOnboarding = pathname === "/instructor/onboarding";

  return (
    <div className="flex min-h-full flex-col">
      {!isOnboarding && (
        <header className="flex items-center justify-between border-b bg-card px-6 py-3">
          <Link href="/instructor/dashboard" className="text-base font-semibold tracking-tight">
            Instructor Studio
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {instructorNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  pathname === item.href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to learner
            </Link>
          </nav>
        </header>
      )}
      <main className="flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
