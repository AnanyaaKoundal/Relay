"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { AdminPayout } from "@/types/admin.types";
import { listPayouts } from "@/services/admin.service";
import { PayoutFilters } from "@/components/admin/payouts/payout-filters";
import { PayoutTable } from "@/components/admin/payouts/payout-table";
import { PayoutActionDrawer } from "@/components/admin/payouts/payout-action-drawer";
import { Pagination } from "@/components/admin/users/pagination";

export default function AdminPayoutsPage() {
  const searchParams = useSearchParams();
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<AdminPayout | null>(null);

  const page = Number(searchParams.get("page") ?? "1");
  const status = searchParams.get("status") ?? "";

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listPayouts({ status, page });
      setPayouts(result.payouts);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch {
      setPayouts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Payouts</h2>
        <p className="text-sm text-muted-foreground">
          {total > 0 ? `${total} total payout requests` : "Manage instructor payout requests."}
        </p>
      </div>

      <PayoutFilters />

      {loading ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Loading payouts...</p>
        </div>
      ) : (
        <>
          <PayoutTable payouts={payouts} onSelectPayout={setSelectedPayout} />
          <Pagination page={page} totalPages={totalPages} />
        </>
      )}

      <PayoutActionDrawer
        payout={selectedPayout}
        onClose={() => setSelectedPayout(null)}
        onPayoutUpdated={fetchPayouts}
      />
    </div>
  );
}
