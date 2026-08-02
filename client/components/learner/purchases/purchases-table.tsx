"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  FileText,
} from "lucide-react";
import type { Purchase } from "@/types/payment.types";
import { STATUS_META } from "./purchase-tabs";
import { formatINR, formatDate } from "./utils";
import type { SortKey } from "./types";

function SortHeader({
  label,
  column,
  sortKey,
  sortDir,
  onToggle,
  className,
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onToggle: (key: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === column;
  return (
    <button
      type="button"
      onClick={() => onToggle(column)}
      className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${className ?? ""}`}
    >
      {label}
      {active ? (
        sortDir === "asc" ? (
          <ArrowUp className="size-3" />
        ) : (
          <ArrowDown className="size-3" />
        )
      ) : (
        <ArrowUpDown className="size-3 text-muted-foreground/50" />
      )}
    </button>
  );
}

function courseHref(purchase: Purchase) {
  if (!purchase.course) return null;
  return purchase.status === "SUCCEEDED" || purchase.status === "REFUNDED"
    ? `/courses/${purchase.course.id}/learn`
    : `/courses/${purchase.course.id}`;
}

const GATEWAY_LABEL: Record<string, string> = {
  MOCK: "Test gateway",
  STRIPE: "Card",
  RAZORPAY: "Card",
};

export function PurchasesTable({
  purchases,
  sortKey,
  sortDir,
  onToggleSort,
}: {
  purchases: Purchase[];
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onToggleSort: (key: SortKey) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="w-8 px-2 py-3" />
            <th className="px-4 py-3">
              <SortHeader label="Date" column="date" sortKey={sortKey} sortDir={sortDir} onToggle={onToggleSort} />
            </th>
            <th className="px-4 py-3">
              <SortHeader label="Course" column="course" sortKey={sortKey} sortDir={sortDir} onToggle={onToggleSort} />
            </th>
            <th className="px-4 py-3">
              <SortHeader label="Status" column="status" sortKey={sortKey} sortDir={sortDir} onToggle={onToggleSort} />
            </th>
            <th className="px-4 py-3 text-right">
              <SortHeader label="Amount" column="amount" sortKey={sortKey} sortDir={sortDir} onToggle={onToggleSort} className="justify-end" />
            </th>
            <th className="px-4 py-3 text-right">Invoice</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {purchases.map((purchase) => {
            const isOpen = expanded === purchase.id;
            const status = STATUS_META[purchase.status];
            const href = courseHref(purchase);
            return (
              <Fragment key={purchase.id}>
                <tr
                  onClick={() => setExpanded(isOpen ? null : purchase.id)}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                >
                  <td className="px-2 py-3 text-muted-foreground">
                    {isOpen ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatDate(purchase.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {href ? (
                      <Link
                        href={href}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {purchase.course?.title}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">
                        {purchase.course?.title ?? "Unknown course"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                    >
                      <span className={`size-1.5 rounded-full ${status.dotClass}`} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatINR(purchase.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {purchase.invoiceUrl ? (
                      <a
                        href={purchase.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <FileText className="size-3.5" />
                        Invoice
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground/60">—</span>
                    )}
                  </td>
                </tr>
                {isOpen && (
                  <tr className="bg-muted/30">
                    <td colSpan={6}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 px-8 py-4 text-sm">
                        <div className="flex items-center justify-between gap-4 sm:block">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Subtotal</p>
                          <p className="font-medium">{formatINR(purchase.subtotal)}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:block">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Discount{purchase.couponCode ? ` (${purchase.couponCode})` : ""}
                          </p>
                          <p className="font-medium text-emerald-600">
                            {purchase.discountAmount > 0
                              ? `−${formatINR(purchase.discountAmount)}`
                              : formatINR(0)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:block">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Tax</p>
                          <p className="font-medium">{formatINR(purchase.taxAmount)}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:block">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Order ID</p>
                          <p className="font-mono text-xs font-medium">
                            {purchase.gatewayTransactionId}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:block">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment method</p>
                          <p className="font-medium">{GATEWAY_LABEL[purchase.gateway] ?? purchase.gateway}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:block">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Billing country</p>
                          <p className="font-medium">{purchase.billingCountry}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
