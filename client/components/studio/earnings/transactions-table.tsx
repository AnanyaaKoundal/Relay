"use client";

import { ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatINR } from "@/lib/studio-utils";
import type { StudioTransaction } from "@/types/studio.types";

type TransactionsTableProps = {
  transactions: StudioTransaction[];
};

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-sm font-medium">Latest transactions</h2>
        <span className="text-xs text-muted-foreground">All-time · latest 8</span>
      </div>

      {transactions.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No transactions yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-3 py-3 font-medium">Course</th>
                <th className="px-3 py-3 font-medium">Coupon</th>
                <th className="px-3 py-3 text-right font-medium">Amount</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Date &amp; time</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((txn) => (
                <tr key={txn.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-5 py-3 font-medium">{txn.studentName}</td>
                  <td className="max-w-56 truncate px-3 py-3 text-muted-foreground">
                    {txn.courseTitle}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs">
                    {txn.couponCode ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-medium">
                    <span className="inline-flex items-center gap-1">
                      {formatINR(txn.amount)}
                      {txn.invoiceUrl && (
                        <a
                          href={txn.invoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground transition-colors hover:text-primary"
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={txn.status} />
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {new Date(txn.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
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
