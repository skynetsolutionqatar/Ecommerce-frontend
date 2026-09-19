import type { ReportColumn, ReportQueryParams } from "@/types/reports.types";
import { reportColumnAlign } from "@/lib/admin/report-classes";

export type ExportFormat = "excel" | "pdf";

export interface ExportColumnOption extends ReportColumn {
  default?: boolean;
  align?: "left" | "right";
  width?: "narrow" | "normal";
}

export const SLNO_KEY = "slno";

export function buildExportColumns(tableColumns: ReportColumn[]): ExportColumnOption[] {
  return [
    {
      key: SLNO_KEY,
      label: "Sl No",
      default: true,
      align: "right",
      width: "narrow",
    },
    ...tableColumns.map((column) => ({
      ...column,
      default: column.default ?? true,
      align: reportColumnAlign(column.key),
      width: "normal" as const,
    })),
  ];
}

export function normalizeExportColumnKey(key: string) {
  return key === "#" || key === "rowNum" ? SLNO_KEY : key;
}

export function sortExportColumns(columns: ExportColumnOption[]) {
  const serial = columns.find((column) => column.key === SLNO_KEY);
  const rest = columns.filter((column) => column.key !== SLNO_KEY);
  return serial ? [serial, ...rest] : rest;
}

export function cleanReportExportParams(params?: ReportQueryParams): Record<string, string> {
  if (!params) return {};

  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "page" || key === "limit") continue;
    cleaned[key] = String(value);
  }
  return cleaned;
}

export function prepareTablePdfData(
  columns: ExportColumnOption[],
  rows: Record<string, string>[],
  selectedKeys: string[]
) {
  const normalizedKeys = new Set(selectedKeys.map(normalizeExportColumnKey));

  const selectedColumns = sortExportColumns(
    columns.filter((column) => normalizedKeys.has(normalizeExportColumnKey(column.key)))
  );

  const filteredRows = rows.map((row, index) => {
    const next: Record<string, string> = {};
    selectedColumns.forEach((column) => {
      if (column.key === SLNO_KEY) {
        next[SLNO_KEY] = String(index + 1);
      } else {
        next[column.key] = row[column.key] ?? "—";
      }
    });
    return next;
  });

  return {
    columns: selectedColumns.map((column) => ({
      key: column.key,
      label: column.label,
      align: column.align,
      width: column.width,
    })),
    rows: filteredRows,
  };
}
