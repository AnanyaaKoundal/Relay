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
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Bell,
  BookOpen,
  Receipt,
  UserRound,
  LogOut,
} from "lucide-react";
import { resolveAvatarUrl } from "@/lib/utils";

export function LearnerNavbar() {
  const { user, logout, isInstructor } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const avatarUrl = resolveAvatarUrl(user?.avatarUrl);

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
      <div className="mx-auto flex h-14 max-w-8xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/home" className="shrink-0 text-lg font-semibold tracking-tight">
          Relay
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden w-full max-w-sm md:block">
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
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
            <DropdownMenuTrigger className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-border ring-offset-2 ring-offset-background transition-shadow hover:ring-primary/50 cursor-pointer">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                initials
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-60 p-1.5">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-border ring-offset-2 text-sm font-semibold text-primary">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="size-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {user?.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => router.push("/my-courses")}
                className="gap-2.5"
              >
                <BookOpen className="size-4" />
                My Courses
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/account/purchases")}
                className="gap-2.5"
              >
                <Receipt className="size-4" />
                My Purchases
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/account/profile")}
                className="gap-2.5"
              >
                <UserRound className="size-4" />
                Profile Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem variant="destructive" onClick={handleSignOut} className="gap-2.5">
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
