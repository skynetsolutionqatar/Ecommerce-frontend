/** Admin dashboard static data — swap with API responses later. */

import { ORDER_STATUS, TRANSACTION_STATUS, type OrderStatus, type TransactionStatus } from "@/lib/Constant";
import { ADMIN_ROUTES } from "@/lib/config";
import { PIE_PALETTE } from "@/lib/admin/chart-utils";

export type { TransactionStatus };

export type TimeRange = "today" | "weekly" | "monthly" | "yearly";
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

export interface DashboardOverview {
  title: string;
  subtitle: string;
}

export interface DashboardData {
  overview: DashboardOverview;
  timeRanges: { key: TimeRange; label: string }[];
  defaultTimeRange: TimeRange;
  stats: DashboardStat[];
  revenueTrend: {
    title: string;
    description: string;
    points: RevenueTrendPoint[];
  };
  salesDistribution: {
    title: string;
    totalLabel: string;
    totalValue: string;
    items: SalesDistributionItem[];
  };
  categoryPie: {
    title: string;
    description: string;
    items: CategoryChartItem[];
  };
  orderStatusDonut: {
    title: string;
    totalLabel: string;
    totalValue: string;
    items: CategoryChartItem[];
  };
  ordersArea: {
    title: string;
    description: string;
    points: ChartPoint[];
  };
  categoryBar: {
    title: string;
    description: string;
    points: ChartPoint[];
  };
  customerLine: {
    title: string;
    description: string;
    points: ChartPoint[];
  };
  performanceMetrics: PerformanceMetric[];
  recentTransactions: {
    title: string;
    viewAllLabel: string;
    viewAllHref: string;
    columns: { key: keyof DashboardTransaction | "status"; label: string }[];
    rows: DashboardTransaction[];
  };
  recentOrders: {
    title: string;
    viewAllLabel: string;
    viewAllHref: string;
    columns: { key: keyof DashboardOrder | "status"; label: string }[];
    rows: DashboardOrder[];
  };
  lowStock: {
    title: string;
    viewAllLabel: string;
    viewAllHref: string;
    columns: { key: keyof DashboardLowStockItem; label: string }[];
    rows: DashboardLowStockItem[];
  };
}

