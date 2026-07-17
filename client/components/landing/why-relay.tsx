import { FileText, Layers, MessageCircle, Sparkles, LineChart } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Creator-first publishing",
    description:
      "A streamlined editor designed for structured content. Publish courses with chapters, lessons, quizzes and downloadable resources — all from a single dashboard.",
  },
  {
    icon: Layers,
    title: "Structured content organization",
    description:
      "Courses are organized into chapters and lessons so learners can track their progress and instructors can build logical learning paths.",
  },
  {
    icon: MessageCircle,
    title: "Real-time discussions",
    description:
      "Each lesson has its own discussion thread. Learners can ask questions and instructors can answer — all visible to the class.",
  },
  {
    icon: Sparkles,
    title: "AI-powered recommendations",
    description:
      "Smart suggestions based on your learning history and goals. Discover courses you didn't know you needed.",
  },
  {
    icon: LineChart,
    title: "Progress tracking",
    description:
      "Know exactly where you stand. Track completion rates, revisit past lessons, and pick up where you left off.",
  },
];

export function WhyRelay() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Why Relay?</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Built differently for both creators and learners
          </p>
        </div>
        <div className="space-y-12 max-w-3xl mx-auto">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6 ${
                i % 2 === 1 ? "sm:flex-row-reverse text-right sm:text-left" : ""
              }`}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <f.icon className="size-5" />
              </div>
              <div className={i % 2 === 1 ? "sm:text-right" : ""}>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
