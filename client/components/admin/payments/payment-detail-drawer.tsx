"use client";

import { useEffect, useState } from "react";
import type { AdminPaymentDetail } from "@/types/admin.types";
import { getPaymentDetail, refundPayment } from "@/services/admin.service";
import { Textarea } from "@/components/ui/textarea";

const statusStyles: Record<string, string> = {
  SUCCEEDED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  REFUNDED: "bg-rose-50 text-rose-700 border-rose-200",
  FAILED: "bg-gray-50 text-gray-700 border-gray-200",
};

export function PaymentDetailDrawer({
  paymentId,
  onClose,
  onPaymentUpdated,
}: {
  paymentId: string | null;
  onClose: () => void;
  onPaymentUpdated: () => void;
}) {
  const [payment, setPayment] = useState<AdminPaymentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      setPayment(null);
      return;
    }
    setLoading(true);
    getPaymentDetail(paymentId)
      .then(setPayment)
      .catch(() => setPayment(null))
      .finally(() => setLoading(false));
  }, [paymentId]);

  const handleRefund = async () => {
    if (!paymentId) return;
    setRefunding(true);
    try {
      await refundPayment(paymentId, refundReason || undefined);
      const updated = await getPaymentDetail(paymentId);
      setPayment(updated);
      setRefundReason("");
      onPaymentUpdated();
    } catch {
    } finally {
      setRefunding(false);
    }
  };

  if (!paymentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-background border-l shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold">Payment Details</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Loading...</div>
        ) : !payment ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Payment not found.</div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[payment.status] ?? ""}`}>
                {payment.status}
              </span>
              <span className="text-sm text-muted-foreground">{payment.gateway}</span>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{payment.subtotal.toLocaleString()}</span>
              </div>
              {payment.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-emerald-600">-₹{payment.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{payment.taxAmount.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-medium">
                <span>Total</span>
                <span>₹{payment.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Transaction</h4>
              <div className="rounded-lg border divide-y text-sm">
                <div className="flex justify-between px-4 py-2">
                  <span className="text-muted-foreground">Gateway ID</span>
                  <span className="font-mono text-xs">{payment.gatewayTransactionId}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(payment.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Buyer</h4>
              <div className="rounded-lg border divide-y text-sm">
                <div className="flex justify-between px-4 py-2">
                  <span className="text-muted-foreground">Name</span>
                  <span>{payment.user.name}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-muted-foreground">Email</span>
                  <span>{payment.user.email}</span>
                </div>
              </div>
            </div>

            {payment.enrollment && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Course</h4>
                <div className="rounded-lg border divide-y text-sm">
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-muted-foreground">Title</span>
                    <span>{payment.enrollment.course.title}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-muted-foreground">Instructor</span>
                    <span>{payment.enrollment.course.instructor.name}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-muted-foreground">Price</span>
                    <span>₹{payment.enrollment.course.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {payment.status === "SUCCEEDED" && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Refund</h4>
                <Textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Reason for refund (optional)"
                  rows={2}
                />
                <button
                  onClick={handleRefund}
                  disabled={refunding}
                  className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {refunding ? "Processing..." : "Refund Payment"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
