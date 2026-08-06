"use client";

import { Users, BookOpen, CreditCard, TrendingUp } from "lucide-react";

const stats = [
  { label: "Total Users", value: "—", icon: Users, description: "All registered users" },
  { label: "Total Courses", value: "—", icon: BookOpen, description: "Published + draft" },
  { label: "Total Revenue", value: "—", icon: CreditCard, description: "Platform earnings" },
  { label: "Active Instructors", value: "—", icon: TrendingUp, description: "With published courses" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Platform overview and key metrics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-sm font-semibold">Recent Activity</h3>
        <p className="mt-2 text-sm text-muted-foreground">Activity feed coming soon.</p>
      </div>
    </div>
  );
}
