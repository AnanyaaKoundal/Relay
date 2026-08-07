"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UserDetail } from "@/types/admin.types";
import { getUserDetail, updateUserStatus, updateUserRole } from "@/services/admin.service";
import { RoleBadge } from "./role-badge";
import { StatusBadge } from "./status-badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { X, Ban, CheckCircle, Shield, ShieldOff, ExternalLink } from "lucide-react";

type UserDetailDrawerProps = {
  userId: string | null;
  onClose: () => void;
  onUserUpdated: () => void;
};

export function UserDetailDrawer({ userId, onClose, onUserUpdated }: UserDetailDrawerProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getUserDetail(userId)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleToggleBan = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const newStatus = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";
      await updateUserStatus(user.id, newStatus);
      setUser({ ...user, status: newStatus });
      onUserUpdated();
    } catch {
      // revert handled by not updating
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
      onUserUpdated();
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
      onUserUpdated();
    } catch {
      // revert
    } finally {
      setActionLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <>
      {userId && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      )}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-lg border-l bg-card shadow-xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-6 py-4">
          <h2 className="text-sm font-semibold">User Details</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : user ? (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.phone && (
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <RoleBadge isAdmin={user.isAdmin} isInstructor={user.isInstructor} />
                  <StatusBadge status={user.status} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Enrolled</p>
                <p className="text-lg font-semibold">{user.enrollmentCount}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Courses</p>
                <p className="text-lg font-semibold">{user.courseCount}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Spent</p>
                <p className="text-lg font-semibold">₹{user.totalSpent.toLocaleString()}</p>
              </div>
            </div>

            {/* View full profile link */}
            <button
              onClick={() => {
                router.push(`/admin/users/${user.id}`);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <ExternalLink className="size-4" />
              View full profile
            </button>

            {/* Actions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Actions</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleToggleBan}
                  disabled={actionLoading}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    user.status === "BANNED"
                      ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                      : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  } disabled:opacity-50`}
                >
                  {user.status === "BANNED" ? (
                    <><CheckCircle className="size-4" /> Unban</>
                  ) : (
                    <><Ban className="size-4" /> Ban User</>
                  )}
                </button>
                <button
                  onClick={handleToggleAdmin}
                  disabled={actionLoading}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
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
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    user.isInstructor
                      ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                      : "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
                  } disabled:opacity-50`}
                >
                  {user.isInstructor ? "Remove Instructor" : "Make Instructor"}
                </button>
              </div>
            </div>

            {/* Recent Enrollments */}
            {user.enrollments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Enrollments</h4>
                <div className="space-y-2">
                  {user.enrollments.slice(0, 5).map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{e.course.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.progressPercent}% complete · {e.status}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(e.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Payments */}
            {user.payments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Payments</h4>
                <div className="space-y-2">
                  {user.payments.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">₹{Number(p.totalAmount).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{p.status}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Joined {new Date(user.createdAt).toLocaleDateString()} · Last updated {new Date(user.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">User not found.</p>
          </div>
        )}
      </div>
    </>
  );
}
