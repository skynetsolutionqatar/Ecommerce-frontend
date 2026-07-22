/**
 * App-wide constants — use these instead of hardcoded strings across the project.
 * Change values here once; imports update everywhere.
 */

/** User roles */
export const ROLE = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
} as const;

export type UserRole = (typeof ROLE)[keyof typeof ROLE];

export const ADMIN_ROLES = [ROLE.ADMIN, ROLE.SUPERADMIN] as const;

export function isAdminRole(role?: string): boolean {
  return role === ROLE.ADMIN || role === ROLE.SUPERADMIN;
}

/** Role display labels */
export const ROLE_LABEL = {
  SYSTEM_ADMIN: "System Admin",
  STORE_MANAGER: "Store Manager",
} as const;

/** Order statuses */
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LIST: OrderStatus[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELLED,
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.PROCESSING]: "Processing",
  [ORDER_STATUS.SHIPPED]: "Shipped",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
  [ORDER_STATUS.REFUNDED]: "Refunded",
};

/** Review moderation statuses */
export const REVIEW_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

export type ModeratableReviewStatus =
  | typeof REVIEW_STATUS.APPROVED
  | typeof REVIEW_STATUS.REJECTED;

/** Dashboard transaction statuses */
export const TRANSACTION_STATUS = {
  COMPLETED: "completed",
  PENDING: "pending",
  FAILED: "failed",
} as const;

export type TransactionStatus = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

/** Product catalog statuses */
export const PRODUCT_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

/** Coupon statuses — matches backend coupons.model.js */
export const COUPON_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  EXPIRED: "expired",
} as const;

export type CouponStatus = (typeof COUPON_STATUS)[keyof typeof COUPON_STATUS];

export const COUPON_STATUS_LIST: CouponStatus[] = [
  COUPON_STATUS.DRAFT,
  COUPON_STATUS.ACTIVE,
  COUPON_STATUS.PAUSED,
  COUPON_STATUS.EXPIRED,
];

/** Coupon discount types — matches backend */
export const COUPON_DISCOUNT_TYPE = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
  FREE_SHIPPING: "free_shipping",
} as const;

export type CouponDiscountType = (typeof COUPON_DISCOUNT_TYPE)[keyof typeof COUPON_DISCOUNT_TYPE];

/** Inventory movement types — matches backend inventory.model.js */
export const INVENTORY_MOVEMENT_TYPE = {
  STOCK_IN: "stock_in",
  STOCK_OUT: "stock_out",
  ADJUSTMENT: "adjustment",
  RETURN: "return",
  DAMAGE: "damage",
} as const;

export type InventoryMovementType =
  (typeof INVENTORY_MOVEMENT_TYPE)[keyof typeof INVENTORY_MOVEMENT_TYPE];

/** Local storage & cookie keys */
export const STORAGE_KEYS = {
  AUTH: "skynet-auth",
  ACCESS_TOKEN: "skynet_access_token",
  REFRESH_TOKEN: "skynet_refresh_token",
} as const;

/** Route prefixes */
export const ROUTE_PREFIX = {
  ADMIN: "/admin",
} as const;

/** Auth page paths */
export const AUTH_PATH = {
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

/** HTTP status codes used in client logic */
export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
} as const;

/** Sort direction */
export const SORT_ORDER = {
  ASC: "asc",
  DESC: "desc",
} as const;
