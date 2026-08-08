"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { browseCourses } from "@/services/course.service";
import type { PublicCourse } from "@/types/course.types";
import { resolveBannerUrl } from "@/lib/utils";
import { InstructorHoverCard } from "@/components/learner/instructor-hover-card";
import { Search, Users } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { EmptyState } from "@/components/shared/empty-state";

const categories = [
  "All",
  "Web Development",
  "Data Science",
  "Mobile Development",
  "Cloud & DevOps",
  "Design",
  "Programming",
  "Architecture",
];

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

const THUMBNAIL = "/thumbnail.avif";

function CourseCatalogCard({ course }: { course: PublicCourse }) {
  const discounted =
    course.promo && course.price > 0
      ? course.promo.discountType === "PERCENTAGE"
        ? Math.round(course.price * (1 - course.promo.discountValue / 100) * 100) / 100
        : Math.max(course.price - course.promo.discountValue, 0)
      : undefined;

  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {course.bannerUrl ? (
            <Image
              src={resolveBannerUrl(course.bannerUrl) ?? THUMBNAIL}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Image
              src={THUMBNAIL}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          {course.difficulty && (
            <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
              {course.difficulty}
            </span>
          )}
          {course.promo && (
            <span className="absolute top-2 right-2 rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
              {course.promo.discountType === "PERCENTAGE"
                ? `${course.promo.discountValue}% off`
                : `₹${course.promo.discountValue} off`}
            </span>
          )}
          <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white font-medium">
            {discounted !== undefined
              ? discounted === 0
                ? "Free"
                : `₹${discounted}`
              : Number(course.price) === 0
                ? "Free"
                : `₹${course.price}`}
          </span>
        </div>

        <div className="p-3.5 space-y-2">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {course.instructor ? (
              <InstructorHoverCard name={course.instructor.name} profile={course.instructor.profile} />
            ) : (
              "Unknown instructor"
            )}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {course._count.enrollments.toLocaleString()} enrolled
            </span>
            <span>{course._count.chapters} chapters</span>
          </div>
          {discounted !== undefined && (
            <p className="text-sm font-semibold">
              {discounted === 0 ? "Free" : `₹${discounted}`}
              <span className="ml-1 text-xs font-normal text-muted-foreground line-through">
                ₹{course.price}
              </span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const initialCategory = searchParams.get("category") ?? "All";

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState("All");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params: Parameters<typeof browseCourses>[0] = { limit: 50 };
    if (search) params.search = search;
    if (category !== "All") params.category = category;
    if (difficulty !== "All") params.difficulty = difficulty;
    if (priceFilter === "free") params.free = true;
    if (priceFilter === "paid") params.free = false;

    browseCourses(params)
      .then((res) => {
        setCourses(res.courses);
        setTotal(res.pagination.total);
      })
      .catch(() => {
        setCourses([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [search, category, difficulty, priceFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Explore Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover courses from expert instructors
        </p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="h-8 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium transition-colors ${category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty + Price */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Level:</span>
            {difficulties.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium transition-colors ${difficulty === d
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Price:</span>
            {(["all", "free", "paid"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriceFilter(p)}
                className={`inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium transition-colors ${priceFilter === p
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {p === "all" ? "All" : p === "free" ? "Free" : "Paid"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {loading ? "Loading..." : `${total} course${total !== 1 ? "s" : ""} found`}
      </p>

      {/* Course grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
          <Spinner />
          Loading courses...
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {courses.map((course) => (
            <CourseCatalogCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No courses match your filters."
          action={{
            label: "Clear all filters",
            onClick: () => {
              setSearch("");
              setCategory("All");
              setDifficulty("All");
              setPriceFilter("all");
            },
          }}
        />
      )}
    </div>
  );
}
