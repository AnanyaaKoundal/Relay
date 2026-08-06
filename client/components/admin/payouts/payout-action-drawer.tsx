"use client";

import { useState } from "react";
import type { AdminPayout } from "@/types/admin.types";
import { approvePayout, rejectPayout } from "@/services/admin.service";
import { Textarea } from "@/components/ui/textarea";

export function PayoutActionDrawer({
  payout,
  onClose,
  onPayoutUpdated,
}: {
  payout: AdminPayout | null;
  onClose: () => void;
  onPayoutUpdated: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    if (!payout) return;
    setProcessing(true);
    try {
      await approvePayout(payout.id, notes || undefined);
      setNotes("");
      onPayoutUpdated();
      onClose();
    } catch {
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!payout) return;
    setProcessing(true);
    try {
      await rejectPayout(payout.id, notes || undefined);
      setNotes("");
      onPayoutUpdated();
      onClose();
    } catch {
    } finally {
      setProcessing(false);
    }
  };

  if (!payout) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-background border-l shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold">Payout Request</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              payout.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              payout.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" :
              "bg-rose-50 text-rose-700 border-rose-200"
            }`}>
              {payout.status}
            </span>
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="text-lg font-semibold">₹{payout.amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Instructor</h4>
            <div className="rounded-lg border divide-y text-sm">
              <div className="flex justify-between px-4 py-2">
                <span className="text-muted-foreground">Name</span>
                <span>{payout.instructor.name}</span>
              </div>
              <div className="flex justify-between px-4 py-2">
                <span className="text-muted-foreground">Email</span>
                <span>{payout.instructor.email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Dates</h4>
            <div className="rounded-lg border divide-y text-sm">
              <div className="flex justify-between px-4 py-2">
                <span className="text-muted-foreground">Requested</span>
                <span>{new Date(payout.createdAt).toLocaleString()}</span>
              </div>
              {payout.processedAt && (
                <div className="flex justify-between px-4 py-2">
                  <span className="text-muted-foreground">Processed</span>
                  <span>{new Date(payout.processedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {payout.notes && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Notes</h4>
              <p className="text-sm text-muted-foreground rounded-lg border p-3">{payout.notes}</p>
            </div>
          )}

          {payout.status === "PENDING" && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Admin Notes</h4>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes (optional)"
                rows={2}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="flex-1 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Reject"}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Approve & Pay"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
