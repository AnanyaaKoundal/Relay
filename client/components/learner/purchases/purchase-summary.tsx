import { Wallet, ReceiptText, RotateCcw } from "lucide-react";
import type { Purchase } from "@/types/payment.types";
import { formatINR } from "./utils";

export function PurchaseSummary({ purchases }: { purchases: Purchase[] }) {
  const totalSpent = purchases
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((acc, p) => acc + p.totalAmount, 0);
  const refunded = purchases.filter((p) => p.status === "REFUNDED").length;

  const cards = [
    {
      label: "Total spent",
      value: formatINR(totalSpent),
      icon: Wallet,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      label: "Purchases",
      value: String(purchases.length),
      icon: ReceiptText,
      iconClass: "bg-sky-500/10 text-sky-600",
    },
    {
      label: "Refunded",
      value: String(refunded),
      icon: RotateCcw,
      iconClass: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3 rounded-xl border bg-card p-4"
        >
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}
          >
            <card.icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="text-lg font-semibold leading-tight">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
