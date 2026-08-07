"use client";

import { useState, useEffect } from "react";
import type { AdminCourseDetail } from "@/types/admin.types";
import { getCourseDetail, deleteCourse } from "@/services/admin.service";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { X, Trash2, ExternalLink } from "lucide-react";

type CourseDetailDrawerProps = {
  courseId: string | null;
  onClose: () => void;
  onCourseUpdated: () => void;
};

export function CourseDetailDrawer({ courseId, onClose, onCourseUpdated }: CourseDetailDrawerProps) {
  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    getCourseDetail(courseId)
      .then(setCourse)
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleDelete = async () => {
    if (!course) return;
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await deleteCourse(course.id);
      onCourseUpdated();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete course");
    } finally {
      setActionLoading(false);
    }
  };

  if (!courseId) return null;

  return (
    <>
      {courseId && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      )}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-lg border-l bg-card shadow-xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-6 py-4">
          <h2 className="text-sm font-semibold">Course Details</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : course ? (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="size-16 shrink-0 rounded-lg bg-muted" />
              <div className="min-w-0">
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="text-sm text-muted-foreground">by {course.instructor.name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={course.status} />
                  {course.category && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {course.category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="text-lg font-semibold"><PriceDisplay price={course.price} /></p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Enrolled</p>
                <p className="text-lg font-semibold">{course.enrollmentCount}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-lg font-semibold">₹{course.revenue.toLocaleString()}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground line-clamp-4">{course.description}</p>
            </div>

            {/* Chapters */}
            {course.chapters.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Chapters ({course.chapters.length})</h4>
                <div className="space-y-2">
                  {course.chapters.map((ch) => (
                    <div key={ch.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{ch.title}</p>
                        <p className="text-xs text-muted-foreground">{ch.lessonCount} lessons</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={actionLoading || course.enrollmentCount > 0}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            </div>

            {course.enrollmentCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Cannot delete — course has enrollments. Set status to Draft to hide from catalog.
              </p>
            )}

            <div className="text-xs text-muted-foreground">
              Created {new Date(course.createdAt).toLocaleDateString()} · 
              {course.publishedAt ? ` Published ${new Date(course.publishedAt).toLocaleDateString()}` : " Not published"}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">Course not found.</p>
          </div>
        )}
      </div>
    </>
  );
}
