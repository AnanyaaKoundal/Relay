"use client";

import { useEffect, useState } from "react";
import { getMyPayouts } from "@/services/studio.service";
import type { InstructorPayout } from "@/types/studio.types";
import { formatINR } from "@/lib/studio-utils";
import { ChevronDown, ChevronUp } from "lucide-react";

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
};

export function PayoutHistory() {
  const [payouts, setPayouts] = useState<InstructorPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    getMyPayouts()
      .then((res) => setPayouts(res.payouts))
      .catch(() => setPayouts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded" />
      </div>
    );
  }

  if (payouts.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <h3 className="text-sm font-medium">Payout History</h3>
          <p className="text-xs text-muted-foreground">{payouts.length} payout requests</p>
        </div>
        {expanded ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-5 py-2.5 font-medium">Amount</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">Requested</th>
                <th className="px-5 py-2.5 font-medium">Processed</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-b last:border-b-0">
                  <td className="px-5 py-2.5 font-medium">{formatINR(p.amount)}</td>
                  <td className="px-5 py-2.5">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[p.status] ?? ""}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-2.5 text-muted-foreground">
                    {p.processedAt ? new Date(p.processedAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
