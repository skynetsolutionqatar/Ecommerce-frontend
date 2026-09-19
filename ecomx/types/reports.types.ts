import type { PaginationMeta } from "@/types/api.types";

export interface ReportFilterOption {
  label: string;
  value: string;
}

export interface ReportFilterField {
  value: string;
  options: ReportFilterOption[];
}

export interface ReportSummaryItem {
  label: string;
  value: string;
}

export interface ReportColumn {
  key: string;
  label: string;
  default?: boolean;
}

export interface ReportRow {
  id: string;
  [key: string]: string;
}

export interface ReportTable {
  columns: ReportColumn[];
  rows: ReportRow[];
}

export interface ReportData {
  id: string;
  title: string;
  description: string;
  appliedFilters: Record<string, string>;
  filterOptions: Record<string, ReportFilterField>;
  summary: ReportSummaryItem[];
  table: ReportTable;
}

export interface ReportQueryParams {
  period?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  utmSource?: string;
  stockStatus?: string;
  page?: number;
  limit?: number;
}

export interface ReportResult {
  report: ReportData;
  pagination?: PaginationMeta;
}
