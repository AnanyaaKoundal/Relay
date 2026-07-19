"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function BecomeInstructorPage() {
  const router = useRouter();
  const { upgradeToInstructor, isInstructor } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isInstructor) {
      router.replace("/studio/overview");
    }
  }, [isInstructor, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const data = {
      headline: (form.get("headline") as string).trim(),
      bio: (form.get("bio") as string).trim() || undefined,
      expertise: (form.get("expertise") as string).trim() || undefined,
      experience: (form.get("experience") as string).trim() || undefined,
      twitter: (form.get("twitter") as string).trim() || undefined,
      linkedin: (form.get("linkedin") as string).trim() || undefined,
      github: (form.get("github") as string).trim() || undefined,
      website: (form.get("website") as string).trim() || undefined,
    };
    if (data.headline.length < 10) {
      setError("Headline must be at least 10 characters");
      return;
    }
    setLoading(true);
    try {
      await upgradeToInstructor(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <h1 className="text-2xl font-semibold">Become an Instructor</h1>
      <p className="mt-1 text-sm text-muted-foreground">Set up your instructor profile. You can edit these details later.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="headline" className="text-sm font-medium">Professional Headline <span className="text-red-500">*</span></label>
          <input id="headline" name="headline" required placeholder="e.g. Full-stack developer & educator" className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="bio" className="text-sm font-medium">Short Bio</label>
          <textarea id="bio" name="bio" rows={3} placeholder="Tell learners about yourself..." className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="expertise" className="text-sm font-medium">Primary Expertise</label>
          <input id="expertise" name="expertise" placeholder="e.g. React, Node.js, Python" className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="experience" className="text-sm font-medium">Years of Experience</label>
          <input id="experience" name="experience" placeholder="e.g. 5+ years in software engineering" className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <fieldset className="border-t pt-5">
          <legend className="text-sm font-medium">Social Links (optional)</legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="linkedin" className="text-xs text-muted-foreground">LinkedIn</label>
              <input id="linkedin" name="linkedin" placeholder="https://linkedin.com/in/..." className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label htmlFor="website" className="text-xs text-muted-foreground">Portfolio / Website</label>
              <input id="website" name="website" placeholder="https://..." className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
        </fieldset>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50 transition-colors">
          {loading ? "Setting up..." : "Start Teaching"}
        </button>
      </form>
    </div>
  );
}
