"use client";

import { tw, type } from "@/lib/theme";
import * as Icons from "./Icons";

export const ORDERS = [
  { id: "SK-2025-001", date: "2025-05-15", status: "Delivered", total: 7200, items: 2 },
  { id: "SK-2025-002", date: "2025-05-28", status: "Shipped", total: 4500, items: 1 },
  { id: "SK-2025-003", date: "2025-06-10", status: "Processing", total: 6800, items: 3 },
];

export const formatPrice = (p: number) => `QAR ${p.toLocaleString("en-QA")}`;

const STATUS_CLASS: Record<string, string> = {
  Delivered: "bg-gray-200 text-gray-700 border border-gray-300",
  Shipped: "bg-accent-soft text-primary border border-accent/30",
  Processing: "bg-amber-500/15 text-amber-700 border border-amber-200",
};

const OrdersPage = ({ onBack }: { onBack: () => void }) => (
  <div className={`${tw.pageTopOffset} min-h-screen ${tw.sectionBg} pb-24`}>
    <div className="mx-auto max-w-[900px] px-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 flex items-center gap-1 border-0 bg-transparent text-[13px] font-semibold text-accent cursor-pointer hover:text-accent-hover"
      >
        <Icons.ChevronLeft /> Back
      </button>

      <div className={`mb-8 rounded-3xl bg-footer px-8 py-10 text-white shadow-[0_12px_40px_rgba(0,0,0,0.15)]`}>
        <div className={`mb-2 ${type.eyebrow} text-[11px] text-accent`}>
          Order History
        </div>
        <h1 className="font-display text-[32px] font-bold">My Orders</h1>
        <p className="mt-2 text-sm text-white/65">{ORDERS.length} orders placed with Skynet Solution Qatar</p>
      </div>

      <div className="flex flex-col gap-4">
        {ORDERS.map(order => (
          <div
            key={order.id}
            className={`${tw.card} flex flex-wrap items-center justify-between gap-5 p-5 animate-fade-up`}
          >
            <div>
              <div className="mb-1 text-base font-bold text-primary">{order.id}</div>
              <div className="text-[13px] text-muted">
                Placed on {new Date(order.date).toLocaleDateString("en-QA", { day: "numeric", month: "short", year: "numeric" })}
              </div>
              <div className="text-[13px] text-muted">{order.items} item{order.items > 1 ? "s" : ""}</div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`${type.price} text-lg font-extrabold text-accent`}>{formatPrice(order.total)}</span>
              <span className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${STATUS_CLASS[order.status] ?? "bg-bg-soft text-muted"}`}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default OrdersPage;
