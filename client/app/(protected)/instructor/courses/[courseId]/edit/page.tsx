"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCourse, updateCourse } from "@/services/course.service";

export default function EditCoursePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [price, setPrice] = useState("0");
  const [status, setStatus] = useState("DRAFT");

  useEffect(() => {
    if (!params?.courseId) return;
    getCourse(params.courseId)
      .then((course) => {
        setTitle(course.title);
        setDescription(course.description);
        setCategory(course.category ?? "");
        setDifficulty(course.difficulty ?? "BEGINNER");
        setPrice(String(course.price));
        setStatus(course.status);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params?.courseId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateCourse(params!.courseId, {
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || undefined,
        difficulty: difficulty || undefined,
        price: price ? Number(price) : undefined,
        status: status as any,
      });
      router.push(`/instructor/courses/${params!.courseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">Loading...</div>;
  }

  if (notFound) {
    return <div className="mx-auto max-w-2xl py-12 text-center"><p className="text-sm text-red-500">Course not found.</p><Link href="/instructor/courses" className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">Back to Courses</Link></div>;
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Link href={`/instructor/courses/${params!.courseId}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back to Course</Link>
      <h1 className="mt-2 text-2xl font-semibold">Edit Course</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="title" className="text-sm font-medium">Title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="text-sm font-medium">Category</label>
            <input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Web Development" className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label htmlFor="difficulty" className="text-sm font-medium">Difficulty</label>
            <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <div>
            <label htmlFor="price" className="text-sm font-medium">Price ($)</label>
            <input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary">
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="PUBLISHED">Published</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.push(`/instructor/courses/${params!.courseId}`)} className="inline-flex h-10 items-center rounded-lg px-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
