import type { Purchase, PaymentStatus } from "@/types/payment.types";
import type { PurchaseTab } from "./types";

export function PurchaseTabs({
  purchases,
  active,
  onChange,
}: {
  purchases: Purchase[];
  active: PurchaseTab;
  onChange: (value: PurchaseTab) => void;
}) {
  const tabs: { label: string; value: PurchaseTab; count: number }[] = [
    { label: "All", value: "all", count: purchases.length },
    {
      label: "Paid",
      value: "SUCCEEDED",
      count: purchases.filter((p) => p.status === "SUCCEEDED").length,
    },
    {
      label: "Refunded",
      value: "REFUNDED",
      count: purchases.filter((p) => p.status === "REFUNDED").length,
    },
    {
      label: "Pending",
      value: "PENDING",
      count: purchases.filter((p) => p.status === "PENDING").length,
    },
    {
      label: "Failed",
      value: "FAILED",
      count: purchases.filter((p) => p.status === "FAILED").length,
    },
  ];

  return (
    <div className="flex items-center gap-1 border-b overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap ${
            active === tab.value
              ? "border-primary text-foreground font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              active === tab.value
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}

export const STATUS_META: Record<
  PaymentStatus,
  { label: string; className: string; dotClass: string }
> = {
  SUCCEEDED: {
    label: "Paid",
    className: "bg-emerald-500/10 text-emerald-600",
    dotClass: "bg-emerald-500",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-amber-500/10 text-amber-600",
    dotClass: "bg-amber-500",
  },
  PENDING: {
    label: "Pending",
    className: "bg-sky-500/10 text-sky-600",
    dotClass: "bg-sky-500",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-500/10 text-red-600",
    dotClass: "bg-red-500",
  },
};
