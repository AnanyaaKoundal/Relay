"use client";

import { useState, useEffect } from "react";
import { getDashboardStats, getAnalytics, type DashboardStats, type AnalyticsData } from "@/services/admin.service";
import { Users, BookOpen, CreditCard, TrendingUp, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

const COUNTRY_NAMES: Record<string, string> = {
  IN: "India", GB: "UK", US: "US", CA: "Canada",
  AU: "Australia", SG: "Singapore", DE: "Germany", FR: "France",
  AE: "UAE", JP: "Japan", BR: "Brazil", ZA: "South Africa",
};

const RANGES = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "1Y", value: "1y" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    setLoading(true);
    Promise.all([getDashboardStats(), getAnalytics(range)])
      .then(([s, a]) => { setStats(s); setAnalytics(a); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats || !analytics) return null;

  const kpis = [
    { label: "Total Users", value: stats.kpis.totalUsers.toLocaleString(), icon: Users, description: `${stats.roleBreakdown.learners} learners, ${stats.roleBreakdown.instructors} instructors` },
    { label: "Total Courses", value: stats.kpis.totalCourses.toLocaleString(), icon: BookOpen, description: "Published + draft" },
    { label: "Total Revenue", value: `₹${stats.kpis.totalRevenue.toLocaleString()}`, icon: CreditCard, description: "Platform earnings" },
    { label: "Total Enrollments", value: stats.kpis.totalEnrollments.toLocaleString(), icon: TrendingUp, description: "All time" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Platform overview and key metrics.</p>
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                range === r.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((stat) => {
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

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">Revenue Trend</h3>
          {analytics.revenueByDay.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No revenue data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#0F766E" strokeWidth={2} dot={{ r: 3, fill: "#0F766E" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Geographic Distribution */}
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">Geographic Distribution</h3>
          {analytics.geoDistribution.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No geo data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.geoDistribution.map((g) => ({ ...g, name: COUNTRY_NAMES[g.country] || g.country }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "revenue" ? `₹${Number(value).toLocaleString()}` : value,
                    name === "revenue" ? "Revenue" : "Enrollments",
                  ]}
                />
                <Bar dataKey="enrollments" fill="#0F766E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Instructors */}
        <div className="rounded-xl border bg-card">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Top Instructors</h3>
          </div>
          <div className="divide-y max-h-80 overflow-y-auto">
            {analytics.topInstructors.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No instructor data</p>
            ) : (
              analytics.topInstructors.map((instructor, i) => (
                <div key={instructor.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs font-medium text-muted-foreground w-5">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{instructor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {instructor.courseCount} courses · {instructor.students} students
                    </p>
                  </div>
                  <p className="text-sm font-medium">₹{instructor.revenue.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Courses */}
        <div className="rounded-xl border bg-card">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Top Courses</h3>
          </div>
          <div className="divide-y max-h-80 overflow-y-auto">
            {analytics.topCourses.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No course data</p>
            ) : (
              analytics.topCourses.map((course, i) => (
                <div key={course.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs font-medium text-muted-foreground w-5">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.instructor} · {course.enrollments} enrolled
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₹{course.revenue.toLocaleString()}</p>
                    <p className={`text-xs ${course.status === "PUBLISHED" ? "text-green-600" : "text-muted-foreground"}`}>
                      {course.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Recent Enrollments</h3>
        </div>
        <div className="divide-y">
          {stats.recentEnrollments.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No enrollments yet</p>
          ) : (
            stats.recentEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{enrollment.student}</p>
                  <p className="text-xs text-muted-foreground truncate">{enrollment.course}</p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium">₹{enrollment.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(enrollment.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}