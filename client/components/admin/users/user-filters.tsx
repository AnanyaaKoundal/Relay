"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useCallback, useRef, useTransition } from "react";
import { FilterSelect } from "@/components/shared/filter-select";

export function UserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = searchParams.get("search") ?? "";
  const role = searchParams.get("role") ?? "";
  const status = searchParams.get("status") ?? "";

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  const updateFilter = (key: string, value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ [key]: value })}`);
    });
  };

  const handleSearchChange = (value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      updateFilter("search", value);
    }, 300);
  };

  const hasFilters = search || role || status;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or email..."
          defaultValue={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full h-9 rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <FilterSelect
        value={role}
        placeholder="All Roles"
        onChange={(v) => updateFilter("role", v)}
        allLabel="All Roles"
        options={[
          { label: "Learners", value: "learner" },
          { label: "Instructors", value: "instructor" },
          { label: "Admins", value: "admin" },
        ]}
      />
      <FilterSelect
        value={status}
        placeholder="All Status"
        onChange={(v) => updateFilter("status", v)}
        allLabel="All Status"
        options={[
          { label: "Active", value: "ACTIVE" },
          { label: "Banned", value: "BANNED" },
        ]}
      />
      {hasFilters && (
        <button
          onClick={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            startTransition(() => {
              router.push(pathname);
            });
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-3" />
          Clear
        </button>
      )}
    </div>
  );
}
