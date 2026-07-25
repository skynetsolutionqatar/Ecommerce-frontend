import type { ModeratableReviewStatus, ReviewStatus } from "@/lib/Constant";
import type { PaginationParams } from "@/types/api.types";

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

export interface ReviewQueryParams extends PaginationParams {
  status?: ReviewStatus;
  productId?: string;
  customerId?: string;
  rating?: number;
  minRating?: number;
  maxRating?: number;
  sortBy?: "createdAt" | "rating" | "helpfulCount";
}

/** GET /reviews/products/:productId */
export interface ProductReviewQuery extends PaginationParams {
  rating?: number;
  minRating?: number;
  maxRating?: number;
  hasImages?: boolean;
  sortBy?: "rating" | "createdAt" | "helpfulCount";
}

/** GET /reviews/my */
export interface MyReviewQuery extends PaginationParams {
  status?: ReviewStatus;
  productId?: string;
  rating?: number;
  sortBy?: "createdAt" | "rating";
}

export function reviewBody(review: ApiReview): string {
  return review.body ?? review.comment ?? "";
}
