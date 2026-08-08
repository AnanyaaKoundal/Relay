"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { resolveAvatarUrl } from "@/lib/utils";

const sidebarItems = [
  { label: "Overview", href: "/studio/overview", icon: "LayoutDashboard" },
  { label: "Courses", href: "/studio/courses", icon: "BookOpen" },
  { label: "Earnings", href: "/studio/earnings", icon: "DollarSign" },
  { label: "Analytics", href: "/studio/analytics", icon: "BarChart3" },
  { label: "Settings", href: "/studio/settings", icon: "Settings" },
];

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-0"} sticky top-0 h-screen transition-all duration-200 border-r bg-card overflow-hidden flex flex-col`}>
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/studio/overview" className="text-sm font-semibold tracking-tight">Studio</Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {sidebarItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <Link
            href="/home"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Back to learning
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur-lg px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/studio/courses/new"
              className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
            >
              Create Course
            </Link>
            <div className="size-8 shrink-0 overflow-hidden rounded-full ring-2 ring-border ring-offset-2 flex items-center justify-center text-xs font-medium text-muted-foreground">
              {resolveAvatarUrl(user.avatarUrl) ? (
                <img src={resolveAvatarUrl(user.avatarUrl)!} alt="" className="size-full object-cover" />
              ) : (
                user.name?.charAt(0)?.toUpperCase() ?? "U"
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
