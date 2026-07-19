"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Bell,
  BookOpen,
  CreditCard,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";

export function LearnerNavbar() {
  const { user, logout, isInstructor } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/home" className="shrink-0 text-lg font-semibold tracking-tight">
          Relay
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden flex-1 max-w-md md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="h-8 pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <Button variant="ghost" size="icon" className="relative text-muted-foreground">
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
          </Button>

          {/* Instructor CTA */}
          {isInstructor ? (
            <Link
              href="/studio/overview"
              className="hidden h-8 items-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors sm:inline-flex"
            >
              Studio
            </Link>
          ) : (
            <Link
              href="/become-instructor"
              className="hidden h-8 items-center rounded-lg border px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors sm:inline-flex"
            >
              Teach on Relay
            </Link>
          )}

          {/* Avatar menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors outline-none cursor-pointer">
              {initials}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <div className="-mx-1 my-1 h-px bg-border" />
              <DropdownMenuItem onClick={() => router.push("/my-courses")}>
                <BookOpen className="size-4" />
                Your Courses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/account")}>
                <CreditCard className="size-4" />
                Payments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/account")}>
                <Settings className="size-4" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/account")}>
                <Shield className="size-4" />
                Security
              </DropdownMenuItem>
              <div className="-mx-1 my-1 h-px bg-border" />
              <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                <LogOut className="size-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
