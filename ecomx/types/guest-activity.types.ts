export const GUEST_EVENT_TYPES = [
  "store_visit",
  "product_view",
  "product_search",
  "add_to_cart",
  "remove_from_cart",
  "add_to_wishlist",
  "remove_from_wishlist",
  "cart_viewed",
  "checkout_started",
  "phone_provided",
  "login_linked",
  "register_linked",
] as const;

export type GuestEventType = (typeof GUEST_EVENT_TYPES)[number];

export interface GuestActivityEventPayload {
  eventType: GuestEventType;
  productId?: string;
  quantity?: number;
  phoneNumber?: string;
  metadata?: {
    productName?: string;
    searchQuery?: string;
    cartItems?: number;
    wishlistItems?: number;
    cartValue?: number;
    source?: string;
  };
}

export interface GuestActivitySummary {
  totalVisitors: number;
  uniqueGuests: number;
  guestProductViews: number;
  guestCartAdditions: number;
  guestWishlistAdditions: number;
  guestCheckoutStarts: number;
  guestToCustomerConversions: number;
  cartAbandonment: number;
  wishlistActivity: number;
}

export interface GuestVisitorRow {
  guestId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
  phoneNumber: string | null;
  lastActivity: string;
  cartItems: number;
  wishlistItems: number;
  cartValue: number;
  lastViewedProduct: string | null;
  activityCount: number;
  status: "guest" | "registered";
  checkoutStarted: boolean;
}

export interface GuestTimelineItem {
  id: string;
  eventType: GuestEventType;
  createdAt: string;
  product: { id: string; name: string; slug?: string } | null;
  quantity: number | null;
  phoneNumber: string | null;
  metadata: Record<string, unknown>;
  customer: { id: string; name: string } | null;
}