export const DASHBOARD_DATA: DashboardData = {
  overview: {
    title: "Dashboard Overview",
    subtitle: "Real-time performance metrics and enterprise insights.",
  },
  timeRanges: [
    { key: "today", label: "Today" },
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
    { key: "yearly", label: "Yearly" },
  ],
  defaultTimeRange: "monthly",
  stats: [
    {
      id: "new-customers",
      label: "New Customers",
      value: "3,897",
      trend: { value: 3.3, direction: "up" },
      sparkline: [12, 18, 14, 22, 19, 28, 24, 32, 29, 35, 31, 38],
      sparklineType: "line",
      sparklineColor: "#059669",
    },
    {
      id: "new-orders",
      label: "New Orders",
      value: "35,084",
      trend: { value: 2.8, direction: "down" },
      sparkline: [40, 35, 38, 32, 36, 28, 30, 26, 29, 24, 27, 22],
      sparklineType: "bar",
      sparklineColor: "#EF4444",
    },
    {
      id: "growth",
      label: "Growth",
      value: "89.87%",
      trend: { value: 2.8, direction: "up" },
      sparkline: [55, 58, 62, 60, 65, 68, 72, 70, 75, 78, 82, 85],
      sparklineType: "line",
      sparklineColor: "#3B82F6",
    },
    {
      id: "conversion",
      label: "Conversion",
      value: "12.4%",
      trend: { value: 1.5, direction: "up" },
      sparkline: [],
      sparklineType: "line",
      sparklineColor: "#059669",
      ringPercent: 12,
    },
  ],
  revenueTrend: {
    title: "Revenue Trends",
    description:
      "Monthly revenue performance across all sales channels.",
    points: [
      { month: "Jan", value: 42 },
      { month: "Feb", value: 48 },
      { month: "Mar", value: 45 },
      { month: "Apr", value: 52 },
      { month: "May", value: 58 },
      { month: "Jun", value: 55 },
      { month: "Jul", value: 62 },
      { month: "Aug", value: 68 },
      { month: "Sep", value: 72 },
      { month: "Oct", value: 78 },
      { month: "Nov", value: 85 },
    ],
  },
  salesDistribution: {
    title: "Sales Distribution",
    totalLabel: "Total Sales",
    totalValue: "QAR 124k",
    items: [
      { id: "domestic", label: "Domestic", amount: 74400, percent: 60, color: PIE_PALETTE[0] },
      { id: "online", label: "Online", amount: 18600, percent: 15, color: PIE_PALETTE[1] },
      { id: "export", label: "Export", amount: 31000, percent: 25, color: PIE_PALETTE[2] },
    ],
  },
  categoryPie: {
    title: "Sales by Category",
    description: "Product category share with labeled segments.",
    items: [
      { id: "electronics", label: "Electronics", value: 35, color: PIE_PALETTE[0] },
      { id: "pos", label: "POS Hardware", value: 28, color: PIE_PALETTE[1] },
      { id: "networking", label: "Networking", value: 18, color: PIE_PALETTE[2] },
      { id: "accessories", label: "Accessories", value: 12, color: PIE_PALETTE[3] },
      { id: "software", label: "Software", value: 7, color: PIE_PALETTE[4] },
    ],
  },
  orderStatusDonut: {
    title: "Orders by Status",
    totalLabel: "Total Orders",
    totalValue: "1,248",
    items: [
      { id: "delivered", label: "Delivered", value: 42, color: PIE_PALETTE[2] },
      { id: "processing", label: "Processing", value: 24, color: PIE_PALETTE[1] },
      { id: "shipped", label: "Shipped", value: 18, color: PIE_PALETTE[3] },
      { id: "pending", label: "Pending", value: 11, color: PIE_PALETTE[4] },
      { id: "cancelled", label: "Cancelled", value: 5, color: PIE_PALETTE[7] },
    ],
  },
  ordersArea: {
    title: "Daily Order Volume",
    description: "Orders received over the last 14 days.",
    points: [
      { label: "Mon", value: 82 },
      { label: "Tue", value: 95 },
      { label: "Wed", value: 88 },
      { label: "Thu", value: 112 },
      { label: "Fri", value: 104 },
      { label: "Sat", value: 76 },
      { label: "Sun", value: 68 },
      { label: "Mon", value: 91 },
      { label: "Tue", value: 108 },
      { label: "Wed", value: 115 },
      { label: "Thu", value: 98 },
      { label: "Fri", value: 122 },
      { label: "Sat", value: 87 },
      { label: "Sun", value: 74 },
    ],
  },
  categoryBar: {
    title: "Revenue by Category",
    description: "Top performing product categories this month.",
    points: [
      { label: "Electronics", value: 48 },
      { label: "POS", value: 36 },
      { label: "Network", value: 28 },
      { label: "Accessories", value: 22 },
      { label: "Software", value: 14 },
      { label: "Services", value: 10 },
    ],
  },
  customerLine: {
    title: "Customer Growth",
    description: "New customer sign-ups over the last 12 months.",
    points: [
      { label: "Jan", value: 120 },
      { label: "Feb", value: 145 },
      { label: "Mar", value: 132 },
      { label: "Apr", value: 168 },
      { label: "May", value: 190 },
      { label: "Jun", value: 175 },
      { label: "Jul", value: 210 },
      { label: "Aug", value: 228 },
      { label: "Sep", value: 245 },
      { label: "Oct", value: 260 },
      { label: "Nov", value: 278 },
      { label: "Dec", value: 295 },
    ],
  },
  performanceMetrics: [
    {
      id: "uptime",
      label: "System Uptime",
      value: "99.9%",
      percent: 99.9,
      color: "#059669",
    },
    {
      id: "completion",
      label: "Order Completion",
      value: "82%",
      percent: 82,
      color: "#2563EB",
    },
  ],
  recentTransactions: {
    title: "Recent Transactions",
    viewAllLabel: "View All Records",
    viewAllHref: ADMIN_ROUTES.orders,
    columns: [
      { key: "id", label: "Transaction ID" },
      { key: "client", label: "Client" },
      { key: "date", label: "Date" },
      { key: "amount", label: "Amount" },
      { key: "status", label: "Status" },
    ],
    rows: [
      {
        id: "TXN-9021",
        client: "Global Tech Solutions",
        date: "05-Feb-2025",
        amount: "QAR 4,250.00",
        status: TRANSACTION_STATUS.COMPLETED,
      },
      {
        id: "TXN-9020",
        client: "Metro Retail Group",
        date: "05-Feb-2025",
        amount: "QAR 1,890.50",
        status: TRANSACTION_STATUS.PENDING,
      },
      {
        id: "TXN-9019",
        client: "Skyline Enterprises",
        date: "04-Feb-2025",
        amount: "QAR 12,400.00",
        status: TRANSACTION_STATUS.COMPLETED,
      },
    ],
  },
  recentOrders: {
    title: "Recent Orders",
    viewAllLabel: "View All Orders",
    viewAllHref: ADMIN_ROUTES.orders,
    columns: [
      { key: "id", label: "Order ID" },
      { key: "customer", label: "Customer" },
      { key: "date", label: "Date" },
      { key: "items", label: "Items" },
      { key: "amount", label: "Amount" },
      { key: "status", label: "Status" },
    ],
    rows: [
      {
        id: "ORD-10482",
        customer: "Ahmed Al-Mansouri",
        date: "22-Jul-2026",
        items: 3,
        amount: "QAR 2,450.00",
        status: ORDER_STATUS.PROCESSING,
      },
      {
        id: "ORD-10481",
        customer: "Fatima Hassan",
        date: "22-Jul-2026",
        items: 1,
        amount: "QAR 890.00",
        status: ORDER_STATUS.SHIPPED,
      },
      {
        id: "ORD-10480",
        customer: "Tech Solutions WLL",
        date: "21-Jul-2026",
        items: 8,
        amount: "QAR 15,200.00",
        status: ORDER_STATUS.DELIVERED,
      },
      {
        id: "ORD-10479",
        customer: "Khalid Rahman",
        date: "21-Jul-2026",
        items: 2,
        amount: "QAR 1,120.00",
        status: ORDER_STATUS.PENDING,
      },
      {
        id: "ORD-10478",
        customer: "Office Plus Trading",
        date: "20-Jul-2026",
        items: 5,
        amount: "QAR 6,780.00",
        status: ORDER_STATUS.CONFIRMED,
      },
      {
        id: "ORD-10477",
        customer: "Sarah Williams",
        date: "20-Jul-2026",
        items: 1,
        amount: "QAR 340.00",
        status: ORDER_STATUS.CANCELLED,
      },
    ],
  },
  lowStock: {
    title: "Low Stock Alerts",
    viewAllLabel: "View Inventory",
    viewAllHref: ADMIN_ROUTES.inventory,
    columns: [
      { key: "product", label: "Product" },
      { key: "sku", label: "SKU" },
      { key: "stock", label: "Stock" },
      { key: "threshold", label: "Alert At" },
    ],
    rows: [
      {
        id: "1",
        product: "Thermal Receipt Printer TP-80",
        sku: "TP-80-BK",
        stock: 2,
        threshold: 10,
      },
      {
        id: "2",
        product: "Barcode Scanner BS-200",
        sku: "BS-200-WH",
        stock: 4,
        threshold: 15,
      },
      {
        id: "3",
        product: "Cash Drawer CD-410",
        sku: "CD-410-SL",
        stock: 1,
        threshold: 8,
      },
      {
        id: "4",
        product: "POS Terminal PT-15",
        sku: "PT-15-GR",
        stock: 3,
        threshold: 12,
      },
      {
        id: "5",
        product: "Network Switch 24-Port",
        sku: "NS-24-GE",
        stock: 5,
        threshold: 20,
      },
    ],
  },
};

export function getDashboardData(_range: TimeRange = DASHBOARD_DATA.defaultTimeRange): DashboardData {
  return DASHBOARD_DATA;
}
