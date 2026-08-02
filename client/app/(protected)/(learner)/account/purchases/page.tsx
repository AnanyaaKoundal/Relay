"use client";

import { useEffect, useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import { listMyPayments } from "@/services/payment.service";
import type { Purchase } from "@/types/payment.types";
import { Spinner } from "@/components/shared/spinner";
import { PurchaseSummary } from "@/components/learner/purchases/purchase-summary";
import { PurchaseTabs } from "@/components/learner/purchases/purchase-tabs";
import { PurchasesTable } from "@/components/learner/purchases/purchases-table";
import type { PurchaseTab, SortKey } from "@/components/learner/purchases/types";

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PurchaseTab>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    listMyPayments()
      .then((res) => setPurchases(res.payments))
      .catch(() => setPurchases([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? purchases
        : purchases.filter((p) => p.status === filter),
    [purchases, filter],
  );

  const sorted = useMemo(() => {
    const list = [...filtered];
    const value = (p: Purchase): string | number => {
      switch (sortKey) {
        case "date":
          return new Date(p.createdAt).getTime();
        case "course":
          return p.course?.title.toLowerCase() ?? "";
        case "status":
          return p.status;
        case "amount":
          return p.totalAmount;
      }
    };
    list.sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
          <Spinner />
          Loading your purchases...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Purchases</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your payment history and receipts
        </p>
      </div>

      {purchases.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed bg-card/50 p-12 text-center">
          <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Receipt className="size-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            You haven&apos;t made any purchases yet.
          </p>
        </div>
      ) : (
        <>
          <PurchaseSummary purchases={purchases} />
          <PurchaseTabs purchases={purchases} active={filter} onChange={setFilter} />

          {sorted.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card/50 p-12 text-center">
              <p className="text-sm font-medium">No purchases match this filter.</p>
            </div>
          ) : (
            <PurchasesTable
              purchases={sorted}
              sortKey={sortKey}
              sortDir={sortDir}
              onToggleSort={toggleSort}
            />
          )}
        </>
      )}
    </div>
  );
}
