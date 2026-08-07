"use client";

import { useEffect, useState } from "react";
import { getMyBalance } from "@/services/studio.service";
import type { InstructorBalance } from "@/types/studio.types";
import { formatINR } from "@/lib/studio-utils";
import { Wallet, ArrowDownRight, Clock } from "lucide-react";

export function BalanceCard({ onRequestPayout }: { onRequestPayout: () => void }) {
  const [balance, setBalance] = useState<InstructorBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBalance()
      .then(setBalance)
      .catch(() => setBalance({ pendingBalance: 0, totalEarned: 0, lastPayoutAt: null }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="mt-3 h-8 w-32 bg-muted rounded" />
      </div>
    );
  }

  const withdrawn = (balance?.totalEarned ?? 0) - (balance?.pendingBalance ?? 0);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Balance</h3>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Lifetime</span>
        </div>
        <button
          onClick={onRequestPayout}
          disabled={!balance || balance.pendingBalance <= 0}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowDownRight className="size-3" />
          Request Payout
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Available to withdraw</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatINR(balance?.pendingBalance ?? 0)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total earned</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatINR(balance?.totalEarned ?? 0)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Withdrawn</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatINR(withdrawn)}</p>
        </div>
      </div>

      {balance?.lastPayoutAt && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" />
          Last payout: {new Date(balance.lastPayoutAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
