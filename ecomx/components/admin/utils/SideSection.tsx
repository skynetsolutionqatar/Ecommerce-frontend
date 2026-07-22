import {
  LayoutDashboard,
  Layers,
  Package,
  Users,
  Tag,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  Ticket,
  Star,
  Boxes,
} from "lucide-react";
import { ADMIN_ROUTES } from "@/lib/config";

export interface AdminMenuItem {
  name: string;
  path?: string;
  icon: React.ReactNode;
  subMenu?: { name: string; path: string; icon?: React.ReactNode }[];
}

export interface AdminMenuSection {
  title: string;
  items: AdminMenuItem[];
}

export const adminSections: AdminMenuSection[] = [
  {
    title: "MAIN",
    items: [
      {
        name: "Dashboard",
        path: ADMIN_ROUTES.dashboard,
        icon: <LayoutDashboard size={18} />,
      },
    ],
  },
  {
    title: "CATALOG",
    items: [
      {
        name: "Catalog",
        icon: <Layers size={18} />,
        subMenu: [
          { name: "Products", path: ADMIN_ROUTES.products, icon: <Package size={16} /> },
          { name: "Categories", path: ADMIN_ROUTES.categories, icon: <Tag size={16} /> },
        ],
      },
    ],
  },
  {
    title: "SALES",
    items: [
      {
        name: "Sales",
        icon: <ShoppingCart size={18} />,
        subMenu: [
          { name: "Orders", path: ADMIN_ROUTES.orders, icon: <ClipboardList size={16} /> },
          { name: "Customers", path: ADMIN_ROUTES.customers, icon: <Users size={16} /> },
        ],
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        name: "Operations",
        icon: <Boxes size={18} />,
        subMenu: [
          { name: "Inventory", path: ADMIN_ROUTES.inventory, icon: <BarChart3 size={16} /> },
          { name: "Coupons", path: ADMIN_ROUTES.coupons, icon: <Ticket size={16} /> },
          { name: "Reviews", path: ADMIN_ROUTES.reviews, icon: <Star size={16} /> },
        ],
      },
    ],
  },
];
