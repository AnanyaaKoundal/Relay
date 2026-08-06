"use client";

import { useState } from "react";
import type { AdminCategory } from "@/types/admin.types";
import { createCategory, updateCategory, deleteCategory } from "@/services/admin.service";
import { Plus, Pencil, Trash2, X } from "lucide-react";

type CategoryManagerProps = {
  categories: AdminCategory[];
  onUpdated: () => void;
};

export function CategoryManager({ categories, onUpdated }: CategoryManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (editingId) {
        await updateCategory(editingId, { name });
      } else {
        await createCategory({ name });
      }
      setShowForm(false);
      setEditingId(null);
      setName("");
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: AdminCategory) => {
    setEditingId(cat.id);
    setName(cat.name);
    setShowForm(true);
  };

  const handleDelete = async (cat: AdminCategory) => {
    if (!confirm(`Delete "${cat.name}"? ${cat.courseCount > 0 ? `${cat.courseCount} courses use this category.` : ""}`)) return;
    try {
      await deleteCategory(cat.id);
      onUpdated();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setError("");
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-medium">Categories</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-3" />
            Add
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-b px-4 py-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="flex-1 h-8 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </form>
      )}

      <div className="divide-y">
        {categories.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No categories yet.
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.courseCount} courses · {cat.slug}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(cat)}
                  className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
