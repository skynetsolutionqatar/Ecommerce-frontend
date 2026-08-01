"use client";

import { X } from "lucide-react";
import WriteReviewForm from "@/components/store/WriteReviewForm";

interface WriteReviewModalProps {
  open: boolean;
  productId: string;
  orderId: string;
  productName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WriteReviewModal({
  open,
  productId,
  orderId,
  productName,
  onClose,
  onSuccess,
}: WriteReviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-gray-100 bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-gray-900">Write a Review</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <X size={18} />
          </button>
        </div>
        <WriteReviewForm
          productId={productId}
          orderId={orderId}
          productName={productName}
          onCancel={onClose}
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
        />
      </div>
    </div>
  );
}
