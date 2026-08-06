"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { UserDetail } from "@/types/admin.types";
import { getUserDetail, updateUserStatus, updateUserRole } from "@/services/admin.service";
import { RoleBadge } from "@/components/admin/users/role-badge";
import { StatusBadge } from "@/components/admin/users/status-badge";
import { ArrowLeft, Ban, CheckCircle, Shield, ShieldOff } from "lucide-react";

type Tab = "overview" | "courses" | "enrollments" | "payments";

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserDetail(userId);
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleToggleBan = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const newStatus = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";
      await updateUserStatus(user.id, newStatus);
      setUser({ ...user, status: newStatus });
    } catch {
      // revert
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAdmin = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await updateUserRole(user.id, { isAdmin: !user.isAdmin });
      setUser({ ...user, isAdmin: !user.isAdmin });
    } catch {
      // revert
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleInstructor = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await updateUserRole(user.id, { isInstructor: !user.isInstructor });
      setUser({ ...user, isInstructor: !user.isInstructor });
    } catch {
      // revert
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Loading user...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to users
        </button>
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">User not found.</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "courses", label: "Courses", count: user.courseCount },
    { id: "enrollments", label: "Enrollments", count: user.enrollmentCount },
    { id: "payments", label: "Payments", count: user.paymentCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <RoleBadge isAdmin={user.isAdmin} isInstructor={user.isInstructor} />
              <StatusBadge status={user.status} />
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleBan}
            disabled={actionLoading}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              user.status === "BANNED"
                ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            } disabled:opacity-50`}
          >
            {user.status === "BANNED" ? (
              <><CheckCircle className="size-4" /> Unban</>
            ) : (
              <><Ban className="size-4" /> Ban</>
            )}
          </button>
          <button
            onClick={handleToggleAdmin}
            disabled={actionLoading}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              user.isAdmin
                ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            } disabled:opacity-50`}
          >
            {user.isAdmin ? (
              <><ShieldOff className="size-4" /> Remove Admin</>
            ) : (
              <><Shield className="size-4" /> Make Admin</>
            )}
          </button>
          <button
            onClick={handleToggleInstructor}
            disabled={actionLoading}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              user.isInstructor
                ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                : "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
            } disabled:opacity-50`}
          >
            {user.isInstructor ? "Remove Instructor" : "Make Instructor"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="mt-1 text-2xl font-bold">₹{user.totalSpent.toLocaleString()}</p>
            </div>
            {user.isInstructor && (
              <div className="rounded-xl border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="mt-1 text-2xl font-bold">₹{user.totalEarned.toLocaleString()}</p>
              </div>
            )}
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">Courses</p>
              <p className="mt-1 text-2xl font-bold">{user.courseCount}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">Enrollments</p>
              <p className="mt-1 text-2xl font-bold">{user.enrollmentCount}</p>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-sm font-medium mb-4">Account Info</h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="text-sm">{user.phone ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Joined</dt>
                <dd className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Last Updated</dt>
                <dd className="text-sm">{new Date(user.updatedAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === "courses" && (
        <div className="space-y-4">
          {user.courses.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">No courses yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {user.courses.map((course) => (
                <div key={course.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                  <div className="size-16 shrink-0 rounded-lg bg-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate underline decoration-muted-foreground/30 underline-offset-2 hover:decoration-foreground/50 transition-colors cursor-pointer">
                      {course.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ₹{course.price.toLocaleString()} · {course.enrollmentCount} enrolled · {course.status}
                    </p>
                  </div>
                  {user.isInstructor && (
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{course.earnings.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">earned</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "enrollments" && (
        <div className="space-y-4">
          {user.enrollments.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">No enrollments yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {user.enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                  <div className="size-16 shrink-0 rounded-lg bg-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{enrollment.course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {enrollment.progressPercent}% complete · {enrollment.status}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "payments" && (
        <div className="space-y-4">
          {user.payments.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">No payments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {user.payments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium">₹{Number(payment.totalAmount).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                          payment.status === "SUCCEEDED"
                            ? "bg-green-50 text-green-700"
                            : payment.status === "REFUNDED"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-gray-50 text-gray-700"
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
