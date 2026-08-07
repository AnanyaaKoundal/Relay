"use client";

export function PriceDisplay({ price }: { price: number }) {
  if (price === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-medium">
        Free
      </span>
    );
  }
  return <span>₹{price.toLocaleString()}</span>;
}
