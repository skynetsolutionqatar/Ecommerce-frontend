/** Dashboard chart helpers — formatting & data shaping for Recharts. */

export function formatChartAxis(value: number): string {
  const n = Number(value);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}
export function formatTrend(value: number, direction: "up" | "down"): string {
  const sign = direction === "up" ? "+" : "-";
  return `${sign}${Math.abs(value).toFixed(1)}%`;
}

export function toSeriesData(values: number[], labelKey = "i", valueKey = "value") {
  return values.map((value, i) => ({ [labelKey]: i, [valueKey]: value }));
}

export const CHART_COLORS = {
  primary: "#059669",
  secondary: "#2563EB",
  tertiary: "#0D9488",
  quaternary: "#7C3AED",
  quinary: "#EA580C",
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
  track: "var(--chart-track)",
} as const;

export const PIE_PALETTE = [
  "#1E3A5F",
  "#2563EB",
  "#0D9488",
  "#7C3AED",
  "#EA580C",
  "#DB2777",
  "#CA8A04",
  "#64748B",
] as const;

export const chartMargin = { top: 8, right: 8, left: 0, bottom: 0 };

export const axisTickStyle = {
  fontSize: 12,
  fill: CHART_COLORS.axis,
};

export const tooltipStyle = {
  contentStyle: {
    borderRadius: 8,
    border: "1px solid var(--border)",
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    fontSize: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  labelStyle: {
    color: "var(--popover-foreground)",
  },
  itemStyle: {
    color: "var(--popover-foreground)",
  },
};
