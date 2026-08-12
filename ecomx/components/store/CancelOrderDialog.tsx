"use client";

import { X } from "lucide-react";

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export default function CancelOrderDialog({
  open,
  onOpenChange,
  orderNumber,
  onConfirm,
  loading = false,
}: CancelOrderDialogProps) {
  if (!open) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // Keep dialog open — caller shows error toast
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-gray-900">Cancel this order?</h2>
            <p className="mt-2 text-sm text-gray-600">
              {orderNumber ? (
                <>
                  Order <strong className="text-gray-900">{orderNumber}</strong> will be cancelled.
                  This action cannot be undone.
                </>
              ) : (
                "This order will be cancelled. This action cannot be undone."
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => !loading && onOpenChange(false)}
            aria-label="Close"
            disabled={loading}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            No, keep order
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={loading}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Cancelling..." : "Yes, cancel order"}
          </button>
        </div>
      </div>
    </div>
  );
}
