"use client";

import { useState } from "react";
import { CourseCard } from "@/components/course-card";
import { Input } from "@/components/ui/input";
import { BookOpen, Search } from "lucide-react";

const enrolledCourses = [
  {
    id: "1",
    title: "Full-Stack Web Development with React & Node.js",
    instructor: "Sarah Chen",
    slug: "full-stack-web-development",
    progress: 68,
    lastLesson: "Lesson 8: Authentication Flow",
    thumbnail: null,
  },
  {
    id: "2",
    title: "Advanced TypeScript Patterns",
    instructor: "Alex Rivera",
    slug: "advanced-typescript",
    progress: 32,
    lastLesson: "Lesson 3: Generics Deep Dive",
    thumbnail: null,
  },
  {
    id: "3",
    title: "System Design for Senior Engineers",
    instructor: "James Wilson",
    slug: "system-design",
    progress: 15,
    lastLesson: "Lesson 2: Load Balancing",
    thumbnail: null,
  },
];

type FilterType = "all" | "in-progress" | "completed";

export default function MyCoursesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = enrolledCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "in-progress" && (course.progress ?? 0) > 0 && (course.progress ?? 0) < 100) ||
      (filter === "completed" && (course.progress ?? 0) === 100);
    return matchesSearch && matchesFilter;
  });

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Your Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {enrolledCourses.length} course{enrolledCourses.length !== 1 ? "s" : ""} enrolled
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search your courses..."
            className="h-8 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-12 text-center">
          <BookOpen className="size-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-1">
            {search ? "No courses match your search." : "No courses found for this filter."}
          </p>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
