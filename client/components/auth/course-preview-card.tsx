import Image from "next/image";

export function CoursePreviewCard() {
  return (
    <div className="relative w-full max-w-xs rounded-2xl border bg-card shadow-xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
      <div className="aspect-[16/10] relative">
        <Image
          src="/thumbnail.avif"
          alt="Course preview"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
      <div className="p-4 space-y-2.5">
        <h3 className="font-semibold text-sm leading-snug">
          Full-Stack Web Development
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Sarah Chen</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <span className="text-amber-500">★</span>
            4.8
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>2.4k enrolled</span>
          <div className="flex items-center gap-2">
            <span>Lesson 4 of 12</span>
            <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[33%] rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
