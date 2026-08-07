"use client";

import { useState } from "react";
import { requestPayout } from "@/services/studio.service";
import { Textarea } from "@/components/ui/textarea";

export function PayoutRequestDrawer({
  open,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!accountNumber || !ifscCode || !bankName || !accountHolderName) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await requestPayout({ accountNumber, ifscCode, bankName, accountHolderName });
      setAccountNumber("");
      setIfscCode("");
      setBankName("");
      setAccountHolderName("");
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-background border-l shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold">Request Payout</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-muted-foreground">
            Enter your bank details. The admin will manually transfer the amount to this account.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Account Holder Name</label>
              <input
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="John Doe"
                className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Account Number</label>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="1234567890"
                className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">IFSC Code</label>
              <input
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="SBIN0001234"
                className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Bank Name</label>
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="State Bank of India"
                className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50 transition-colors"
          >
            {loading ? "Submitting..." : "Submit Payout Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
