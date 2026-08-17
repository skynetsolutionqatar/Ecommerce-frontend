"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Icons from "@/components/Icons";
import StarRating from "@/components/store/product/StarRating";
import { useProductBySlug } from "@/hooks/useProducts";
import { useProductReviews } from "@/hooks/useReviews";
import { apiProductToStoreProduct } from "@/lib/store/product-mapper";
import { ROUTES } from "@/lib/routes";
import { tw } from "@/lib/theme";
import { formatDate } from "@/lib/utils";
import { reviewBody, type ApiReview } from "@/types/review.types";

const PAGE_SIZE = 10;

function reviewCustomerName(customerId: ApiReview["customerId"]) {
  if (typeof customerId === "object" && customerId?.name) return customerId.name;
  return "Customer";
}

export default function ProductReviewsPageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useProductBySlug(slug);
  const product = data ? apiProductToStoreProduct(data) : null;

  const reviews = useProductReviews(product?.id ?? "", {
    page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
  });

  const reviewList = reviews.data?.reviews ?? [];
  const totalPages = reviews.data?.pagination?.totalPages ?? 1;
  const total = reviews.data?.pagination?.total ?? reviewList.length;

  if (isLoading) {
    return (
      <div className={`${tw.pageTopOffset} flex min-h-[50vh] items-center justify-center`}>
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (!product || isError) {
    return (
      <div className={`${tw.pageTopOffset} mx-auto max-w-[900px] px-4 py-12 text-center`}>
        <p className="mb-4 text-sm text-muted">Product not found.</p>
        <button type="button" onClick={() => router.push(ROUTES.shop)} className={tw.btnPrimary}>
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className={`${tw.pageTopOffset} min-h-screen ${tw.sectionBg} pb-24`}>
      <div className="mx-auto max-w-[900px] px-4 pt-2 sm:px-6">
        <Link href={ROUTES.product(slug)} className={`${tw.storeBackLink} mb-6 inline-flex`}>
          <Icons.ChevronLeft /> {product.name}
        </Link>

        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-primary">Customer Reviews</h1>
          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={product.rating} size={16} />
            <span className="text-sm text-muted">
              {product.rating} · {total} review{total === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {reviews.isLoading ? (
            <p className="text-sm text-muted">Loading reviews...</p>
          ) : reviewList.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-8 text-center">
              <p className="text-sm text-muted">No reviews yet.</p>
            </div>
          ) : (
            reviewList.map((rev) => {
              const name = reviewCustomerName(rev.customerId);
              const body = reviewBody(rev);
              return (
                <div key={rev._id} className="rounded-2xl border border-border bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{name}</p>
                        {rev.location ? (
                          <p className="text-xs text-muted">{rev.location}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right">
                      <StarRating rating={rev.rating} size={12} />
                      <p className="mt-0.5 text-xs text-muted">{formatDate(rev.createdAt)}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    {rev.orderId ? (
                      <span className="mb-1.5 inline-block rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                        Verified Purchase
                      </span>
                    ) : null}
                    {rev.title ? (
                      <p className="text-sm font-semibold text-gray-900">{rev.title}</p>
                    ) : null}
                    {body ? <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p> : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-muted">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
