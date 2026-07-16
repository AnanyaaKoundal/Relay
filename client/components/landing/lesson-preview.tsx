import { Play, FileText, MessageCircle, ChevronRight } from "lucide-react";

export function LessonPreview() {
  return (
    <section className="border-y bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">See learning in action</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A preview of the lesson experience inside Relay
          </p>
        </div>

        <div className="mx-auto max-w-5xl rounded-2xl border bg-card shadow-xl overflow-hidden">
          {/* top bar */}
          <div className="flex items-center justify-between border-b px-4 py-2.5 bg-muted/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Full-Stack Web Development</span>
              <ChevronRight className="size-3" />
              <span>Chapter 3</span>
              <ChevronRight className="size-3" />
              <span className="text-foreground">Building REST APIs</span>
            </div>
            <div className="text-xs text-muted-foreground">68% complete</div>
          </div>

          <div className="grid md:grid-cols-[1fr_280px]">
            {/* video area */}
            <div className="aspect-video bg-zinc-900 flex items-center justify-center border-r">
              <div className="flex size-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <Play className="size-6 text-white ml-0.5" />
              </div>
            </div>

            {/* sidebar */}
            <div className="flex flex-col">
              <div className="border-b p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <FileText className="size-3.5" />
                  Chapter 3 — 5 lessons
                </div>
                <div className="space-y-1">
                  {["Introduction", "Setting up Express", "Route handlers", "Middleware", "Error handling"].map((lesson, i) => (
                    <div
                      key={lesson}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                        i === 2
                          ? "bg-emerald-50 text-emerald-700 font-medium"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div
                        className={`size-1.5 rounded-full ${
                          i < 2 ? "bg-emerald-500" : i === 2 ? "bg-emerald-500" : "bg-muted-foreground/30"
                        }`}
                      />
                      {lesson}
                    </div>
                  ))}
                </div>
              </div>

              {/* notes + discussion tabs */}
              <div className="flex-1 p-3 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <MessageCircle className="size-3.5" />
                  Discussion
                </div>
                <div className="rounded-lg border p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Great lesson! Could you explain the difference between
                    app.use and app.get in Express?
                  </p>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">— Alex · 2h ago</p>
                </div>
                <div className="rounded-lg border p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    I was stuck on this for hours. The middleware explanation
                    was super clear.
                  </p>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">— Priya · 1h ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
