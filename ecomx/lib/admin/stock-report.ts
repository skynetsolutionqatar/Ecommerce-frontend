import type { ReportColumn } from "@/types/reports.types";

export const STOCK_REPORT_COLUMNS: ReportColumn[] = [
  { key: "product", label: "Product" },
  { key: "sku", label: "SKU" },
  { key: "category", label: "Category" },
  { key: "stock", label: "Stock" },
  { key: "alertThreshold", label: "Alert Threshold" },
  { key: "status", label: "Status" },
];

export const STOCK_STATUS_FILTER_OPTIONS = [
  { label: "All products", value: "" },
  { label: "Low / out of stock", value: "low" },
  { label: "Healthy stock", value: "ok" },
];

export function getStockStatusLabel(stock: number, alert = 5) {
  if (stock <= 0) return "Out of stock";
  if (stock <= alert) return "Low stock";
  return "OK";
}

export function stockStatusBadgeClass(status: string) {
  switch (status) {
    case "OK":
      return "bg-green-50 text-green-700";
    case "Low stock":
      return "bg-amber-50 text-amber-700";
    case "Out of stock":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-600";
  }
}
