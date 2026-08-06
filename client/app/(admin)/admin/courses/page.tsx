"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { AdminCourse } from "@/types/admin.types";
import { listCourses } from "@/services/admin.service";
import { CourseFilters } from "@/components/admin/courses/course-filters";
import { CourseTable } from "@/components/admin/courses/course-table";
import { CourseDetailDrawer } from "@/components/admin/courses/course-detail-drawer";
import { Pagination } from "@/components/admin/users/pagination";

export default function AdminCoursesPage() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listCourses({ search, status, page });
      setCourses(result.courses);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch {
      setCourses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Courses</h2>
        <p className="text-sm text-muted-foreground">
          {total > 0 ? `${total} total courses` : "Manage platform courses."}
        </p>
      </div>

      <CourseFilters />

      {loading ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Loading courses...</p>
        </div>
      ) : (
        <>
          <CourseTable courses={courses} onSelectCourse={setSelectedCourseId} />
          <Pagination page={page} totalPages={totalPages} />
        </>
      )}

      <CourseDetailDrawer
        courseId={selectedCourseId}
        onClose={() => setSelectedCourseId(null)}
        onCourseUpdated={fetchCourses}
      />
    </div>
  );
}
