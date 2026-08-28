"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "./Icons";
import { tw, type } from "@/lib/theme";
import { ROUTES } from "@/lib/routes";
import { useMyOrders, useMyOrderMutations } from "@/hooks/useOrders";
import { showSuccess } from "@/lib/toast";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
} from "@/lib/Constant";
import { formatDate, formatPrice } from "@/lib/utils";
import { orderTotal, type ApiOrder } from "@/types/order.types";
import CancelOrderDialog from "@/components/store/CancelOrderDialog";

const STATUS_CLASS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: "bg-amber-500/15 text-amber-700 border border-amber-200",
  [ORDER_STATUS.CONFIRMED]: "bg-blue-500/15 text-blue-700 border border-blue-200",
  [ORDER_STATUS.PROCESSING]: "bg-indigo-500/15 text-indigo-700 border border-indigo-200",
  [ORDER_STATUS.SHIPPED]: "bg-purple-500/15 text-purple-700 border border-purple-200",
  [ORDER_STATUS.DELIVERED]: "bg-gray-200 text-gray-700 border border-gray-300",
  [ORDER_STATUS.CANCELLED]: "bg-red-500/15 text-red-700 border border-red-200",
  [ORDER_STATUS.REFUNDED]: "bg-slate-200 text-slate-700 border border-slate-300",
};

function canCancel(status: string) {
  return status === ORDER_STATUS.PENDING || status === ORDER_STATUS.CONFIRMED;
}

type OrderFilter = "all" | "cancelled";

const ORDER_FILTERS: { key: OrderFilter; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "cancelled", label: "Cancelled" },
];

function OrderCard({
  order,
  onView,
  onCancel,
  cancelling,
}: {
  order: ApiOrder;
  onView: () => void;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={`${tw.card} flex flex-col gap-4 p-5 animate-fade-up sm:flex-row sm:items-center sm:justify-between`}>
      <div className="min-w-0">
        <div className="mb-1 text-base font-bold text-primary">{order.orderNumber}</div>
        <div className="text-[13px] text-muted">
          Placed on {formatDate(order.createdAt)}
        </div>
        <div className="text-[13px] text-muted">
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className={`${type.price} text-lg font-extrabold text-accent`}>
          {formatPrice(orderTotal(order))}
        </span>
        <span
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
            STATUS_CLASS[order.status] ?? "bg-bg-soft text-muted"
          }`}
        >
          {ORDER_STATUS_LABEL[order.status] ?? order.status}
        </span>
        <button
          type="button"
          onClick={onView}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-semibold text-gray-700 hover:bg-gray-50"
        >
          View
        </button>
        {canCancel(order.status) ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={cancelling}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

interface OrdersPageProps {
  onBack: () => void;
  isLoggedIn: boolean;
  isHydrated: boolean;
  onLoginOpen: () => void;
}

export default function OrdersPage({
  onBack,
  isLoggedIn,
  isHydrated,
  onLoginOpen,
}: OrdersPageProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [cancelTarget, setCancelTarget] = useState<ApiOrder | null>(null);

  const { data, isLoading, isError, refetch } = useMyOrders(
    {
      page,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...(filter === "cancelled" ? { status: ORDER_STATUS.CANCELLED } : {}),
    },
    isHydrated && isLoggedIn
  );

  const { cancel } = useMyOrderMutations();

  const orders = data?.orders ?? [];
  const total = data?.pagination?.total ?? orders.length;
  const totalPages = data?.pagination?.totalPages ?? 1;

  const handleFilterChange = (next: OrderFilter) => {
    setFilter(next);
    setPage(1);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    await cancel.mutateAsync(cancelTarget._id);
    showSuccess("Order cancelled");
    setCancelTarget(null);
  };

  return (
    <div className={`${tw.pageTopOffset} min-h-screen ${tw.sectionBg} pb-24`}>
      <div className="mx-auto max-w-[900px] px-4 pt-2 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className={`${tw.storeBackLink} mb-6`}
        >
          <Icons.ChevronLeft /> Back
        </button>

        <div className="mb-8 rounded-3xl bg-[#0a255dff] px-6 py-8 text-white shadow-[0_12px_40px_rgba(0,0,0,0.15)] sm:px-8 sm:py-10">
          <div className={`mb-2 ${type.eyebrow} text-[13px] md:text-[11px] text-white/75`}>
            Order History
          </div>
          <h1 className="font-display text-[28px] font-bold sm:text-[32px]">My Orders</h1>
          <p className="mt-2 text-sm text-white/65">
            {isLoggedIn ? `${total} order${total !== 1 ? "s" : ""} placed` : "Sign in to view your orders"}
          </p>
        </div>

        {!isHydrated ? (
          <p className="text-center text-sm text-muted py-12">Loading...</p>
        ) : !isLoggedIn ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center">
            <p className="mb-4 text-sm text-muted">Please sign in to see your order history.</p>
            <button type="button" onClick={onLoginOpen} className={`${tw.btnPrimary} mx-auto`}>
              Sign In
            </button>
          </div>
        ) : isLoading ? (
          <p className="text-center text-sm text-muted py-12">Loading orders...</p>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="mb-3 text-sm text-red-700">Failed to load orders.</p>
            <button type="button" onClick={() => void refetch()} className={tw.btnOutline}>
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center">
            <p className="mb-4 text-sm text-muted">
              {filter === "cancelled"
                ? "You don't have any cancelled orders."
                : "You haven't placed any orders yet."}
            </p>
            {filter === "cancelled" ? (
              <button
                type="button"
                onClick={() => handleFilterChange("all")}
                className={tw.btnOutline}
              >
                View All Orders
              </button>
            ) : (
              <button type="button" onClick={() => router.push(ROUTES.shop)} className={tw.btnPrimary}>
                Browse Products
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap gap-2">
              {ORDER_FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleFilterChange(item.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filter === item.key
                      ? "bg-[#0a255dff] text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onView={() => router.push(ROUTES.orderDetail(order._id))}
                  onCancel={() => setCancelTarget(order)}
                  cancelling={cancel.isPending && cancelTarget?._id === order._id}
                />
              ))}
            </div>
            {totalPages > 1 ? (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      <CancelOrderDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        orderNumber={cancelTarget?.orderNumber}
        onConfirm={handleConfirmCancel}
        loading={cancel.isPending}
      />
    </div>
  );
}
