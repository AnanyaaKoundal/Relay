const stats = [
  { value: "2,400+", label: "Courses Published" },
  { value: "85,000+", label: "Active Learners" },
  { value: "320+", label: "Expert Instructors" },
  { value: "150,000+", label: "Lessons Completed" },
];

const testimonials = [
  {
    name: "Rohan Mehta",
    role: "Software Engineer",
    avatar: "RM",
    text: "I was skeptical about online courses, but Relay is different. The structure is so clear that I actually finished my first course — and signed up for three more.",
  },
  {
    name: "Emily Torres",
    role: "UX Designer",
    avatar: "ET",
    text: "As someone who teaches design, I appreciate how much thought went into the instructor experience. Publishing my first course took less than an afternoon.",
  },
  {
    name: "David Kim",
    role: "Data Scientist",
    avatar: "DK",
    text: "The AI recommendations are surprisingly accurate. I found a course on MLOps that I didn't know I needed, and it was exactly what I was looking for.",
  },
];

export function Community() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* stats */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold tracking-tight text-emerald-600">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* testimonials */}
        <h2 className="text-2xl font-bold tracking-tight text-center mb-10">
          Trusted by learners and creators
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{t.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
