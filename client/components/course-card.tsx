"use client";

import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

type CourseCardProps = {
  id: string;
  title: string;
  instructor?: string;
  thumbnail?: string | null;
  slug?: string;
  progress?: number;
  lastLesson?: string;
  rating?: number;
  students?: number;
  price?: number;
  showContinue?: boolean;
  learnHref?: string;
};

export function CourseCard({
  id,
  title,
  instructor,
  thumbnail,
  slug,
  progress,
  lastLesson,
  rating,
  students,
  price,
  showContinue = true,
  learnHref,
}: CourseCardProps) {
  const href = learnHref ?? (slug ? `/learn/${slug}` : `/courses/${id}`);
  const isEnrolled = progress !== undefined;
  const hasProgress = isEnrolled && progress > 0;

  return (
    <Link href={href} className="group block">
      <div className="overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Image
              src="/thumbnail.avif"
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}

          {/* Play overlay on hover */}
          {hasProgress && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
              <div className="size-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 transition-all group-hover:opacity-100 group-hover:scale-100 scale-90">
                <Play className="size-4 fill-foreground text-foreground ml-0.5" />
              </div>
            </div>
          )}

          {/* Duration / Price badge */}
          {price !== undefined && !hasProgress && (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
              {price === 0 ? "Free" : `$${price}`}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-2">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {instructor && (
            <p className="text-xs text-muted-foreground">{instructor}</p>
          )}

          {/* Rating + students */}
          {(rating !== undefined || students !== undefined) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {rating !== undefined && (
                <span className="flex items-center gap-1">
                  <span className="text-amber-500">★</span>
                  {rating.toFixed(1)}
                </span>
              )}
              {students !== undefined && (
                <span>{students >= 1000 ? `${(students / 1000).toFixed(1)}k` : students} students</span>
              )}
            </div>
          )}

          {/* Progress */}
          {isEnrolled && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">{lastLesson ?? (hasProgress ? "In progress" : "Not started")}</span>
                <span className="shrink-0 ml-2">{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {showContinue && (
                <button
                  type="button"
                  className="mt-1 inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
                >
                  <Play className="size-3 fill-current" />
                  {hasProgress ? "Continue" : "Start"}
                </button>
              )}
            </div>
          )}

          {price !== undefined && !hasProgress && (
            <p className="text-sm font-semibold">
              {price === 0 ? "Free" : `$${price}`}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
