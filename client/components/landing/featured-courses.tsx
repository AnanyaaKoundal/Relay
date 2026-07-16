import Image from "next/image";
import { Bookmark } from "lucide-react";

const courses = [
  {
    title: "Full-Stack Web Development",
    creator: "Sarah Chen",
    rating: 4.8,
    duration: "12h",
    difficulty: "Intermediate",
    price: "$49",
    thumbnail: "/thumbnail.avif",
  },
  {
    title: "Machine Learning Fundamentals",
    creator: "Dr. James Park",
    rating: 4.9,
    duration: "18h",
    difficulty: "Advanced",
    price: "$79",
    thumbnail: "/thumbnail.avif",
  },
  {
    title: "UI/UX Design Principles",
    creator: "Maria Lopez",
    rating: 4.7,
    duration: "8h",
    difficulty: "Beginner",
    price: "Free",
    thumbnail: "/thumbnail.avif",
  },
  {
    title: "Data Science with Python",
    creator: "Alex Rivera",
    rating: 4.6,
    duration: "15h",
    difficulty: "Intermediate",
    price: "$59",
    thumbnail: "/thumbnail.avif",
  },
];

export function FeaturedCourses() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured courses</h2>
            <p className="mt-1 text-muted-foreground text-sm">Hand-picked by our team</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <div
              key={course.title}
              className="group rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[16/10] relative">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                <button
                  className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Bookmark className="size-3.5" />
                </button>
                <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
                  {course.duration}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-muted-foreground">{course.creator}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 text-amber-500">
                    ★ {course.rating}
                  </span>
                  <span>·</span>
                  <span className="rounded-full border px-2 py-0.5 text-[10px]">
                    {course.difficulty}
                  </span>
                </div>
                <p className="text-sm font-semibold">{course.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
