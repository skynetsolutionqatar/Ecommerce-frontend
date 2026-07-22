import type { ModeratableReviewStatus, ReviewStatus } from "@/lib/Constant";

export type { ReviewStatus, ModeratableReviewStatus };

export interface ApiReview {
  _id: string;
  tenantId: string;
  productId: string | { _id: string; name: string; slug?: string };
  customerId: string | { _id: string; name: string; email?: string };
  orderId?: string;
  rating: number;
  title?: string;
  body?: string;
  /** @deprecated use body */
  comment?: string;
  images?: string[];
  status: ReviewStatus;
  rejectionReason?: string;
  location?: string;
  helpfulCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewPayload {
  productId: string;
  orderId: string;
  rating: number;
  title?: string;
  body?: string;
  images?: string[];
}

export interface ModerateReviewPayload {
  status: ModeratableReviewStatus;
  rejectionReason?: string;
}

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  status?: ReviewStatus;
  productId?: string;
}

export function reviewBody(review: ApiReview): string {
  return review.body ?? review.comment ?? "";
}
