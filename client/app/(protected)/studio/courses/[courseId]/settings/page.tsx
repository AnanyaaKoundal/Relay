"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as courseApi from "@/services/course.service";
import { Spinner } from "@/components/shared/spinner";
import { DetailsTab } from "@/components/studio/settings/details-tab";
import { PricingTab } from "@/components/studio/settings/pricing-tab";
import { CouponsTab } from "@/components/studio/settings/coupons-tab";
import { ArrowLeft, Save } from "lucide-react";

type Tab = "details" | "pricing" | "coupons";

const TABS: { key: Tab; label: string }[] = [
  { key: "details", label: "Details" },
  { key: "pricing", label: "Pricing" },
  { key: "coupons", label: "Coupons" },
];

export default function CourseSettingsPage() {
  const params = useParams<{ courseId: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("details");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (!params?.courseId) return;
    courseApi.getCourseWorkspace(params.courseId).then((course) => {
      setTitle(course.title);
      setDescription(course.description);
      setIsPaid(Number(course.price) > 0);
      setPrice(String(Number(course.price) || ""));
      setCategory(course.category ?? "");
      setDifficulty(course.difficulty ?? "BEGINNER");
      setBannerUrl(course.bannerUrl ?? "");
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
        bannerUrl: bannerUrl || null,
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
          {saved && <span className="text-xs text-emerald-600">Saved</span>}
          {tab !== "coupons" && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              <Save className="size-3.5" />
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-5">
        {error && <p className="text-sm text-red-500">{error}</p>}

        {tab === "details" && (
          <DetailsTab
            courseId={params.courseId!}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            category={category}
            setCategory={setCategory}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            bannerUrl={bannerUrl}
            setBannerUrl={setBannerUrl}
          />
        )}

        {tab === "pricing" && (
          <PricingTab
            isPaid={isPaid}
            setIsPaid={setIsPaid}
            price={price}
            setPrice={setPrice}
          />
        )}

        {tab === "coupons" && (
          <CouponsTab courseId={params.courseId!} />
        )}
      </div>
    </div>
  );
}
