"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, Users, Star } from "lucide-react";

const allCourses = [
  {
    id: "1",
    title: "Full-Stack Web Development with React & Node.js",
    instructor: "Sarah Chen",
    slug: "full-stack-web-development",
    rating: 4.8,
    students: 2400,
    price: 49,
    category: "Web Development",
    difficulty: "Intermediate",
    thumbnail: null,
  },
  {
    id: "2",
    title: "Advanced TypeScript Patterns",
    instructor: "Alex Rivera",
    slug: "advanced-typescript",
    rating: 4.7,
    students: 1200,
    price: 39,
    category: "Web Development",
    difficulty: "Advanced",
    thumbnail: null,
  },
  {
    id: "3",
    title: "System Design for Senior Engineers",
    instructor: "James Wilson",
    slug: "system-design",
    rating: 4.9,
    students: 3100,
    price: 59,
    category: "Architecture",
    difficulty: "Advanced",
    thumbnail: null,
  },
  {
    id: "4",
    title: "Machine Learning Fundamentals",
    instructor: "Dr. Emily Park",
    slug: "machine-learning",
    rating: 4.9,
    students: 3200,
    price: 59,
    category: "Data Science",
    difficulty: "Intermediate",
    thumbnail: null,
  },
  {
    id: "5",
    title: "Cloud Architecture with AWS",
    instructor: "Michael Thompson",
    slug: "cloud-architecture-aws",
    rating: 4.7,
    students: 1800,
    price: 49,
    category: "Cloud & DevOps",
    difficulty: "Intermediate",
    thumbnail: null,
  },
  {
    id: "6",
    title: "Design Systems at Scale",
    instructor: "Lisa Chen",
    slug: "design-systems",
    rating: 4.8,
    students: 950,
    price: 0,
    category: "Design",
    difficulty: "Intermediate",
    thumbnail: null,
  },
  {
    id: "7",
    title: "Rust for Systems Programming",
    instructor: "David Kim",
    slug: "rust-systems",
    rating: 4.6,
    students: 2100,
    price: 39,
    category: "Programming",
    difficulty: "Advanced",
    thumbnail: null,
  },
  {
    id: "8",
    title: "Data Engineering with Python",
    instructor: "Anna Schmidt",
    slug: "data-engineering-python",
    rating: 4.5,
    students: 1400,
    price: 45,
    category: "Data Science",
    difficulty: "Intermediate",
    thumbnail: null,
  },
  {
    id: "9",
    title: "iOS Development with Swift",
    instructor: "Chris Martinez",
    slug: "ios-development-swift",
    rating: 4.7,
    students: 2800,
    price: 55,
    category: "Mobile Development",
    difficulty: "Beginner",
    thumbnail: null,
  },
  {
    id: "10",
    title: "Python for Beginners",
    instructor: "Rachel Green",
    slug: "python-beginners",
    rating: 4.8,
    students: 5600,
    price: 0,
    category: "Programming",
    difficulty: "Beginner",
    thumbnail: null,
  },
  {
    id: "11",
    title: "Docker & Kubernetes Deep Dive",
    instructor: "Tom Anderson",
    slug: "docker-kubernetes",
    rating: 4.6,
    students: 1900,
    price: 42,
    category: "Cloud & DevOps",
    difficulty: "Intermediate",
    thumbnail: null,
  },
  {
    id: "12",
    title: "React Native Mobile Apps",
    instructor: "Priya Patel",
    slug: "react-native-mobile",
    rating: 4.5,
    students: 1600,
    price: 35,
    category: "Mobile Development",
    difficulty: "Intermediate",
    thumbnail: null,
  },
];

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

function CourseCatalogCard({ course }: { course: (typeof allCourses)[number] }) {
  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-3xl font-bold text-primary/20">
                {course.title.charAt(0)}
              </span>
            </div>
          )}
          {course.difficulty && (
            <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
              {course.difficulty}
            </span>
          )}
          <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white font-medium">
            {course.price === 0 ? "Free" : `$${course.price}`}
          </span>
        </div>

        <div className="p-3.5 space-y-2">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-muted-foreground">{course.instructor}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="size-3 fill-amber-500 text-amber-500" />
              {course.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {course.students >= 1000
                ? `${(course.students / 1000).toFixed(1)}k`
                : course.students}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");

  const filtered = allCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || course.category === category;
    const matchesDifficulty = difficulty === "All" || course.difficulty === difficulty;
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "free" && course.price === 0) ||
      (priceFilter === "paid" && course.price > 0);
    return matchesSearch && matchesCategory && matchesDifficulty && matchesPrice;
  });

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
              className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium transition-colors ${
                category === cat
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
                className={`inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium transition-colors ${
                  difficulty === d
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
                className={`inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium transition-colors ${
                  priceFilter === p
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
        {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Course grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((course) => (
            <CourseCatalogCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No courses match your filters.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setDifficulty("All");
              setPriceFilter("all");
            }}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
