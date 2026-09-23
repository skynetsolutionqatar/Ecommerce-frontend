"use client";

import { use, useMemo, useState } from "react";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import ViewSection from "@/components/admin/utils/ViewSection";
import ViewField from "@/components/admin/utils/ViewField";
import {
  allowedTransitions,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_LIST,
  OrderStatus,
} from "@/lib/Constant";
import { useOrder, useOrderMutations } from "@/hooks/useOrders";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { orderAddress, orderTotal } from "@/types/order.types";
import DownloadInvoiceButton from "@/components/store/DownloadInvoiceButton";
import { colors } from "@/components/admin/utils/Colors";
import { ORDER_STATUS } from "@/lib/Constant";

const TABS = [
  { key: "summary", label: "Summary" },
  { key: "items", label: "Items" },
  { key: "shipping", label: "Shipping" },
  { key: "attribution", label: "Attribution" },
];

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading, isError } = useOrder(id);
  const { updateStatus } = useOrderMutations();
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleUpdate = async () => {
    if (!newStatus || !order) return;
    await updateStatus.mutateAsync({
      id: order._id,
      status: newStatus,
      note: note.trim() || undefined,
      trackingNumber: trackingNumber.trim() || undefined,
    });
    toast.success("Order status updated");
    setNewStatus("");
    setNote("");
    setTrackingNumber("");
  };

  const toUpdateStatus = useMemo<OrderStatus[]>(() => {
    if (!order?.status) return [];
    return allowedTransitions[order.status];
  }, [order?.status]);

  if (isLoading) {
    return (
      <BackPanel>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </BackPanel>
    );
  }

  if (isError || !order) {
    return (
      <BackPanel>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-red-400">Failed to load orders</p>
        </div>
      </BackPanel>
    );
  }

  const address = orderAddress(order);
  const isDelivered = order.status === ORDER_STATUS.DELIVERED;

  // const toUpdateStatus = useMemo(() => {
  //   if (!order?.status) return [];

  //   return allowedTransitions[order?.status as OrderStatus] || [];
  // }, [order?.status]);

  return (
    <BackPanel tabs={TABS}>
      <div className="space-y-6">
        <ViewSection id="summary" title="Order Summary">
          {isDelivered ? (
            <div className="mb-4">
              <DownloadInvoiceButton
                orderId={order._id}
                orderNumber={order.orderNumber}
                admin
                className="rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50"
              />
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Order Number" value={order.orderNumber} />
            <ViewField
              label="Customer"
              value={
                typeof order.customerId === "object"
                  ? order.customerId.name
                  : "—"
              }
            />
            <ViewField label="Subtotal" value={formatPrice(order.subtotal)} />
            <ViewField
              label="Shipping"
              value={formatPrice(order.shippingCharge ?? 0)}
            />
            <ViewField
              label="Discount"
              value={formatPrice(order.discountAmount ?? 0)}
            />
            <ViewField label="Total" value={formatPrice(orderTotal(order))} />
            <ViewField
              label="Status"
              value={order.status}
              badge
              badgeColor="blue"
            />
            <ViewField
              label="Payment status"
              value={order.paymentStatus ?? "—"}
            />
            <ViewField label="Date" value={formatDateTime(order.createdAt)} />
            <ViewField
              label="Payment method"
              value={order.paymentMethod ?? "—"}
            />
            <ViewField label="Tracking #" value={order.trackingNumber ?? "—"} />
            <ViewField label="Coupon" value={order.couponCode ?? "—"} />
          </div>

          <div className="mt-6 rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Update Status
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select status</option>
                {ORDER_STATUS_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select> */}

              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select status</option>

                {toUpdateStatus.map((status: any) => (
                  <option key={status} value={status}>
                    {ORDER_STATUS_LABEL[status as OrderStatus]}
                  </option>
                ))}
              </select>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking number (optional)"
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-black"
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Status note (optional)"
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-black md:col-span-2"
              />
            </div>
            <button
              type="button"
              onClick={() => void handleUpdate()}
              disabled={!newStatus || updateStatus.isPending}
              className={`mt-3 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50 ${colors.primaryButton}`}
            >
              {updateStatus.isPending ? "Updating…" : "Update Status"}
            </button>
          </div>
        </ViewSection>

        <ViewSection id="items" title="Order Items">
          <div className="divide-y rounded-lg border">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-mono text-sm font-semibold">
                  {formatPrice(item.subtotal ?? item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </ViewSection>

        <ViewSection id="shipping" title="Delivery Address">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Name" value={address.fullName} />
            <ViewField label="Phone" value={address.phone} />
            <ViewField label="Address" value={address.line1} />
            <ViewField label="City" value={address.city} />
            <ViewField label="Country" value={address.country} />
          </div>
        </ViewSection>

        <ViewSection id="attribution" title="Marketing Attribution">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField
              label="UTM Source"
              value={order.attribution?.utm_source ?? "direct"}
            />
            <ViewField
              label="UTM Medium"
              value={order.attribution?.utm_medium || "—"}
            />
            <ViewField
              label="UTM Campaign"
              value={order.attribution?.utm_campaign || "—"}
            />
            <ViewField
              label="UTM Term"
              value={order.attribution?.utm_term || "—"}
            />
            <ViewField
              label="UTM Content"
              value={order.attribution?.utm_content || "—"}
            />
            <ViewField
              label="Captured At"
              value={
                order.attribution?.capturedAt
                  ? formatDateTime(order.attribution.capturedAt)
                  : "—"
              }
            />
          </div>
        </ViewSection>
      </div>
    </BackPanel>
  );
}
