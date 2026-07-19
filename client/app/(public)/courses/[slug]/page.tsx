"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChevronDown, Play, Lock, Clock, Users, Star, BarChart, CheckCircle } from "lucide-react";

const courseData: Record<string, {
  title: string;
  description: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  difficulty: string;
  price: number;
  category: string;
  thumbnail: string | null;
  chapters: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      duration: string;
      isPreview: boolean;
      isCompleted: boolean;
    }[];
  }[];
}> = {
  "full-stack-web-development": {
    title: "Full-Stack Web Development with React & Node.js",
    description: "Master modern web development from front to back. Build real-world applications with React, Node.js, Express, PostgreSQL, and deployment best practices.",
    instructor: "Sarah Chen",
    rating: 4.8,
    students: 2400,
    duration: "42 hours",
    difficulty: "Intermediate",
    price: 49,
    category: "Web Development",
    thumbnail: null,
    chapters: [
      {
        id: "ch1",
        title: "Welcome & Setup",
        lessons: [
          { id: "l1", title: "Course Overview", duration: "5:30", isPreview: true, isCompleted: false },
          { id: "l2", title: "Environment Setup", duration: "12:00", isPreview: true, isCompleted: false },
          { id: "l3", title: "Development Tools", duration: "8:45", isPreview: false, isCompleted: false },
        ],
      },
      {
        id: "ch2",
        title: "React Fundamentals",
        lessons: [
          { id: "l4", title: "JSX & Components", duration: "18:20", isPreview: true, isCompleted: false },
          { id: "l5", title: "Props & State", duration: "22:15", isPreview: false, isCompleted: false },
          { id: "l6", title: "Hooks Deep Dive", duration: "25:00", isPreview: false, isCompleted: false },
          { id: "l7", title: "Component Patterns", duration: "19:30", isPreview: false, isCompleted: false },
        ],
      },
      {
        id: "ch3",
        title: "Building the Backend",
        lessons: [
          { id: "l8", title: "Node.js & Express", duration: "20:10", isPreview: false, isCompleted: false },
          { id: "l9", title: "REST API Design", duration: "16:45", isPreview: false, isCompleted: false },
          { id: "l10", title: "Database Integration", duration: "24:00", isPreview: false, isCompleted: false },
        ],
      },
      {
        id: "ch4",
        title: "Authentication & Security",
        lessons: [
          { id: "l11", title: "JWT Authentication", duration: "22:30", isPreview: false, isCompleted: false },
          { id: "l12", title: "OAuth Integration", duration: "18:00", isPreview: false, isCompleted: false },
          { id: "l13", title: "Security Best Practices", duration: "14:20", isPreview: false, isCompleted: false },
        ],
      },
      {
        id: "ch5",
        title: "Deployment",
        lessons: [
          { id: "l14", title: "Production Build", duration: "15:00", isPreview: false, isCompleted: false },
          { id: "l15", title: "Deploy to Vercel", duration: "12:30", isPreview: false, isCompleted: false },
          { id: "l16", title: "Monitoring & Logs", duration: "10:00", isPreview: false, isCompleted: false },
        ],
      },
    ],
  },
};

function ChapterAccordion({
  chapter,
  chapterNumber,
  defaultOpen,
}: {
  chapter: { id: string; title: string; lessons: { id: string; title: string; duration: string; isPreview: boolean; isCompleted: boolean }[] };
  chapterNumber: number;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);
  const previewCount = chapter.lessons.filter((l) => l.isPreview).length;

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold shrink-0">
            {chapterNumber}
          </div>
          <div>
            <h3 className="text-sm font-semibold">{chapter.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {chapter.lessons.length} lessons
              {previewCount > 0 && ` · ${previewCount} preview`}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="border-t">
          {chapter.lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between px-4 py-3 border-b last:border-b-0"
            >
              <div className="flex items-center gap-3">
                {lesson.isPreview ? (
                  <Play className="size-4 text-primary shrink-0" />
                ) : lesson.isCompleted ? (
                  <CheckCircle className="size-4 text-success shrink-0" />
                ) : (
                  <Lock className="size-4 text-muted-foreground/50 shrink-0" />
                )}
                <span className="text-sm">{lesson.title}</span>
                {lesson.isPreview && (
                  <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                    Preview
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0 ml-4">{lesson.duration}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const course = courseData[params.slug] ?? null;

  if (!course) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-semibold">Course not found</h1>
        <Link href="/courses" className="text-sm text-primary hover:underline">
          Browse all courses
        </Link>
      </div>
    );
  }

  const totalLessons = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const previewLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.isPreview).length,
    0,
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-foreground/5 via-background to-primary/5 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr,380px] lg:gap-12 items-start">
            {/* Left — Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{course.category}</span>
                <span>·</span>
                <span>{course.difficulty}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                {course.description}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Star className="size-4 fill-amber-500 text-amber-500" />
                  <span className="font-medium text-foreground">{course.rating}</span>
                  <span>({course.students.toLocaleString()} students)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <BarChart className="size-4" />
                  {course.difficulty}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="size-4" />
                  {course.students.toLocaleString()} students
                </span>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                  {course.instructor.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{course.instructor}</p>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                </div>
              </div>

              {/* Mobile CTA */}
              <div className="flex items-center gap-4 lg:hidden">
                <span className="text-2xl font-bold">
                  {course.price === 0 ? "Free" : `$${course.price}`}
                </span>
                <Link
                  href="/signup"
                  className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
                >
                  Enroll Now
                </Link>
              </div>
            </div>

            {/* Right — Thumbnail + CTA card (desktop) */}
            <div className="hidden lg:block sticky top-20">
              <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <span className="text-4xl font-bold text-primary/20">
                        {course.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {course.price === 0 ? "Free" : `$${course.price}`}
                    </span>
                  </div>
                  <Link
                    href="/signup"
                    className="flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors w-full"
                  >
                    Enroll Now
                  </Link>
                  <p className="text-xs text-center text-muted-foreground">
                    30-day money-back guarantee
                  </p>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-2.5">
                      <Clock className="size-4 text-muted-foreground" />
                      <span>{course.duration} of content</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <BarChart className="size-4 text-muted-foreground" />
                      <span>{course.difficulty} level</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle className="size-4 text-muted-foreground" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold mb-2">Course Curriculum</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {course.chapters.length} chapters · {totalLessons} lessons · {course.duration} total
            {previewLessons > 0 && ` · ${previewLessons} preview lessons`}
          </p>

          <div className="space-y-3">
            {course.chapters.map((chapter, i) => (
              <ChapterAccordion
                key={chapter.id}
                chapter={chapter}
                chapterNumber={i + 1}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
