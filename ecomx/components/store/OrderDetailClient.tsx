"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "@/components/Icons";
import { tw } from "@/lib/theme";
import { ROUTES } from "@/lib/routes";
import { useMyOrder, useMyOrderMutations } from "@/hooks/useOrders";
import { useMyReviews } from "@/hooks/useReviews";
import { ORDER_STATUS, ORDER_STATUS_LABEL } from "@/lib/Constant";
import { reviewedProductIds } from "@/lib/store/review-eligibility";
import { formatDate, formatPrice } from "@/lib/utils";
import { orderAddress, orderTotal } from "@/types/order.types";
import StoreImage from "@/components/StoreImage";
import OrderStatusTracker from "@/components/store/OrderStatusTracker";
import WriteReviewModal from "@/components/store/WriteReviewModal";

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700",
  confirmed: "bg-blue-500/15 text-blue-700",
  processing: "bg-indigo-500/15 text-indigo-700",
  shipped: "bg-purple-500/15 text-purple-700",
  delivered: "bg-green-500/15 text-green-700",
  cancelled: "bg-red-500/15 text-red-700",
};

export default function OrderDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: order, isLoading, isError } = useMyOrder(id);
  const { cancel } = useMyOrderMutations();
  const [reviewTarget, setReviewTarget] = useState<{
    productId: string;
    productName: string;
  } | null>(null);

  const isDelivered = order?.status === ORDER_STATUS.DELIVERED;
  const { data: myReviewsData, refetch: refetchMyReviews } = useMyReviews(
    { limit: 100 },
    isDelivered
  );
  const reviewedIds = useMemo(
    () => reviewedProductIds(myReviewsData?.reviews ?? []),
    [myReviewsData?.reviews]
  );

  const canCancel =
    order?.status === ORDER_STATUS.PENDING || order?.status === ORDER_STATUS.CONFIRMED;

  const handleCancel = async () => {
    if (!order || !window.confirm("Cancel this order?")) return;
    await cancel.mutateAsync(order._id);
  };

  if (isLoading) {
    return (
      <div className={`${tw.pageTopOffset} flex min-h-[50vh] items-center justify-center`}>
        <p className="text-sm text-muted">Loading order...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className={`${tw.pageTopOffset} mx-auto max-w-[900px] px-4 py-12 text-center`}>
        <p className="mb-4 text-sm text-muted">Order not found.</p>
        <button type="button" onClick={() => router.push(ROUTES.orders)} className={tw.btnPrimary}>
          Back to Orders
        </button>
      </div>
    );
  }

  const address = orderAddress(order);

  return (
    <div className={`${tw.pageTopOffset} min-h-screen ${tw.sectionBg} pb-24`}>
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        <button
          type="button"
          onClick={() => router.push(ROUTES.orders)}
          className="mb-6 flex items-center gap-1 border-0 bg-transparent text-[13px] font-semibold text-accent cursor-pointer"
        >
          <Icons.ChevronLeft /> My Orders
        </button>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-primary">{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-muted">Placed {formatDate(order.createdAt)}</p>
          </div>
          <span
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
              STATUS_CLASS[order.status] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {ORDER_STATUS_LABEL[order.status]}
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-white p-5">
              <h2 className="mb-4 text-sm font-bold text-primary">Items</h2>
              <div className="flex flex-col gap-4">
                {order.items.map((item, i) => (
                  <div key={`${item.productId}-${i}`} className="flex gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                      <StoreImage
                        src={item.thumbnail ?? item.image ?? "/images/products/placeholder.png"}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-muted">Qty: {item.quantity}</p>
                      {isDelivered ? (
                        reviewedIds.has(item.productId) ? (
                          <p className="mt-1 text-[11px] font-semibold text-green-600">
                            Review submitted
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setReviewTarget({
                                productId: item.productId,
                                productName: item.name,
                              })
                            }
                            className="mt-2 cursor-pointer rounded-lg border border-blue-600 px-3 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50"
                          >
                            Write Review
                          </button>
                        )
                      ) : null}
                    </div>
                    <p className="text-sm font-bold text-accent">
                      {formatPrice((item.subtotal ?? item.price * item.quantity))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <OrderStatusTracker order={order} />
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-white p-5">
              <h2 className="mb-3 text-sm font-bold text-primary">Summary</h2>
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.shippingCharge != null ? (
                <div className="flex justify-between text-sm py-1">
                  <span className="text-muted">Shipping</span>
                  <span>{formatPrice(order.shippingCharge)}</span>
                </div>
              ) : null}
              <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
                <span>Total</span>
                <span className="text-accent">{formatPrice(orderTotal(order))}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5">
              <h2 className="mb-3 text-sm font-bold text-primary">Delivery</h2>
              <p className="text-sm font-medium text-gray-900">{address.fullName}</p>
              <p className="text-sm text-muted">{address.phone}</p>
              <p className="mt-2 text-sm text-muted">
                {[address.line1, address.line2, address.city, address.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {order.trackingNumber ? (
                <p className="mt-3 text-xs font-semibold text-primary">
                  Tracking: {order.trackingNumber}
                </p>
              ) : null}
            </div>

            {canCancel ? (
              <button
                type="button"
                onClick={() => void handleCancel()}
                disabled={cancel.isPending}
                className="rounded-xl border border-red-200 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {cancel.isPending ? "Cancelling..." : "Cancel Order"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {reviewTarget && order ? (
        <WriteReviewModal
          open
          productId={reviewTarget.productId}
          orderId={order._id}
          productName={reviewTarget.productName}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => void refetchMyReviews()}
        />
      ) : null}
    </div>
  );
}
