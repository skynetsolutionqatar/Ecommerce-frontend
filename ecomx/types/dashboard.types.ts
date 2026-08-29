import type { OrderStatus, TransactionStatus } from "@/lib/Constant";
import type { PaginationMeta } from "@/types/api.types";

export type TrendDirection = "up" | "down";
export type SparklineType = "line" | "bar";

export interface DashboardTrend {
  value: number;
  direction: TrendDirection;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  trend: DashboardTrend;
  sparkline: number[];
  sparklineType: SparklineType;
  sparklineColor: string;
  ringPercent?: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface CategoryChartItem {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface RevenueTrendPoint {
  month: string;
  value: number;
}

export interface SalesDistributionItem {
  id: string;
  label: string;
  amount: number;
  percent: number;
  color: string;
}

export interface PerformanceMetric {
  id: string;
  label: string;
  value: string;
  percent: number;
  color: string;
}

export interface DashboardTransaction {
  id: string;
  client: string;
  date: string;
  amount: string;
  status: TransactionStatus;
}

export interface DashboardOrder {
  id: string;
  customer: string;
  date: string;
  items: number;
  amount: string;
  status: OrderStatus;
}

export interface DashboardLowStockItem {
  id: string;
  product: string;
  sku: string;
  stock: number;
  threshold: number;
}

export interface DashboardTableSection<T> {
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
  rows: T[];
  pagination: PaginationMeta;
}

export interface DashboardData {
  overview: { title: string; subtitle: string };
  stats: DashboardStat[];
  revenueTrend: { title: string; description: string; points: RevenueTrendPoint[] };
  salesDistribution: {
    title: string;
    totalLabel: string;
    totalValue: string;
    items: SalesDistributionItem[];
  };
  categoryPie: { title: string; description: string; items: CategoryChartItem[] };
  orderStatusDonut: {
    title: string;
    totalLabel: string;
    totalValue: string;
    items: CategoryChartItem[];
  };
  ordersArea: { title: string; description: string; points: ChartPoint[] };
  categoryBar: { title: string; description: string; points: ChartPoint[] };
  customerLine: { title: string; description: string; points: ChartPoint[] };
  performanceMetrics: PerformanceMetric[];
  recentTransactions: DashboardTableSection<DashboardTransaction>;
  recentOrders: DashboardTableSection<DashboardOrder>;
  lowStock: DashboardTableSection<DashboardLowStockItem>;
  utmSourceReport: { title: string; description: string; items: CategoryChartItem[] };
  utmCampaignReport: { title: string; description: string; points: ChartPoint[] };
}

export interface DashboardQueryParams {
  ordersPage?: number;
  ordersLimit?: number;
  transactionsPage?: number;
  transactionsLimit?: number;
  lowStockPage?: number;
  lowStockLimit?: number;
}
