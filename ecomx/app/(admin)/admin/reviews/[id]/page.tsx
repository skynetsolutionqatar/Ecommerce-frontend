"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackPanel from "@/components/admin/utils/BackPanel";
import ViewSection from "@/components/admin/utils/ViewSection";
import ViewField from "@/components/admin/utils/ViewField";
import { REVIEW_STATUS } from "@/lib/Constant";
import { adminType } from "@/lib/admin/typography";
import { ADMIN_ROUTES } from "@/lib/config";
import { useReview, useReviewMutations } from "@/hooks/useReviews";
import { formatDate } from "@/lib/utils";
import { reviewBody } from "@/types/review.types";

const TABS = [
  { key: "review", label: "Review" },
  { key: "moderate", label: "Moderate" },
];

export default function AdminReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: review, isLoading, isError } = useReview(id);
  const { moderate, remove } = useReviewMutations();
  const [rejectionReason, setRejectionReason] = useState("");

  if (isLoading) {
    return (
      <BackPanel>
        <p className={adminType.loading}>Loading review...</p>
      </BackPanel>
    );
  }

  if (isError || !review) {
    return (
      <BackPanel>
        <p className={adminType.error}>Review not found.</p>
      </BackPanel>
    );
  }

  const handleApprove = async () => {
    await moderate.mutateAsync({ id, status: REVIEW_STATUS.APPROVED });
    toast.success("Review approved");
    router.push(ADMIN_ROUTES.reviews);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    await moderate.mutateAsync({
      id,
      status: REVIEW_STATUS.REJECTED,
      rejectionReason: rejectionReason.trim(),
    });
    toast.success("Review rejected");
    router.push(ADMIN_ROUTES.reviews);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this review permanently?")) return;
    await remove.mutateAsync(id);
    toast.success("Review deleted");
    router.push(ADMIN_ROUTES.reviews);
  };

  return (
    <BackPanel
      tabs={TABS}
      onDelete={() => void handleDelete()}
      deleting={remove.isPending}
    >
      <div className="space-y-6">
        <ViewSection id="review" title="Review Details">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ViewField
              label="Product"
              value={typeof review.productId === "object" ? review.productId.name : "—"}
            />
            <ViewField
              label="Customer"
              value={typeof review.customerId === "object" ? review.customerId.name : "—"}
            />
            <ViewField label="Rating" value={`${review.rating} / 5`} />
            <ViewField label="Status" value={review.status} badge badgeColor="blue" />
            <ViewField label="Title" value={review.title || "—"} />
            <ViewField label="Date" value={formatDate(review.createdAt)} />
          </div>
          <div className="mt-6">
            <ViewField label="Review" value={reviewBody(review) || "—"} />
          </div>
          {review.rejectionReason && (
            <div className="mt-4">
              <ViewField label="Rejection reason" value={review.rejectionReason} />
            </div>
          )}
        </ViewSection>

        {review.status === REVIEW_STATUS.PENDING && (
          <ViewSection id="moderate" title="Moderation">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rejection reason (required to reject)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                  placeholder="Explain why this review is rejected"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleApprove()}
                  disabled={moderate.isPending}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => void handleReject()}
                  disabled={moderate.isPending}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </ViewSection>
        )}
      </div>
    </BackPanel>
  );
}
