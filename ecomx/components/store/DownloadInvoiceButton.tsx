"use client";

import { useState } from "react";
import { orderApi } from "@/lib/api/order.api";
import { showError, showSuccess } from "@/lib/toast";

type Props = {
  orderId: string;
  orderNumber: string;
  admin?: boolean;
  className?: string;
};

export default function DownloadInvoiceButton({
  orderId,
  orderNumber,
  admin = false,
  className,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      if (admin) {
        await orderApi.downloadInvoice(orderId, orderNumber);
      } else {
        await orderApi.downloadMyInvoice(orderId, orderNumber);
      }
      showSuccess("Invoice downloaded");
    } catch (err) {
      showError(err, "Could not download invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleDownload()}
      disabled={loading}
      className={
        className ??
        "rounded-xl border border-border bg-white py-2.5 text-sm font-bold text-primary hover:bg-gray-50 disabled:opacity-50"
      }
    >
      {loading ? "Downloading…" : "Download Invoice"}
    </button>
  );
}
