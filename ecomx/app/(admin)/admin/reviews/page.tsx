"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin/utils/PageHeader";
import {
  ListPageShell,
  ListPagination,
  ListTableCard,
  ListToolbar,
} from "@/components/admin/shared";
import { REVIEW_STATUS } from "@/lib/Constant";
import { ADMIN_ROUTES } from "@/lib/config";
import { useReviews, useReviewMutations } from "@/hooks/useReviews";
import { paginateClientList, LIST_PAGE_SIZE } from "@/lib/admin/client-pagination";
import { formatDate } from "@/lib/utils";
import { reviewBody, type ApiReview } from "@/types/review.types";

const STATUS_OPTIONS = [
  { label: "Pending", value: REVIEW_STATUS.PENDING },
  { label: "Approved", value: REVIEW_STATUS.APPROVED },
  { label: "Rejected", value: REVIEW_STATUS.REJECTED },
];

export default function AdminReviewsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const { data: reviews, isLoading, isError, error } = useReviews({
    limit: 50,
    ...(statusFilter ? { status: statusFilter as ApiReview["status"] } : {}),
  });
  const { moderate } = useReviewMutations();

  const filteredReviews = useMemo(() => {
    const list = reviews ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((review) => {
      const productName =
        typeof review.productId === "object" ? review.productId.name : "";
      const customerName =
        typeof review.customerId === "object" ? review.customerId.name : "";
      return (
        productName.toLowerCase().includes(q) ||
        customerName.toLowerCase().includes(q) ||
        reviewBody(review).toLowerCase().includes(q)
      );
    });
  }, [reviews, search]);

  const pagination = paginateClientList(filteredReviews, page, LIST_PAGE_SIZE);
  const pagedReviews = pagination.items;

  const handlers = useMemo(
    () => ({
      onSearch: (value: string) => {
        setSearch(value);
        setPage(1);
      },
      onStatus: (value: string) => {
        setStatusFilter(value);
        setPage(1);
      },
    }),
    []
  );

  return (
    <ListPageShell
      isLoading={isLoading}
      isError={false}
      loadingMessage="Loading reviews..."
    >
      <PageHeader title="Reviews" description="Moderate customer reviews" />

      {isError && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Reviews API is not available yet. Mount the /reviews route on the backend to enable this feature.
        </div>
      )}

      <ListToolbar
        search={search}
        onSearchChange={handlers.onSearch}
        searchPlaceholder="Search reviews..."
        filters={[
          {
            key: "status",
            value: statusFilter,
            placeholder: "All statuses",
            options: STATUS_OPTIONS,
            onChange: handlers.onStatus,
          },
        ]}
      />

      <ListTableCard
        footer={
          <ListPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            showing={pagedReviews.length}
            onPageChange={setPage}
            hasNext={pagination.hasNext}
          />
        }
      >
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Product</th>
              <th className="px-5 py-3 text-left">Customer</th>
              <th className="px-5 py-3 text-left">Rating</th>
              <th className="px-5 py-3 text-left">Review</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedReviews.length > 0 ? (
              pagedReviews.map((review: ApiReview, index: number) => (
                <tr key={review._id} className="border-t hover:bg-gray-50">
                  <td
                    className="cursor-pointer px-5 py-4 text-gray-400"
                    onClick={() => router.push(ADMIN_ROUTES.review(review._id))}
                  >
                    {(pagination.page - 1) * LIST_PAGE_SIZE + index + 1}
                  </td>
                  <td
                    className="cursor-pointer px-5 py-4"
                    onClick={() => router.push(ADMIN_ROUTES.review(review._id))}
                  >
                    {typeof review.productId === "object" ? review.productId.name : "—"}
                  </td>
                  <td
                    className="cursor-pointer px-5 py-4"
                    onClick={() => router.push(ADMIN_ROUTES.review(review._id))}
                  >
                    {typeof review.customerId === "object" ? review.customerId.name : "—"}
                  </td>
                  <td
                    className="cursor-pointer px-5 py-4 font-semibold"
                    onClick={() => router.push(ADMIN_ROUTES.review(review._id))}
                  >
                    {review.rating} ★
                  </td>
                  <td
                    className="max-w-xs cursor-pointer truncate px-5 py-4"
                    onClick={() => router.push(ADMIN_ROUTES.review(review._id))}
                  >
                    {reviewBody(review)}
                  </td>
                  <td
                    className="cursor-pointer px-5 py-4 capitalize"
                    onClick={() => router.push(ADMIN_ROUTES.review(review._id))}
                  >
                    {review.status}
                  </td>
                  <td
                    className="cursor-pointer px-5 py-4 text-gray-500"
                    onClick={() => router.push(ADMIN_ROUTES.review(review._id))}
                  >
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    {review.status === REVIEW_STATUS.PENDING && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void moderate.mutateAsync({
                              id: review._id,
                              status: REVIEW_STATUS.APPROVED,
                            })
                          }
                          className="rounded-lg bg-green-600 px-2 py-1 text-xs font-semibold text-white"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(ADMIN_ROUTES.review(review._id))}
                          className="rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400">
                  {error ? "Reviews unavailable" : "No reviews to moderate"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ListTableCard>
    </ListPageShell>
  );
}
