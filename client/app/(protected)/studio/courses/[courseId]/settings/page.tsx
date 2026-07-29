"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import * as courseApi from "@/services/course.service";
import type { CourseDetail } from "@/types/course.types";
import { Spinner } from "@/components/shared/spinner";
import { ArrowLeft, Save } from "lucide-react";

export default function CourseSettingsPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    if (!params?.courseId) return;
    courseApi.getCourseWorkspace(params.courseId).then((course) => {
      setTitle(course.title);
      setDescription(course.description);
      setIsPaid(Number(course.price) > 0);
      setPrice(String(Number(course.price) || ""));
      setCategory(course.category ?? "");
      setDifficulty(course.difficulty ?? "BEGINNER");
      setThumbnailUrl(course.thumbnailUrl ?? "");
    }).catch(() => {
      setError("Failed to load course");
    }).finally(() => {
      setLoading(false);
    });
  }, [params?.courseId]);

  async function handleSave() {
    setError("");
    if (!title.trim()) { setError("Title is required"); return; }
    if (isPaid && (!price || Number(price) <= 0)) { setError("Enter a price for paid courses"); return; }

    setSaving(true);
    setSaved(false);
    try {
      await courseApi.updateCourse(params.courseId!, {
        title: title.trim(),
        description: description.trim(),
        price: isPaid ? Number(price) : 0,
        category: category || undefined,
        difficulty: difficulty || undefined,
        thumbnailUrl: thumbnailUrl || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-muted-foreground text-sm gap-2">
        <Spinner />
        Loading settings...
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="py-12 text-center text-sm text-red-500">
        {error}.{" "}
        <Link href={`/studio/courses/${params.courseId}/edit`} className="text-primary underline">
          Back to course
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/studio/courses/${params.courseId}/edit`}
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-lg font-semibold">Course Settings</h1>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-emerald-600">Saved</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            <Save className="size-3.5" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-5">
        <div>
          <label htmlFor="s-title" className="text-xs font-medium text-muted-foreground">Title</label>
          <input
            id="s-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="s-desc" className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea
            id="s-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div className="border-t pt-4">
          <h2 className="text-sm font-medium mb-3">Pricing</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <select
                className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                value={isPaid ? "paid" : "free"}
                onChange={(e) => {
                  setIsPaid(e.target.value === "paid");
                  if (e.target.value === "free") setPrice("");
                }}
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label htmlFor="s-price" className="text-xs font-medium text-muted-foreground">Price ($)</label>
              <input
                id="s-price"
                type="number"
                min="0"
                step="0.01"
                value={isPaid ? price : "0"}
                disabled={!isPaid}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-sm font-medium mb-3">Metadata</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="s-category" className="text-xs font-medium text-muted-foreground">Category</label>
              <input
                id="s-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Web Development"
                className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="s-difficulty" className="text-xs font-medium text-muted-foreground">Difficulty</label>
              <select
                id="s-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-sm font-medium mb-3">Thumbnail</h2>
          <div>
            <label htmlFor="s-thumb" className="text-xs font-medium text-muted-foreground">Image URL</label>
            <input
              id="s-thumb"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
