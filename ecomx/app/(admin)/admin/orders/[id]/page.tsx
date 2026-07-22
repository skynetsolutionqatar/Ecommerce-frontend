"use client";

import { use, useState } from "react";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import ViewSection from "@/components/admin/utils/ViewSection";
import ViewField from "@/components/admin/utils/ViewField";
import { ORDER_STATUS_LIST } from "@/lib/Constant";
import { useOrder, useOrderMutations } from "@/hooks/useOrders";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { orderAddress, orderTotal } from "@/types/order.types";

const TABS = [
  { key: "summary", label: "Summary" },
  { key: "items", label: "Items" },
  { key: "shipping", label: "Shipping" },
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
          <p className="text-sm text-red-400">Failed to load order</p>
        </div>
      </BackPanel>
    );
  }

  const address = orderAddress(order);

  return (
    <BackPanel tabs={TABS}>
      <div className="space-y-6">
        <ViewSection id="summary" title="Order Summary">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField label="Order Number" value={order.orderNumber} />
            <ViewField
              label="Customer"
              value={typeof order.customerId === "object" ? order.customerId.name : "—"}
            />
            <ViewField label="Subtotal" value={formatPrice(order.subtotal)} />
            <ViewField label="Shipping" value={formatPrice(order.shippingCharge ?? 0)} />
            <ViewField label="Discount" value={formatPrice(order.discountAmount ?? 0)} />
            <ViewField label="Total" value={formatPrice(orderTotal(order))} />
            <ViewField label="Status" value={order.status} badge badgeColor="blue" />
            <ViewField label="Payment status" value={order.paymentStatus ?? "—"} />
            <ViewField label="Date" value={formatDateTime(order.createdAt)} />
            <ViewField label="Payment method" value={order.paymentMethod ?? "—"} />
            <ViewField label="Tracking #" value={order.trackingNumber ?? "—"} />
            <ViewField label="Coupon" value={order.couponCode ?? "—"} />
          </div>

          <div className="mt-6 rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Update Status</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select status</option>
                {ORDER_STATUS_LIST.map((s) => (
                  <option key={s} value={s}>{s}</option>
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
              className="mt-3 rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
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
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
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
      </div>
    </BackPanel>
  );
}
