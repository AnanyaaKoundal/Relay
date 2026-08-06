"use client";

import type { AdminPayout } from "@/types/admin.types";

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
};

export function PayoutTable({
  payouts,
  onSelectPayout,
}: {
  payouts: AdminPayout[];
  onSelectPayout: (payout: AdminPayout) => void;
}) {
  if (payouts.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">No payout requests found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium">Instructor</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Requested</th>
            <th className="px-4 py-3 font-medium">Processed</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((p) => (
            <tr
              key={p.id}
              className="border-b last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => onSelectPayout(p)}
            >
              <td className="px-4 py-3">
                <div className="font-medium">{p.instructor.name}</div>
                <div className="text-xs text-muted-foreground">{p.instructor.email}</div>
              </td>
              <td className="px-4 py-3 font-medium">₹{p.amount.toLocaleString()}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[p.status] ?? ""}`}>
                  {p.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(p.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {p.processedAt ? new Date(p.processedAt).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
