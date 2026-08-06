const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PUBLISHED: {
    label: "Published",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  SUCCEEDED: {
    label: "Succeeded",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PENDING: {
    label: "Pending",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const config = statusConfig[status] ?? {
    label: status.charAt(0) + status.slice(1).toLowerCase().replace("_", " "),
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.className} ${className ?? ""}`}
    >
      {config.label}
    </span>
  );
}

export function DraftCountBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count <= 0) return null;

  return (
    <span
      className={`shrink-0 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-medium ${className ?? ""}`}
    >
      {count} draft{count !== 1 ? "s" : ""}
    </span>
  );
}
