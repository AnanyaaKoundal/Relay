"use client";

import type { AdminPayment } from "@/types/admin.types";

const statusStyles: Record<string, string> = {
  SUCCEEDED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  REFUNDED: "bg-rose-50 text-rose-700 border-rose-200",
  FAILED: "bg-gray-50 text-gray-700 border-gray-200",
};

export function PaymentTable({
  payments,
  onSelectPayment,
}: {
  payments: AdminPayment[];
  onSelectPayment: (id: string) => void;
}) {
  if (payments.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">No payments found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Course</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Gateway</th>
            <th className="px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr
              key={p.id}
              className="border-b last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => onSelectPayment(p.id)}
            >
              <td className="px-4 py-3">
                <div className="font-medium">{p.user.name}</div>
                <div className="text-xs text-muted-foreground">{p.user.email}</div>
              </td>
              <td className="px-4 py-3">
                {p.course ? (
                  <div>
                    <div className="font-medium">{p.course.title}</div>
                    <div className="text-xs text-muted-foreground">by {p.course.instructor.name}</div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 font-medium">₹{p.totalAmount.toLocaleString()}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[p.status] ?? ""}`}>
                  {p.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{p.gateway}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(p.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
