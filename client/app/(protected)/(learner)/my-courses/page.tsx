"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { listEnrolledCourses } from "@/services/enrollment.service";
import type { Enrollment } from "@/types/enrollment.types";
import { Spinner } from "@/components/shared/spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { ContinueLearningSection } from "@/components/learner/my-courses/continue-learning-section";
import { CoursesFilters } from "@/components/learner/my-courses/courses-filters";
import { CourseTabs, type CourseTab } from "@/components/learner/my-courses/course-tabs";
import { CoursesGrid } from "@/components/learner/my-courses/courses-grid";
import { CoursesTable } from "@/components/learner/my-courses/courses-table";
import type { FilterTab, View, SortKey } from "@/components/learner/my-courses/types";

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [view, setView] = useState<View>("grid");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("lastAccessedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    listEnrolledCourses()
      .then(setEnrollments)
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  const continueLearning = useMemo(
    () =>
      enrollments.filter(
        (e) => e.status === "ACTIVE" && e.progress.length > 0,
      ),
    [enrollments],
  );

  const filtered = useMemo(() => {
    let list = enrollments;
    if (filter !== "all") {
      list = list.filter((e) => e.status === filter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.course.title.toLowerCase().includes(q) ||
          e.course.instructor?.name.toLowerCase().includes(q) ||
          false,
      );
    }
    return list;
  }, [enrollments, filter, query]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    const value = (e: Enrollment): string | number => {
      switch (sortKey) {
        case "title":
          return e.course.title.toLowerCase();
        case "instructor":
          return e.course.instructor?.name.toLowerCase() ?? "";
        case "progress":
          return e.progressPercent;
        case "status":
          return e.status;
        case "lastAccessedAt":
          return e.lastAccessedAt ? new Date(e.lastAccessedAt).getTime() : -Infinity;
        case "enrolledAt":
          return new Date(e.enrolledAt).getTime();
      }
    };
    list.sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const tabs: CourseTab[] = [
    { label: "All", value: "all", count: enrollments.length },
    {
      label: "In Progress",
      value: "ACTIVE",
      count: enrollments.filter((e) => e.status === "ACTIVE").length,
    },
    {
      label: "Completed",
      value: "COMPLETED",
      count: enrollments.filter((e) => e.status === "COMPLETED").length,
    },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
          <Spinner />
          Loading your courses...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Courses you&apos;re enrolled in
        </p>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState
          title="You haven't enrolled in any courses yet."
          action={{ label: "Browse Courses", href: "/courses" }}
        />
      ) : (
        <>
          <ContinueLearningSection enrollments={continueLearning} />

          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-semibold">
                All Courses{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({enrollments.length})
                </span>
              </h2>

              <CoursesFilters
                query={query}
                onQueryChange={setQuery}
                view={view}
                onViewChange={setView}
              />
            </div>

            <CourseTabs tabs={tabs} active={filter} onChange={setFilter} />

            {sorted.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-card/50 p-12 text-center">
                <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BookOpen className="size-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium">
                  {query || filter !== "all"
                    ? "No courses match your filters"
                    : "No courses yet"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {query || filter !== "all"
                    ? "Try a different search or filter."
                    : "Enroll in a course to see it here."}
                </p>
              </div>
            ) : view === "grid" ? (
              <CoursesGrid enrollments={sorted} />
            ) : (
              <CoursesTable
                enrollments={sorted}
                sortKey={sortKey}
                sortDir={sortDir}
                onToggleSort={toggleSort}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
