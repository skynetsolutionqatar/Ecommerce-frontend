import { cn } from "@/lib/utils";
import { adminStatusBadge } from "@/lib/admin/form-classes";

export const reportTableClass =
  "w-full min-w-max text-sm [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap";

export const reportTableScrollClass = "max-h-[calc(100vh-14rem)] overflow-auto";

export const reportCardClass =
  "overflow-hidden rounded-xl border border-border bg-card shadow-sm";

export const reportFilterBarClass = "border-b border-border bg-muted/30 px-4 py-3";

export const reportFilterGridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

export const reportPaginationClass =
  "flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/40 px-4 py-3 text-sm";

export const reportFilterLabelClass =
  "mb-1 block text-[11px] font-medium text-muted-foreground";

export function reportRowClass(index: number, extra?: string) {
  return cn(
    "border-b border-border transition-colors hover:bg-muted/60",
    index % 2 === 1 && "bg-muted/30",
    extra
  );
}

const RIGHT_ALIGN_KEYS = new Set([
  "orders",
  "revenue",
  "amount",
  "share",
  "items",
  "newCustomers",
]);

export function reportColumnAlign(key: string): "left" | "right" {
  return RIGHT_ALIGN_KEYS.has(key) ? "right" : "left";
}

export function reportCellClass(key: string, value: string) {
  if (key === "status") return "";
  if (key === "orderNumber") return "font-medium text-[#0a255d] dark:text-blue-400";
  if (key === "date") return "text-muted-foreground";
  if (RIGHT_ALIGN_KEYS.has(key)) {
    return key === "revenue" || key === "amount"
      ? "text-right font-semibold text-foreground"
      : "text-right text-muted-foreground";
  }
  if (value.includes("QAR")) return "text-right font-semibold text-foreground";
  return "text-foreground";
}

export function reportStatusBadgeClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("deliver")) return adminStatusBadge.green;
  if (normalized.includes("cancel") || normalized.includes("refund")) return adminStatusBadge.red;
  if (normalized.includes("pending")) return adminStatusBadge.yellow;
  if (normalized.includes("ship") || normalized.includes("process")) return adminStatusBadge.blue;
  if (normalized.includes("confirm")) return adminStatusBadge.blue;
  return adminStatusBadge.gray;
}
