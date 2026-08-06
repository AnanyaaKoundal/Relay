"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FilterSelect } from "@/components/shared/filter-select";

export function PaymentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Search by user or transaction ID..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) {
            params.set("search", e.target.value);
          } else {
            params.delete("search");
          }
          params.delete("page");
          router.push(`?${params.toString()}`);
        }}
        className="h-9 rounded-lg border bg-background px-3 text-sm w-72 outline-none focus:ring-2 focus:ring-primary/20"
      />
      <FilterSelect
        value={searchParams.get("status") ?? ""}
        placeholder="All Status"
        onChange={(v) => updateParam("status", v)}
        allLabel="All Status"
        options={[
          { label: "Succeeded", value: "SUCCEEDED" },
          { label: "Pending", value: "PENDING" },
          { label: "Refunded", value: "REFUNDED" },
          { label: "Failed", value: "FAILED" },
        ]}
      />
    </div>
  );
}
