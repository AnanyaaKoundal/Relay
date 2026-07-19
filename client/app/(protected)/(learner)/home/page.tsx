"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { CourseCard } from "@/components/course-card";
import { ArrowRight, BookOpen, Sparkles, Clock } from "lucide-react";

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

const recommendedCourses = [
  {
    id: "4",
    title: "Machine Learning Fundamentals",
    instructor: "Dr. Emily Park",
    rating: 4.9,
    students: 3200,
    price: 59,
    thumbnail: null,
  },
  {
    id: "5",
    title: "Cloud Architecture with AWS",
    instructor: "Michael Thompson",
    rating: 4.7,
    students: 1800,
    price: 49,
    thumbnail: null,
  },
  {
    id: "6",
    title: "Design Systems at Scale",
    instructor: "Lisa Chen",
    rating: 4.8,
    students: 950,
    price: 0,
    thumbnail: null,
  },
  {
    id: "7",
    title: "Rust for Systems Programming",
    instructor: "David Kim",
    rating: 4.6,
    students: 2100,
    price: 39,
    thumbnail: null,
  },
  {
    id: "8",
    title: "Data Engineering with Python",
    instructor: "Anna Schmidt",
    rating: 4.5,
    students: 1400,
    price: 45,
    thumbnail: null,
  },
  {
    id: "9",
    title: "iOS Development with Swift",
    instructor: "Chris Martinez",
    rating: 4.7,
    students: 2800,
    price: 55,
    thumbnail: null,
  },
];

function SectionHeader({
  icon: Icon,
  title,
  actionHref,
  actionLabel,
}: {
  icon: React.ElementType;
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {actionLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

function CourseRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6">
      {children}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          {greeting()}, {user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Pick up where you left off or explore something new.
        </p>
      </div>

      {/* Continue Learning */}
      {enrolledCourses.length > 0 && (
        <section>
          <SectionHeader
            icon={Clock}
            title="Continue Learning"
            actionHref="/my-courses"
            actionLabel="View all"
          />
          <CourseRow>
            {enrolledCourses.map((course) => (
              <div key={course.id} className="w-72 shrink-0">
                <CourseCard {...course} showContinue />
              </div>
            ))}
          </CourseRow>
        </section>
      )}

      {/* My Courses */}
      <section>
        <SectionHeader
          icon={BookOpen}
          title="Your Courses"
          actionHref="/my-courses"
          actionLabel="View all"
        />
        {enrolledCourses.length > 0 ? (
          <CourseRow>
            {enrolledCourses.map((course) => (
              <div key={course.id} className="w-72 shrink-0">
                <CourseCard {...course} showContinue={false} />
              </div>
            ))}
            {/* View All card */}
            <Link
              href="/my-courses"
              className="w-72 shrink-0 flex items-center justify-center rounded-xl border-2 border-dashed bg-card/50 transition-colors hover:bg-card hover:border-primary/30 min-h-[280px]"
            >
              <div className="text-center space-y-2">
                <ArrowRight className="size-6 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">View All Courses</p>
              </div>
            </Link>
          </CourseRow>
        ) : (
          <div className="rounded-xl border bg-card p-8 text-center">
            <BookOpen className="size-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              You haven&apos;t enrolled in any courses yet.
            </p>
            <Link
              href="/courses"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </section>

      {/* Recommended */}
      <section>
        <SectionHeader
          icon={Sparkles}
          title="Recommended for You"
          actionHref="/courses"
          actionLabel="Explore more"
        />
        <CourseRow>
          {recommendedCourses.map((course) => (
            <div key={course.id} className="w-72 shrink-0">
              <CourseCard {...course} showContinue={false} />
            </div>
          ))}
        </CourseRow>
      </section>

      {/* Browse by Category */}
      <section>
        <SectionHeader icon={BookOpen} title="Browse by Category" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            "Web Development",
            "Data Science",
            "Mobile Development",
            "Cloud & DevOps",
            "Design",
            "Business",
          ].map((cat) => (
            <Link
              key={cat}
              href={`/courses?category=${encodeURIComponent(cat)}`}
              className="rounded-xl border bg-card p-4 text-center text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 hover:text-primary"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
