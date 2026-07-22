"use client";
import { useState } from "react";
import { REVIEWS } from "@/lib/data";
import { tw } from "@/lib/theme";
import type { Review } from "@/lib/types";
import Avatar from "./Avatar";
import * as Icons from "./Icons";

interface ReviewsSectionProps {
  productId: number;
  rating: number;
  reviewCount: number;
}

export default function ReviewsSection({ productId, rating, reviewCount }: ReviewsSectionProps) {
  const reviews = REVIEWS.filter(r => r.productId === productId);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [helpfulClicked, setHelpfulClicked] = useState<Set<number>>(new Set());

  const displayed = filterRating ? reviews.filter(r => r.rating === filterRating) : reviews;

  const breakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  return (
    <section className="border-t border-border py-15 pb-10">
      <h2 className="mb-9 font-display text-[32px] font-bold text-primary">
        Customer Reviews
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <div className="rounded-3xl bg-bg-soft p-7">
          <div className="mb-6 text-center">
            <div className="font-mono text-[64px] font-bold leading-none text-primary">{rating}</div>
            <div className="my-2 flex justify-center gap-0.5 text-accent">
              {[1, 2, 3, 4, 5].map(i => <Icons.Star key={i} filled={i <= Math.round(rating)} />)}
            </div>
            <div className="text-[13px] text-muted">
              Based on {reviewCount.toLocaleString()} reviews
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {breakdown.map(({ star, count, pct }) => (
              <button
                key={star}
                type="button"
                onClick={() => setFilterRating(filterRating === star ? null : star)}
                className={`flex items-center gap-2 border-0 bg-transparent cursor-pointer rounded-md py-0.5 ${
                  filterRating === star ? "outline outline-2 outline-accent" : ""
                }`}
              >
                <span className="w-3 text-right text-xs text-muted">{star}</span>
                <span className="text-accent"><Icons.Star filled /></span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-border">
                  <div className="h-full rounded bg-accent transition-all duration-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-7 text-[11px] text-muted">{count}</span>
              </button>
            ))}
          </div>

          {filterRating && (
            <button
              type="button"
              onClick={() => setFilterRating(null)}
              className="mt-4 w-full border-0 bg-transparent text-xs font-semibold text-accent underline cursor-pointer"
            >
              Clear filter
            </button>
          )}

          <button type="button" className={`${tw.btnOutline} w-full justify-center mt-5 text-[13px]`}>
            Write a Review
          </button>
        </div>

        <div>
          {filterRating && (
            <div className="mb-5 rounded-xl bg-accent-soft px-4 py-2.5 text-[13px] text-primary">
              Showing {displayed.length} review{displayed.length !== 1 ? "s" : ""} with {filterRating} star{filterRating !== 1 ? "s" : ""}
            </div>
          )}

          {displayed.length === 0 ? (
            <div className="py-10 text-center text-muted">
              No reviews for this rating yet
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {displayed.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isHelpfulClicked={helpfulClicked.has(review.id)}
                  onHelpful={() => {
                    if (!helpfulClicked.has(review.id)) {
                      setHelpfulClicked(prev => new Set([...prev, review.id]));
                    }
                  }}
                />
              ))}
            </div>
          )}

          {reviews.length === 0 && (
            <div className="py-10 text-center">
              <p className="mb-4 text-muted">No reviews yet — be the first!</p>
              <button type="button" className={tw.btnPrimary}>Write the First Review</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review, isHelpfulClicked, onHelpful }: { review: Review; isHelpfulClicked: boolean; onHelpful: () => void }) {
  return (
    <div className={`rounded-[20px] border border-border bg-white p-6 shadow-[0_2px_12px_color-mix(in_srgb,var(--color-primary)_5%,transparent)]`}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Avatar name={review.name} size={36} />
          <div>
            <div className="text-sm font-semibold text-primary">{review.name}</div>
            <div className="text-[11px] text-muted">{review.location}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex justify-end gap-0.5 text-accent">
            {[1, 2, 3, 4, 5].map(i => <Icons.Star key={i} filled={i <= review.rating} />)}
          </div>
          <div className="mt-1 text-[11px] text-muted">{review.date}</div>
        </div>
      </div>

      <div className="mb-2 text-[15px] font-bold text-primary">{review.title}</div>
      <p className="mb-3.5 text-sm leading-relaxed text-primary/80">{review.text}</p>

      <div className="flex items-center justify-between border-t border-bg-soft pt-3">
        <div className="flex flex-wrap gap-2">
          {review.verified && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
              ✓ Verified Purchase
            </span>
          )}
          <span className="rounded-full bg-bg-soft px-2.5 py-0.5 text-[11px] text-muted">
            {review.variant}
          </span>
        </div>
        <button
          type="button"
          onClick={onHelpful}
          className={`rounded-full px-2.5 py-1 text-xs cursor-pointer transition-all ${
            isHelpfulClicked
              ? "border border-gray-200 bg-gray-100 text-gray-700"
              : "border-0 bg-transparent text-muted"
          }`}
        >
          {isHelpfulClicked ? "✓ Helpful" : `👍 Helpful (${review.helpful})`}
        </button>
      </div>
    </div>
  );
}
