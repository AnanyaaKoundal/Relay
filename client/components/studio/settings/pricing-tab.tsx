"use client";

interface Props {
  isPaid: boolean;
  setIsPaid: (v: boolean) => void;
  price: string;
  setPrice: (v: string) => void;
}

export function PricingTab({ isPaid, setIsPaid, price, setPrice }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Type</label>
        <select
          className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          value={isPaid ? "paid" : "free"}
          onChange={(e) => {
            setIsPaid(e.target.value === "paid");
            if (e.target.value === "free") setPrice("");
          }}
        >
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>
      <div>
        <label htmlFor="s-price" className="text-xs font-medium text-muted-foreground">Price (₹)</label>
        <input
          id="s-price"
          type="number"
          min="0"
          step="0.01"
          value={isPaid ? price : "0"}
          disabled={!isPaid}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
}
