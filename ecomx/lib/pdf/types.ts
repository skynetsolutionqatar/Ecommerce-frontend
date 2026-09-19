export type TablePdfColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
  width?: "narrow" | "normal";
};

export type TablePdfDocumentProps = {
  title: string;
  columns: TablePdfColumn[];
  rows: Record<string, string>[];
  generatedAt?: string;
  totalRows?: number;
};

export type DownloadTablePdfInput = {
  title: string;
  columns: TablePdfColumn[];
  rows: Record<string, string>[];
  filename: string;
  generatedAt?: string;
};
