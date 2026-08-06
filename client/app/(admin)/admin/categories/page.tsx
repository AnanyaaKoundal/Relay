"use client";

import { useState, useEffect, useCallback } from "react";
import type { AdminCategory } from "@/types/admin.types";
import { listCategories } from "@/services/admin.service";
import { CategoryManager } from "@/components/admin/categories/category-manager";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listCategories();
      setCategories(result.categories);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Categories</h2>
        <p className="text-sm text-muted-foreground">Manage course categories.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        </div>
      ) : (
        <CategoryManager categories={categories} onUpdated={fetchCategories} />
      )}
    </div>
  );
}
