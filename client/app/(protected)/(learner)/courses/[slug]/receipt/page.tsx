"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPayment } from "@/services/payment.service";
import { CheckCircle2, Loader2, ArrowRight, Calendar, Hash, MapPin } from "lucide-react";
import { PaymentDetail } from "@/types/payment.types";

export default function ReceiptPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = String(params.slug);
  const paymentId = searchParams.get("paymentId");

  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!paymentId) {
      setError("No payment ID provided");
      setLoading(false);
      return;
    }

    getPayment(paymentId)
      .then(setPayment)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load receipt"))
      .finally(() => setLoading(false));
  }, [paymentId]);

  const currencySymbol = payment?.currency === "INR" ? "₹" : payment?.currency === "USD" ? "$" : "₹";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm gap-2">
        <Loader2 className="size-4 animate-spin" />
        Loading receipt...
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-muted-foreground">{error || "Receipt not found."}</p>
        <Link href="/courses" className="mt-2 text-sm text-primary hover:underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-6 sm:py-12">
      <div className="rounded-xl border bg-card p-6 sm:p-8 space-y-6">
        {/* Success header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="size-6 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold">Payment successful!</h1>
          <p className="text-sm text-muted-foreground">
            You are now enrolled in {payment.course?.title ?? "the course"}.
          </p>
        </div>

        {/* Receipt details */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{currencySymbol}{payment.subtotal.toFixed(2)}</span>
          </div>
          {payment.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-emerald-600">-{currencySymbol}{payment.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{currencySymbol}{payment.taxAmount.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{currencySymbol}{payment.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Transaction info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Hash className="size-3.5" />
            <span className="font-mono text-xs">{payment.gatewayTransactionId}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>{new Date(payment.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-3.5" />
            <span>{payment.billingCountry}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Link
            href={`/courses/${payment.course?.id ?? slug}/learn`}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start Course
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/courses"
            className="flex h-10 w-full items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted transition-colors"
          >
            Back to catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
