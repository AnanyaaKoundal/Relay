"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { AdminPayment } from "@/types/admin.types";
import { listPayments } from "@/services/admin.service";
import { PaymentFilters } from "@/components/admin/payments/payment-filters";
import { PaymentTable } from "@/components/admin/payments/payment-table";
import { PaymentDetailDrawer } from "@/components/admin/payments/payment-detail-drawer";
import { Pagination } from "@/components/admin/users/pagination";

export default function AdminPaymentsPage() {
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listPayments({ search, status, page });
      setPayments(result.payments);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch {
      setPayments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Payments</h2>
        <p className="text-sm text-muted-foreground">
          {total > 0 ? `${total} total payments` : "View and manage payment transactions."}
        </p>
      </div>

      <PaymentFilters />

      {loading ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Loading payments...</p>
        </div>
      ) : (
        <>
          <PaymentTable payments={payments} onSelectPayment={setSelectedPaymentId} />
          <Pagination page={page} totalPages={totalPages} />
        </>
      )}

      <PaymentDetailDrawer
        paymentId={selectedPaymentId}
        onClose={() => setSelectedPaymentId(null)}
        onPaymentUpdated={fetchPayments}
      />
    </div>
  );
}
