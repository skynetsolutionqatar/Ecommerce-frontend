import { resolveRefId } from "@/lib/api/populated-ref";
import type { CartItem, Product } from "@/lib/types";
import type { ApiCart } from "@/types/cart.types";

export function isQtyAllowed(qty: number, stock?: number): boolean {
  if (qty < 1) return false;
  if (stock == null) return true;
  return qty <= stock;
}

export function apiCartToCartItems(cart?: ApiCart | null): CartItem[] {
  if (!cart?.items?.length) return [];

  return cart.items.map((item) => {
    const productId = resolveRefId(item.productId);
    const populated =
      typeof item.productId === "object" && item.productId !== null ? item.productId : null;

    return {
      id: item._id,
      productId,
      name: item.name ?? populated?.name ?? "",
      brand: "",
      price: item.price,
      img: item.thumbnail ?? populated?.thumbnail ?? populated?.images?.[0] ?? "",
      qty: item.quantity,
      stock: populated?.stock,
    };
  });
}

export function productToGuestCartItem(
  product: Product,
  color?: string,
  size?: string,
  qty = 1
): CartItem {
  return {
    id: product.id,
    productId: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    img: product.images[0] ?? "",
    color,
    size,
    qty,
    stock: product.stock,
  };
}

export function mergeGuestCartItem(items: CartItem[], next: CartItem): CartItem[] {
  const existing = items.find((item) => item.productId === next.productId);
  const stock = next.stock ?? existing?.stock;

  if (existing) {
    const newQty = existing.qty + next.qty;
    const cappedQty = stock != null ? Math.min(newQty, stock) : newQty;

    if (cappedQty <= existing.qty) {
      return items;
    }

    return items.map((item) =>
      item.productId === next.productId
        ? { ...item, qty: cappedQty, stock: stock ?? item.stock }
        : item
    );
  }

  const initialQty = stock != null ? Math.min(next.qty, stock) : next.qty;
  if (initialQty < 1) return items;

  return [...items, { ...next, qty: initialQty }];
}
