"use client";

import { memo, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  downloadReportExcel,
  fetchReportExportData,
} from "@/lib/api/report-export.api";
import {
  buildExportColumns,
  cleanReportExportParams,
  normalizeExportColumnKey,
  type ExportFormat,
} from "@/lib/admin/report-export";
import { downloadReportTablePdf } from "@/lib/pdf/tablePdf";
import type { ReportColumn, ReportQueryParams } from "@/types/reports.types";
import type { ReportType } from "@/lib/admin/reports.config";

interface ReportExportProps {
  reportType: ReportType;
  title: string;
  columns: ReportColumn[];
  params?: ReportQueryParams;
}

function ReportExport({ reportType, title, columns, params }: ReportExportProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("excel");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [exportStep, setExportStep] = useState("");
  const [error, setError] = useState("");

  const exportColumns = useMemo(() => buildExportColumns(columns), [columns]);
  const exportParams = useMemo(() => cleanReportExportParams(params), [params]);

  const openDialog = (nextFormat: ExportFormat) => {
    setFormat(nextFormat);
    setError("");
    setExportStep("");
    setSelected(
      new Set(
        exportColumns.filter((column) => column.default !== false).map((column) => column.key)
      )
    );
    setOpen(true);
  };

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleExport = async () => {
    if (selected.size === 0) {
      setError("Select at least one column");
      return;
    }

    setExporting(true);
    setError("");
    setExportStep(format === "pdf" ? "Fetching records..." : "Preparing file...");

    const selectedKeys = Array.from(selected).map(normalizeExportColumnKey);

    try {
      if (format === "excel") {
        await downloadReportExcel(reportType, selectedKeys, exportParams);
      } else {
        const report = await fetchReportExportData(reportType, exportParams);
        const rows = report.table.rows.map((row) => {
          const record: Record<string, string> = {};
          exportColumns.forEach((column) => {
            if (column.key !== "slno") {
              record[column.key] = row[column.key] ?? "—";
            }
          });
          return record;
        });

        if (rows.length === 0) {
          setError("No records found with the current filters");
          return;
        }

        setExportStep(`Generating PDF (${rows.length} records)...`);
        await downloadReportTablePdf({
          title,
          columns: exportColumns,
          rows,
          selectedKeys,
          filename: `${reportType}-report-${new Date().toISOString().slice(0, 10)}.pdf`,
        });
      }

      setOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Export failed"));
    } finally {
      setExporting(false);
      setExportStep("");
    }
  };

  if (exportColumns.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => openDialog("excel")}>
          <Download className="mr-2 h-4 w-4" />
          Excel
        </Button>
        <Button variant="outline" size="sm" onClick={() => openDialog("pdf")}>
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Select Columns for {format === "excel" ? "Excel" : "PDF"}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-80 overflow-y-auto py-1">
            <div className="mb-3 flex gap-3 text-xs">
              <button
                type="button"
                onClick={() => setSelected(new Set(exportColumns.map((column) => column.key)))}
                className="text-[#0a255d] hover:underline dark:text-blue-400"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-muted-foreground hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-2">
              {exportColumns.map((column) => (
                <label
                  key={column.key}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(column.key)}
                    onChange={() => toggle(column.key)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">{column.label}</span>
                </label>
              ))}
            </div>

            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={exporting}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={exporting || selected.size === 0}>
              {exporting
                ? exportStep || "Exporting..."
                : format === "excel"
                  ? "Download Excel"
                  : "Download PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(ReportExport);
