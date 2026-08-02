import type { FilterTab } from "./types";

export type CourseTab = {
  label: string;
  value: FilterTab;
  count: number;
};

export function CourseTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: CourseTab[];
  active: FilterTab;
  onChange: (value: FilterTab) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors ${
            active === tab.value
              ? "border-primary text-foreground font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              active === tab.value
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
