import type { GuestEventType } from "@/types/guest-activity.types";

const LABELS: Record<GuestEventType, string> = {
  store_visit: "Store visited",
  product_view: "Viewed product",
  product_search: "Searched products",
  add_to_cart: "Added to cart",
  remove_from_cart: "Removed from cart",
  add_to_wishlist: "Added to wishlist",
  remove_from_wishlist: "Removed from wishlist",
  cart_viewed: "Viewed cart",
  checkout_started: "Started checkout",
  phone_provided: "Provided phone number",
  login_linked: "Logged in",
  register_linked: "Registered",
};

export function guestEventLabel(type: GuestEventType): string {
  return LABELS[type] ?? type;
}

export function formatGuestTimelineDetail(
  type: GuestEventType,
  metadata: Record<string, unknown>,
  productName?: string | null
): string {
  const name = productName ?? (metadata.productName as string | undefined);
  switch (type) {
    case "product_view":
      return name ? `Viewed ${name}` : "Viewed product";
    case "product_search":
      return metadata.searchQuery
        ? `Searched “${String(metadata.searchQuery)}”`
        : "Product search";
    case "add_to_cart":
      return name ? `Added ${name} to cart` : "Added to cart";
    case "remove_from_cart":
      return name ? `Removed ${name} from cart` : "Removed from cart";
    case "add_to_wishlist":
      return name ? `Added ${name} to wishlist` : "Added to wishlist";
    case "remove_from_wishlist":
      return name ? `Removed ${name} from wishlist` : "Removed from wishlist";
    case "cart_viewed":
      return metadata.cartValue != null
        ? `Viewed cart (QAR ${Number(metadata.cartValue).toLocaleString()})`
        : "Viewed cart";
    case "checkout_started":
      return "Started checkout";
    case "phone_provided":
      return "Provided phone number";
    case "login_linked":
      return "Logged in — activity linked to account";
    case "register_linked":
      return "Registered — activity linked to account";
    default:
      return guestEventLabel(type);
  }
}
