"use client";

import React from "react";
import type { TablePdfColumn } from "@/lib/pdf/types";
import type { ExportColumnOption } from "@/lib/admin/report-export";
import { prepareTablePdfData } from "@/lib/admin/report-export";

function defaultGeneratedAt() {
  return new Date().toLocaleString("en-QA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function downloadReportTablePdf({
  title,
  columns,
  rows,
  selectedKeys,
  filename,
}: {
  title: string;
  columns: ExportColumnOption[];
  rows: Record<string, string>[];
  selectedKeys: string[];
  filename: string;
}) {
  const { columns: pdfColumns, rows: pdfRows } = prepareTablePdfData(columns, rows, selectedKeys);

  const [{ pdf }, { default: TablePdfDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/lib/pdf/TablePdfDocument"),
  ]);

  const blob = await pdf(
    React.createElement(TablePdfDocument, {
      title,
      columns: pdfColumns as TablePdfColumn[],
      rows: pdfRows,
      generatedAt: defaultGeneratedAt(),
      totalRows: pdfRows.length,
    })
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
