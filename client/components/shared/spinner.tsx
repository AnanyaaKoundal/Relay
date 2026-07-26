import { Loader2, type LucideIcon } from "lucide-react";

const sizeMap = {
  "3": "size-3",
  "3.5": "size-3.5",
  "4": "size-4",
  "8": "size-8",
} as const;

export function Spinner({
  size = "4",
  className,
  icon: Icon = Loader2,
}: {
  size?: keyof typeof sizeMap;
  className?: string;
  icon?: LucideIcon;
}) {
  return (
    <Icon
      className={`${sizeMap[size]} animate-spin ${className ?? ""}`}
    />
  );
}
