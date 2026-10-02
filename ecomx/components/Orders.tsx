"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import * as Icons from "./Icons";
import StoreImage from "@/components/StoreImage";
import { Colors, tw } from "@/lib/theme";
import { ROUTES } from "@/lib/routes";
import { useMyOrders, useMyOrderMutations } from "@/hooks/useOrders";
import { showSuccess } from "@/lib/toast";
import { ORDER_STATUS, ORDER_STATUS_LABEL } from "@/lib/Constant";
import { formatDate, formatPrice } from "@/lib/utils";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import { orderTotal, type ApiOrder } from "@/types/order.types";
import CancelOrderDialog from "@/components/store/CancelOrderDialog";
import StoreAccountLayout from "@/components/store/StoreAccountNav";
import { useAuthStore } from "@/store/auth.store";

type OrderFilter = "all" | "cancelled";

const ORDER_FILTERS: { key: OrderFilter; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "cancelled", label: "Cancelled" },
];

function canCancel(status: string) {
  return status === ORDER_STATUS.PENDING || status === ORDER_STATUS.CONFIRMED;
}

function orderStatusHeadline(order: ApiOrder): string {
  const placed = formatDate(order.createdAt);
  if (order.status === ORDER_STATUS.DELIVERED) {
    const when = order.deliveredAt ? formatDate(order.deliveredAt) : placed;
    return `Delivered on ${when}`;
  }
  if (order.status === ORDER_STATUS.CANCELLED) {
    return `Cancelled on ${placed}`;
  }
  if (order.status === ORDER_STATUS.SHIPPED) {
    return `Shipped · Placed on ${placed}`;
  }
  const label = ORDER_STATUS_LABEL[order.status] ?? order.status;
  return `${label} · Placed on ${placed}`;
}

function statusHeadlineClass(status: string): string {
  switch (status) {
    case ORDER_STATUS.DELIVERED:
      return "text-green-600";
    case ORDER_STATUS.CANCELLED:
    case ORDER_STATUS.REFUNDED:
      return "text-gray-500";
    case ORDER_STATUS.SHIPPED:
    case ORDER_STATUS.PROCESSING:
      return "text-[#0a255d]";
    default:
      return "text-amber-700";
  }
}

