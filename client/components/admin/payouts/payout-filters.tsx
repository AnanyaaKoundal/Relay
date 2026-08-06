"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FilterSelect } from "@/components/shared/filter-select";

export function PayoutFilters() {
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
      <FilterSelect
        value={searchParams.get("status") ?? ""}
        placeholder="All Status"
        onChange={(v) => updateParam("status", v)}
        allLabel="All Status"
        options={[
          { label: "Pending", value: "PENDING" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Failed", value: "FAILED" },
        ]}
      />
    </div>
  );
}
