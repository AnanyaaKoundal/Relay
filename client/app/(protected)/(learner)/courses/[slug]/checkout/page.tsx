"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPublicCourse } from "@/services/course.service";
import { purchaseCourse, getCountry, type PurchaseResponse } from "@/services/payment.service";
import type { PublicCourseDetail } from "@/types/course.types";
import { Loader2, CreditCard, Lock } from "lucide-react";

const COUNTRIES: Record<string, { name: string; taxName: string; taxRate: number }> = {
  IN: { name: "India", taxName: "GST", taxRate: 18 },
  US: { name: "United States", taxName: "", taxRate: 0 },
  GB: { name: "United Kingdom", taxName: "VAT", taxRate: 20 },
  CA: { name: "Canada", taxName: "HST", taxRate: 13 },
  AU: { name: "Australia", taxName: "GST", taxRate: 10 },
  SG: { name: "Singapore", taxName: "GST", taxRate: 9 },
  DE: { name: "Germany", taxName: "VAT", taxRate: 19 },
  FR: { name: "France", taxName: "VAT", taxRate: 20 },
  AE: { name: "UAE", taxName: "VAT", taxRate: 5 },
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params.slug);

  const [course, setCourse] = useState<PublicCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("IN");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    getPublicCourse(slug)
      .then(setCourse)
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    getCountry()
      .then((data) => {
        // Only auto-select if the detected country is in our tax map
        if (data.country && COUNTRIES[data.country]) {
          setCountry(data.country);
        }
      })
      .catch(() => {
        // Silently fall back to default "IN"
      });
  }, []);

  const taxRate = COUNTRIES[country]?.taxRate ?? 0;
  const subtotal = course ? Number(course.price) : 0;
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

  const formatPrice = (amount: number) => `₹${amount.toFixed(2)}`;

  async function handlePay() {
    if (!course) return;

    if (!cardNumber.trim() || !expiry.trim() || !cvc.trim()) {
      setError("Please fill in all card details");
      return;
    }

    setError("");
    setPaying(true);

    try {
      const result: PurchaseResponse = await purchaseCourse({
        courseId: course.id,
        billingCountry: country,
        subtotal,
        taxAmount,
        totalAmount,
      });

      router.push(`/courses/${slug}/receipt?paymentId=${result.payment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm gap-2">
        <Loader2 className="size-4 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-muted-foreground">Course not found.</p>
        <Link href="/courses" className="mt-2 text-sm text-primary hover:underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  const totalLessons = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
      <Link
        href={`/courses/${slug}`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Back to course
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_380px]">
        {/* Left — payment form */}
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold">Checkout</h1>
            <p className="text-sm text-muted-foreground mt-1">Complete your purchase</p>
          </div>

          {/* Price breakdown */}
          <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{COUNTRIES[country]?.taxName ?? "Tax"} ({taxRate}%)</span>
                <span>{formatPrice(taxAmount)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
          </div>

          {/* Card details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="size-4" />
              Card details
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Card number</label>
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Expiry</label>
                <input
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">CVC</label>
                <input
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="123"
                  className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="button"
            onClick={handlePay}
            disabled={paying}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {paying ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Lock className="size-4" />
            )}
            {paying ? "Processing..." : `Pay ${formatPrice(totalAmount)}`}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Mock payment — no real charges. Any card details work.
          </p>
        </div>

        {/* Right — order summary */}
        <div className="md:sticky md:top-20 md:self-start">
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={course.thumbnailUrl || "/thumbnail.avif"}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
            <h3 className="font-semibold leading-tight">{course.title}</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>by {course.instructor?.name ?? "Unknown"}</p>
              <p>{totalLessons} lessons</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
