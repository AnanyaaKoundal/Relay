import Link from "next/link";
import { Users, Layout, DollarSign, HeartHandshake } from "lucide-react";

const perks = [
  { icon: Users, text: "Reach thousands of learners worldwide" },
  { icon: Layout, text: "Organize content with a powerful editor" },
  { icon: DollarSign, text: "Earn revenue from your knowledge" },
  { icon: HeartHandshake, text: "Build a community around your courses" },
];

export function InstructorCTA() {
  return (
    <section className="border-y bg-muted/30 py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Become an instructor</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
          Turn your expertise into a course. We provide the tools, you provide the knowledge.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 max-w-xl mx-auto text-left">
          {perks.map((p) => (
            <div key={p.text} className="flex items-center gap-3 text-sm">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <p.icon className="size-4" />
              </div>
              <span>{p.text}</span>
            </div>
          ))}
        </div>
        <Link
          href="/signup?role=instructor"
          className="mt-10 inline-flex h-11 items-center rounded-xl bg-emerald-600 px-8 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-all duration-200"
        >
          Start teaching today
        </Link>
      </div>
    </section>
  );
}
