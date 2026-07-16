import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          {/* Left */}
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Learn from the best.<br />
            <span className="text-emerald-600">Teach what you know.</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Relay is a modern knowledge platform where creators publish structured
              courses and learners discover high-quality content. No fluff. No noise.
              Just meaningful learning experiences.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center rounded-xl bg-emerald-600 px-6 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-all duration-200"
              >
                Start learning
              </Link>
              <Link
                href="/signup?role=instructor"
                className="inline-flex h-11 items-center rounded-xl border px-6 text-sm font-medium text-foreground hover:bg-muted transition-all duration-200"
              >
                Become an instructor
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              No credit card required · Free courses available
            </p>
          </div>

          {/* Right — course card */}
          <div className="relative flex justify-center">
            {/* decorative blobs */}
            <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />

            <div className="relative w-full max-w-sm rounded-2xl border bg-card shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="aspect-[16/9] relative">
                <Image
                  src="/thumbnail.avif"
                  alt="Course thumbnail"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
                  12 hours
                </span>
              </div>
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-base leading-snug">
                  Full-Stack Web Development
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="text-amber-500 text-xs">★</span>
                    4.8
                  </span>
                  <span>·</span>
                  <span>Sarah Chen</span>
                  <span>·</span>
                  <span>2.4k enrolled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">$49</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>68% complete</span>
                    <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[68%] rounded-full bg-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
