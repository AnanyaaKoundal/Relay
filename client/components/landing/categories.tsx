import {
  Code2,
  Palette,
  Briefcase,
  Brain,
  Megaphone,
  BarChart3,
  Camera,
} from "lucide-react";

const categories = [
  { icon: Code2, label: "Development", count: 24 },
  { icon: Palette, label: "Design", count: 18 },
  { icon: Briefcase, label: "Business", count: 15 },
  { icon: Brain, label: "AI", count: 12 },
  { icon: Megaphone, label: "Marketing", count: 10 },
  { icon: BarChart3, label: "Data Science", count: 14 },
  { icon: Camera, label: "Photography", count: 8 },
];

export function Categories() {
  return (
    <section className="border-y bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-2xl font-bold tracking-tight mb-8">Explore by category</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 snap-x">
          {categories.map((cat) => (
            <button
              key={cat.label}
              className="flex shrink-0 flex-col items-start gap-2 rounded-xl border bg-card p-5 min-w-[140px] snap-start hover:border-emerald-200 hover:shadow-sm transition-all duration-200 text-left"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <cat.icon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{cat.label}</p>
                <p className="text-xs text-muted-foreground">{cat.count} courses</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
