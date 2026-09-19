import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { TablePdfColumn, TablePdfDocumentProps } from "@/lib/pdf/types";

const BLUE = "#0A255D";
const BORDER = "#CCCCCC";
const ROWS_PER_PAGE = 28;
const SERIAL_WIDTH = 32;

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#111111",
  },
  header: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 6,
  },
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 8,
    color: "#666666",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: BORDER,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: BLUE,
  },
  bodyRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    minHeight: 18,
  },
  bodyRowAlt: {
    backgroundColor: "#F9FAFB",
  },
  headerText: {
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    textAlign: "center",
  },
  bodyText: {
    fontSize: 7,
    color: "#111111",
  },
  bodyTextLeft: {
    textAlign: "left",
  },
  bodyTextCenter: {
    textAlign: "center",
  },
  empty: {
    padding: 16,
    textAlign: "center",
    color: "#666666",
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#888888",
  },
});

function isNarrowColumn(col: TablePdfColumn) {
  return col.key === "slno" || col.width === "narrow";
}

function cellContainerStyle(col: TablePdfColumn, isLast: boolean) {
  const shared = {
    borderRightWidth: isLast ? 0 : 1,
    borderRightColor: BORDER,
    paddingVertical: 4,
    paddingHorizontal: 4,
    justifyContent: "center" as const,
  };

  if (isNarrowColumn(col)) {
    return [{ width: SERIAL_WIDTH, flexShrink: 0, flexGrow: 0 }, shared];
  }

  return [{ flex: 1, minWidth: 0 }, shared];
}

function chunkRows<T>(rows: T[], size: number): T[][] {
  if (rows.length === 0) return [[]];
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += size) {
    chunks.push(rows.slice(i, i + size));
  }
  return chunks;
}

function TableHeader({ columns }: { columns: TablePdfColumn[] }) {
  return (
    <View style={styles.headerRow}>
      {columns.map((col, index) => (
        <View key={col.key} style={cellContainerStyle(col, index === columns.length - 1)}>
          <Text style={styles.headerText}>{col.label}</Text>
        </View>
      ))}
    </View>
  );
}

function TableBody({
  columns,
  rows,
}: {
  columns: TablePdfColumn[];
  rows: Record<string, string>[];
}) {
  return (
    <>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[styles.bodyRow, rowIndex % 2 === 1 ? styles.bodyRowAlt : {}]}
        >
          {columns.map((col, colIndex) => (
            <View key={col.key} style={cellContainerStyle(col, colIndex === columns.length - 1)}>
              <Text
                style={[
                  styles.bodyText,
                  col.align === "right" ? styles.bodyTextCenter : styles.bodyTextLeft,
                ]}
              >
                {row[col.key] ?? "—"}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

export default function TablePdfDocument({
  title,
  columns,
  rows,
  generatedAt,
  totalRows,
}: TablePdfDocumentProps) {
  const pages = chunkRows(rows, ROWS_PER_PAGE);
  const totalPages = pages.length;
  const count = totalRows ?? rows.length;

  return (
    <Document>
      {pages.map((pageRows, pageIndex) => (
        <Page key={pageIndex} size="A4" orientation="landscape" style={styles.page}>
          {pageIndex === 0 && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>
                {generatedAt ? `Generated on ${generatedAt}` : ""}
                {count > 0 ? ` · ${count} record${count === 1 ? "" : "s"}` : ""}
              </Text>
            </View>
          )}

          {rows.length === 0 && pageIndex === 0 ? (
            <Text style={styles.empty}>No records found</Text>
          ) : (
            <View style={styles.table}>
              <TableHeader columns={columns} />
              <TableBody columns={columns} rows={pageRows} />
            </View>
          )}

          <View style={styles.footer} fixed>
            <Text>{title}</Text>
            <Text>
              Page {pageIndex + 1} of {totalPages}
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}