function itemImageSrc(item: ApiOrder["items"][number]) {
  return item.thumbnail ?? item.image ?? "/images/products/placeholder.png";
}

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
  const items = order.items;
  const primary = items[0];
  const extraCount = items.length > 1 ? items.length - 1 : 0;
  const previewItems = items.slice(0, 3);
  const total = orderTotal(order);

  return (
    <article className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-[#fafafa] px-4 py-3 sm:px-5">
        <p
          className={`text-[13px] font-semibold sm:text-sm ${statusHeadlineClass(order.status)}`}
        >
          {orderStatusHeadline(order)}
        </p>
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-0.5 text-[13px] font-semibold hover:underline"
          style={{ color: Colors.base_color }}
        >
          View Details
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onView}
        className="flex w-full cursor-pointer gap-4 border-0 bg-white px-4 py-4 text-left transition hover:bg-gray-50/80 sm:px-5"
      >
        <div className="flex shrink-0 items-start gap-2">
          {previewItems.map((item, index) => (
            <div
              key={`${item.productId}-${index}`}
              className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-sm border border-gray-100 sm:h-20 sm:w-20 ${productImageSurfaceClass}`}
            >
              <StoreImage
                src={itemImageSrc(item)}
                alt={item.name}
                className="h-full w-full object-contain p-1"
              />
              {index === 2 && items.length > 3 ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-bold text-white">
                  +{items.length - 3}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          {primary ? (
            <>
              <p className="line-clamp-2 text-sm font-medium text-gray-900 sm:text-[15px]">
                {primary.name}
              </p>
              {primary.variant ? (
                <p className="mt-0.5 text-xs text-gray-500">{primary.variant}</p>
              ) : null}
              <p className="mt-1 text-xs text-gray-500">
                Qty: {primary.quantity}
                {extraCount > 0 ? (
                  <span className="text-gray-600"> · and {extraCount} more item{extraCount !== 1 ? "s" : ""}</span>
                ) : null}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600">No items</p>
          )}
        </div>

        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-base font-bold text-gray-900">{formatPrice(total)}</p>
        </div>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:px-5">
        <div className="min-w-0 text-xs text-gray-600 sm:text-[13px]">
          <span className="font-semibold text-gray-800">Order #{order.orderNumber}</span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="font-semibold text-gray-900 sm:hidden">{formatPrice(total)}</span>
          <span className="hidden sm:inline">Total: {formatPrice(total)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canCancel(order.status) ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              disabled={cancelling}
              className="rounded-sm border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onView}
            className={`${tw.btnPrimarySm} !rounded-sm !px-4`}
          >
            View Order
          </button>
        </div>
      </div>
    </article>
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
  const authUser = useAuthStore((s) => s.user);
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

  const ordersMain = (
    <>
      <div className="mb-4 border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4 lg:rounded-sm lg:border lg:border-gray-200 lg:bg-white lg:shadow-sm">
        <h1 className="text-base font-semibold text-gray-900 sm:text-lg">My Orders</h1>
        <p className="mt-1 text-sm text-gray-600">
          {isLoggedIn
            ? `${total} order${total !== 1 ? "s" : ""} on your account`
            : "Sign in to view your orders"}
        </p>
      </div>

      {!isHydrated ? (
        <p className="py-12 text-center text-sm text-muted">Loading...</p>
      ) : !isLoggedIn ? (
        <div className="rounded-sm border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="mb-4 text-sm text-gray-600">Please sign in to see your order history.</p>
          <button type="button" onClick={onLoginOpen} className={`${tw.btnPrimary} mx-auto`}>
            Sign In
          </button>
        </div>
      ) : isLoading ? (
        <p className="py-12 text-center text-sm text-gray-500">Loading orders...</p>
      ) : isError ? (
        <div className="rounded-sm border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-3 text-sm text-red-700">Failed to load orders.</p>
          <button type="button" onClick={() => void refetch()} className={tw.btnOutline}>
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-sm border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="mb-4 text-sm text-gray-600">
            {filter === "cancelled"
              ? "You don't have any cancelled orders."
              : "You haven't placed any orders yet."}
          </p>
          {filter === "cancelled" ? (
            <button type="button" onClick={() => handleFilterChange("all")} className={tw.btnOutline}>
              View All Orders
            </button>
          ) : (
            <button type="button" onClick={() => router.push(ROUTES.shop)} className={tw.btnPrimary}>
              Browse Products
            </button>
          )}
        </div>
      ) : (
        <div className="px-0 sm:px-0 lg:rounded-sm lg:border lg:border-gray-200 lg:bg-white lg:p-4 lg:shadow-sm">
          <div className="mb-4 flex flex-wrap gap-2">
            {ORDER_FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleFilterChange(item.key)}
                className={`rounded-sm px-4 py-2 text-sm font-semibold transition ${
                  filter === item.key
                    ? "text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
                style={filter === item.key ? { background: Colors.base_color } : undefined}
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
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-sm border border-gray-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-sm border border-gray-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      )}
    </>
  );

  return (
    <div className={`${tw.pageTopOffset} min-h-screen bg-[#f1f3f6] pb-24`}>
      <div className="mx-auto max-w-[1200px] px-4 pt-2 sm:px-6">
        <button type="button" onClick={onBack} className={`${tw.storeBackLink} mb-4`}>
          <Icons.ChevronLeft /> Back
        </button>

        {isHydrated && isLoggedIn && authUser ? (
          <StoreAccountLayout
            active="orders"
            userName={authUser.name}
            userEmail={authUser.email}
            avatarUrl={authUser.avatar}
          >
            {ordersMain}
          </StoreAccountLayout>
        ) : (
          ordersMain
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
