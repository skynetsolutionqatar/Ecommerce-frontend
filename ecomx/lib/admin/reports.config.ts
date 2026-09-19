import {
  BarChart3,
  LineChart,
  Package,
  PieChart,
  ShoppingCart,
  Tags,
  TrendingUp,
  Users,
} from "lucide-react";
import { ADMIN_ROUTES } from "@/lib/config";

export const REPORT_TYPES = [
  "revenue",
  "sales",
  "orders",
  "categories",
  "customers",
  "traffic-sources",
  "campaigns",
  "stock",
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_MENU = [
  {
    id: "revenue" as const,
    name: "Revenue",
    path: ADMIN_ROUTES.report("revenue"),
    icon: TrendingUp,
  },
  {
    id: "sales" as const,
    name: "Sales",
    path: ADMIN_ROUTES.report("sales"),
    icon: BarChart3,
  },
  {
    id: "orders" as const,
    name: "Orders",
    path: ADMIN_ROUTES.report("orders"),
    icon: ShoppingCart,
  },
  {
    id: "categories" as const,
    name: "Categories",
    path: ADMIN_ROUTES.report("categories"),
    icon: Tags,
  },
  {
    id: "customers" as const,
    name: "Customers",
    path: ADMIN_ROUTES.report("customers"),
    icon: Users,
  },
  {
    id: "traffic-sources" as const,
    name: "Traffic Sources",
    path: ADMIN_ROUTES.report("traffic-sources"),
    icon: PieChart,
  },
  {
    id: "campaigns" as const,
    name: "Campaigns",
    path: ADMIN_ROUTES.report("campaigns"),
    icon: LineChart,
  },
  {
    id: "stock" as const,
    name: "Stock",
    path: ADMIN_ROUTES.report("stock"),
    icon: Package,
  },
];

export function isReportType(value: string): value is ReportType {
  return REPORT_TYPES.includes(value as ReportType);
}
