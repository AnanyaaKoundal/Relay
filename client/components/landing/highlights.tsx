import { BookOpen, MessageCircle, Sparkles, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: BookOpen,
    title: "Structured Learning",
    description: "Courses organized into chapters and lessons for a clear path from start to finish.",
  },
  {
    icon: MessageCircle,
    title: "Interactive Discussions",
    description: "Ask questions and get answers directly within each lesson.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted Discovery",
    description: "Find the right course with intelligent recommendations tailored to you.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Creators",
    description: "Every instructor is reviewed to ensure high-quality content.",
  },
];

export function Highlights() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-emerald-600">
                <item.icon className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
