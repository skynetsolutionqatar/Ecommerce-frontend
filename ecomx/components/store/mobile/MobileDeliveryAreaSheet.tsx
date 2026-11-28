"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import DeliveryCheckPanel from "@/components/store/DeliveryCheckPanel";

export default function MobileDeliveryAreaSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-end justify-center bg-black/45 md:items-center md:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[min(92dvh,640px)] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl md:max-w-lg md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-delivery-area-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
          <h2 id="mobile-delivery-area-title" className="text-base font-extrabold text-gray-900">
            Delivery area
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-gray-100 text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <DeliveryCheckPanel />
        </div>
      </div>
    </div>
  );
}