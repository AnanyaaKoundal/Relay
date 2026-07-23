"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getMyCourses, deleteCourse } from "@/services/course.service";
import { useConfirm } from "@/components/shared/confirm-modal";
import type { CourseListItem } from "@/types/course.types";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  BookOpen,
  Users,
  GripVertical,
} from "lucide-react";

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PENDING_APPROVAL: {
    label: "Pending",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  PUBLISHED: {
    label: "Published",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

type FilterTab = "all" | "PUBLISHED" | "DRAFT";

export default function StudioCoursesPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    getMyCourses()
      .then(setCourses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(course: CourseListItem) {
    const ok = await confirm({
      title: "Delete course",
      description: `Are you sure you want to delete "${course.title}"? This action cannot be undone and all associated chapters and lessons will be permanently removed.`,
      confirmLabel: "Delete",
      cancelLabel: "Keep course",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteCourse(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    } catch {
      // error handled silently
    }
  }

  const filtered =
    filter === "all" ? courses : courses.filter((c) => c.status === filter);

  const tabs: { label: string; value: FilterTab; count: number }[] = [
    { label: "All", value: "all", count: courses.length },
    {
      label: "Published",
      value: "PUBLISHED",
      count: courses.filter((c) => c.status === "PUBLISHED").length,
    },
    {
      label: "Drafts",
      value: "DRAFT",
      count: courses.filter((c) => c.status === "DRAFT").length,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and organize your course content
          </p>
        </div>
        <Link
          href="/studio/courses/new"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          <Plus className="size-4" />
          Create Course
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors ${
              filter === tab.value
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab.value
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="mt-16 text-center text-muted-foreground text-sm">
          Loading courses...
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed bg-card p-12 text-center">
          <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <BookOpen className="size-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium">
            {filter === "all" ? "No courses yet" : `No ${filter.toLowerCase()} courses`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {filter === "all"
              ? "Create your first course to get started."
              : "Try a different filter."}
          </p>
          {filter === "all" && (
            <Link
              href="/studio/courses/new"
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              <Plus className="size-4" />
              Create Course
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((course) => {
            const status = statusConfig[course.status] ?? {
              label: course.status,
              className: "bg-muted text-muted-foreground border-border",
            };
            const draftCount = course.chapters?.reduce(
              (acc, ch) => acc + ch.lessons.length,
              0
            ) ?? 0;

            return (
              <div
                key={course.id}
                className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-sm hover:border-primary/20"
              >
                {/* Drag handle (placeholder for future DnD) */}
                <div className="hidden sm:flex size-8 items-center justify-center rounded-lg text-muted-foreground/40 group-hover:text-muted-foreground transition-colors cursor-grab">
                  <GripVertical className="size-4" />
                </div>

                {/* Thumbnail */}
                <Link
                  href={`/studio/courses/${course.id}/edit`}
                  className="relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src="/thumbnail.avif"
                      alt=""
                      fill
                      className="object-cover"
                    />
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/studio/courses/${course.id}/edit`}
                      className="text-sm font-semibold hover:text-primary transition-colors truncate"
                    >
                      {course.title}
                    </Link>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                    {course.status === "PUBLISHED" && draftCount > 0 && (
                      <span className="shrink-0 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-medium">
                        {draftCount} draft{draftCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-3" />
                      {course._count.chapters} chapter
                      {course._count.chapters !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {course._count.enrollments} enrolled
                    </span>
                    <span className="hidden sm:inline">
                      ${Number(course.price).toFixed(2)}
                    </span>
                    <span className="hidden sm:inline">
                      Updated{" "}
                      {new Date(course.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/studio/courses/${course.id}/edit`}
                    className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil className="size-3" />
                    Edit
                  </Link>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(openMenu === course.id ? null : course.id)
                      }
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                    {openMenu === course.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenMenu(null)}
                        />
                        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border bg-popover p-1 shadow-lg">
                          <Link
                            href={`/studio/courses/${course.id}/edit`}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors sm:hidden"
                            onClick={() => setOpenMenu(null)}
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenu(null);
                              handleDelete(course);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
