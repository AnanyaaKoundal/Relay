"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/services/course.service";

export default function StudioNewCoursePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);

    if (isPaid) {
      const price = form.get("price") as string;
      if (!price || Number(price) <= 0) {
        setError("Please enter a price for the paid course");
        return;
      }
    }

    const data = {
      title: (form.get("title") as string).trim(),
      description: (form.get("description") as string).trim(),
      category: (form.get("category") as string).trim() || undefined,
      difficulty: (form.get("difficulty") as string) || undefined,
      price: isPaid ? Number(form.get("price")) : 0,
    };

    if (!data.title || !data.description) {
      setError("Title and description are required");
      return;
    }

    setLoading(true);
    try {
      const course = await createCourse(data);
      router.push(`/studio/courses/${course.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-semibold">Create Course</h1>
      <p className="mt-1 text-sm text-muted-foreground">Set up the basics for your new course.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
          <input id="title" name="title" required maxLength={200} placeholder="e.g. React Fundamentals" className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="short" className="text-sm font-medium">Short Description <span className="text-red-500">*</span></label>
          <textarea id="short" name="description" rows={3} required maxLength={5000} placeholder="What will students learn?" className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="text-sm font-medium">Category</label>
            <input id="category" name="category" placeholder="e.g. Web Development" className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="difficulty" className="text-sm font-medium">Difficulty</label>
            <select id="difficulty" name="difficulty" className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Free or Paid</label>
            <select
              className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={isPaid ? "paid" : "free"}
              onChange={(e) => setIsPaid(e.target.value === "paid")}
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label htmlFor="price" className="text-sm font-medium">Price ($)</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={!isPaid}
              className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="topics" className="text-sm font-medium">Topics / Skills</label>
            <input id="topics" name="topics" placeholder="e.g. React, TypeScript" className="mt-1 block w-full rounded-lg border px-3 py-2 outline-none text-sm focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="language" className="text-sm font-medium">Language</label>
            <input id="language" name="language" defaultValue="English" className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50 transition-colors">
            {loading ? "Creating..." : "Create Course"}
          </button>
          <button type="button" onClick={() => router.back()} className="inline-flex h-10 items-center rounded-lg px-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
