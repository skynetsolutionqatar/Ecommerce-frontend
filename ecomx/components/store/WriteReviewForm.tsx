"use client";

import { useState } from "react";
import StarRatingInput from "@/components/store/StarRatingInput";
import { useCreateReview } from "@/hooks/useReviews";
import { showError, showSuccess } from "@/lib/toast";

interface WriteReviewFormProps {
  productId: string;
  orderId: string;
  productName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export default function WriteReviewForm({
  productId,
  orderId,
  productName,
  onSuccess,
  onCancel,
  compact = false,
}: WriteReviewFormProps) {
  const createReview = useCreateReview();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1) {
      showError("Please select a star rating");
      return;
    }
    if (!body.trim()) {
      showError("Please write your review");
      return;
    }

    try {
      await createReview.mutateAsync({
        productId,
        orderId,
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
      });
      showSuccess("Review submitted..!");
      onSuccess?.();
    } catch {
      // Global mutation error toast handles API failures.
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500";

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className={compact ? "space-y-3" : "space-y-4"}>
      {productName ? (
        <p className="text-sm font-semibold text-gray-900">{productName}</p>
      ) : null}

      <div>
        <label className="mb-2 block text-sm md:text-xs font-bold text-gray-600">Your rating</label>
        <StarRatingInput
          value={rating}
          onChange={setRating}
          size={compact ? 24 : 28}
          disabled={createReview.isPending}
        />
      </div>

      <div>
        <label htmlFor="review-title" className="mb-1.5 block text-sm md:text-xs font-bold text-gray-600">
          Title <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={120}
          className={inputClass}
          disabled={createReview.isPending}
        />
      </div>

      <div>
        <label htmlFor="review-body" className="mb-1.5 block text-sm md:text-xs font-bold text-gray-600">
          Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did you like or dislike?"
          rows={compact ? 3 : 4}
          maxLength={2000}
          required
          className={`${inputClass} resize-y min-h-[80px]`}
          disabled={createReview.isPending}
        />
      </div>

      <p className="text-[13px] md:text-[11px] text-gray-400">
        Reviews are moderated before they appear on the product page.
      </p>

      <div className="flex flex-wrap gap-2 pt-1">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={createReview.isPending}
            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={createReview.isPending || rating < 1 || !body.trim()}
          className="cursor-pointer rounded-lg bg-blue-700 px-5 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createReview.isPending ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
