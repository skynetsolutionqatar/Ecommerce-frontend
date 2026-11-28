"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronDown, ChevronLeft, MapPin, Minus, Plus, Trash2 } from "lucide-react";
import StoreImage from "@/components/StoreImage";
import MobileDeliveryAreaSheet from "@/components/store/mobile/MobileDeliveryAreaSheet";
import { useProducts } from "@/hooks/useProducts";
import { usePublicDeliverySettings } from "@/hooks/useDeliverySettings";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { ROUTES } from "@/lib/routes";
import { apiProductImage } from "@/lib/store/api-product-display";
import { readDeliveryAreaLabel } from "@/lib/store/delivery-area-label";
import { getDeliveryPromoText } from "@/lib/store/delivery-promo";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import { Colors } from "@/lib/theme";
import { showInfo, showSuccess } from "@/lib/toast";
import { formatPrice } from "@/lib/utils";
import type { ApiProduct } from "@/types/product.types";
import type { CartItem, WishlistItem } from "@/lib/types";

interface CartDrawerProps {
  cart: CartItem[];
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onGoToShop?: () => void;
  onRefresh?: () => void;
  isWishlisted?: (productId: string) => boolean;
  onToggleWishlist?: (item: WishlistItem) => void;
  onAddProduct?: (product: ApiProduct) => void;
  onOpenProduct?: (product: ApiProduct) => void;
}

function itemCountLabel(count: number) {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

function lineTag(item: CartItem): { label: string; className: string } | null {
  if (item.stock != null && item.stock <= 0) {
    return { label: "Out of stock · remove to check out", className: "bg-red-50 text-red-700" };
  }
  if (item.stock != null && item.qty >= item.stock) {
    return { label: `Only ${item.stock} left`, className: "bg-amber-50 text-amber-700" };
  }
  return null;
}

export default function CartDrawer({
  cart,
  open,
  onClose,
  onUpdate,
  onRemove,
  onGoToShop,
  onRefresh,
  isWishlisted,
  onToggleWishlist,
  onAddProduct,
  onOpenProduct,
}: CartDrawerProps) {
  const router = useRouter();
  const { data: deliverySettings } = usePublicDeliverySettings();
  const [areaLabel, setAreaLabel] = useState(() => readDeliveryAreaLabel());
  const [areaOpen, setAreaOpen] = useState(false);
  const [suggestTab, setSuggestTab] = useState<"buys" | "picks">("buys");

  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const blocked = cart.some((item) => item.stock != null && item.stock <= 0);
  const empty = cart.length === 0;

  const bestBuys = useProducts(
    { status: PRODUCT_STATUS.ACTIVE, isBestSeller: true, limit: 8, sortBy: "createdAt", sortOrder: "desc" },
    open && empty
  );
  const topPicks = useProducts(
    { status: PRODUCT_STATUS.ACTIVE, limit: 8, sortBy: "averageRating", sortOrder: "desc" },
    open && empty
  );
  const suggestions = (suggestTab === "buys" ? bestBuys.data?.products : topPicks.data?.products) ?? [];
  const suggestionsLoading = bestBuys.isLoading || topPicks.isLoading;

  useEffect(() => {
    if (!open) return;
    onRefresh?.();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
    // Refresh once when the cart opens, same as the app's focus refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const saveForLater = (item: CartItem) => {
    if (onToggleWishlist && !isWishlisted?.(item.productId)) {
      onToggleWishlist({
        id: item.productId,
        name: item.name,
        brand: item.brand,
        price: item.price,
        img: item.img,
      });
    }
    onUpdate(item.id, 0);
    showSuccess("Saved for later in your wishlist");
  };

  const placeOrder = () => {
    if (blocked) {
      showInfo("Remove or update unavailable items before checkout.");
      return;
    }
    onClose();
    router.push(ROUTES.checkout);
  };

  const startShopping = () => {
    onGoToShop?.();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex justify-center bg-[#f1f3f6]">
      <div className="relative flex h-full w-full max-w-3xl flex-col bg-[#f1f3f6]">
        {empty ? (
          <div className="h-[max(8px,env(safe-area-inset-top))]" />
        ) : (
          <header className="flex items-center gap-2 bg-white px-2 pb-3 pt-[max(8px,env(safe-area-inset-top))]">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border-0 bg-transparent text-gray-900"
              aria-label="Back"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.2} />
            </button>
            <div>
              <h2 className="text-lg font-extrabold leading-6 text-gray-900">My cart</h2>
              <p className="text-xs text-gray-500">{itemCountLabel(count)} · Skynet Store</p>
            </div>
          </header>
        )}

        <div className={`min-h-0 flex-1 overflow-y-auto px-4 pt-3.5 ${empty ? "" : "pb-28"}`}>
          {empty ? (
            <div className="flex flex-col gap-6 pt-2">
              <button
                type="button"
                onClick={() => setAreaOpen(true)}
                className="flex items-center gap-1 self-start border-0 bg-transparent p-0 text-left"
              >
                <MapPin className="h-4 w-4" />
                <span className="max-w-[16rem] truncate text-lg font-extrabold text-gray-900">{areaLabel}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <div className="flex flex-col items-center gap-4 px-2 pt-4">
                <div className="relative flex h-[130px] w-[140px] items-center justify-center rounded-[40px] bg-[#e8eef8]">
                  <span className="text-6xl" aria-hidden>🛒</span>
                  <span className="absolute right-6 top-0 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-[26px] font-bold text-white">
                    0
                  </span>
                </div>
                <p className="text-center text-[21px] text-gray-900">Your Cart is Empty!</p>
                <button
                  type="button"
                  onClick={startShopping}
                  className="h-12 w-full rounded-lg border-0 text-lg font-bold text-white"
                  style={{ background: Colors.base_color }}
                >
                  Start Shopping
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-center gap-8">
                  {(["buys", "picks"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSuggestTab(tab)}
                      className={`border-0 bg-transparent pb-1.5 text-[15px] ${
                        suggestTab === tab
                          ? "border-b-2 border-gray-900 font-extrabold text-gray-900"
                          : "font-semibold text-gray-400"
                      }`}
                    >
                      {tab === "buys" ? "Best Buys" : "Top Picks"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-2">
                  {suggestionsLoading
                    ? [0, 1, 2].map((i) => (
                        <div key={i} className="h-44 w-[132px] shrink-0 animate-pulse rounded-lg bg-gray-200" />
                      ))
                    : suggestions.map((product) => {
                        const image = apiProductImage(product);
                        return (
                          <div key={product._id} className="w-[132px] shrink-0 overflow-hidden rounded-lg bg-white text-left shadow-sm">
                            <button
                              type="button"
                              onClick={() => onOpenProduct?.(product)}
                              className="w-full border-0 bg-transparent p-0 text-left"
                            >
                              <span className={`block aspect-square p-2 ${productImageSurfaceClass}`}>
                                {image ? <StoreImage src={image} alt="" className="h-full w-full object-contain" /> : null}
                              </span>
                              <span className="block px-2 pt-1">
                                <span className="line-clamp-2 min-h-8 text-[12px] leading-4 text-gray-800">{product.name}</span>
                                <span className="mt-0.5 block text-[13px] font-extrabold text-gray-900">{formatPrice(product.price)}</span>
                              </span>
                            </button>
                            {onAddProduct ? (
                              <button
                                type="button"
                                onClick={() => onAddProduct(product)}
                                className="mx-2 mb-2 mt-1 rounded-md border-0 px-2 py-0.5 text-[11px] font-bold text-white"
                                style={{ background: Colors.base_color }}
                              >
                                Add
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setAreaOpen(true)}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-left"
              >
                <span>
                  <span className="block text-xs font-semibold text-gray-500">Deliver to</span>
                  <span className="block text-sm font-extrabold text-gray-900">{areaLabel}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">{getDeliveryPromoText(deliverySettings)}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {cart.map((item) => {
                const tag = lineTag(item);
                const outOfStock = item.stock != null && item.stock <= 0;
                const atMax = item.stock != null && item.qty >= item.stock;
                return (
                  <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3.5">
                    <button
                      type="button"
                      disabled={!item.slug}
                      onClick={() => item.slug && router.push(ROUTES.product(item.slug))}
                      className="flex gap-3 border-0 bg-transparent p-0 text-left disabled:cursor-default"
                    >
                      <span className={`h-[84px] w-[84px] shrink-0 overflow-hidden rounded-lg border border-gray-200 p-1.5 ${productImageSurfaceClass} ${outOfStock ? "opacity-50" : ""}`}>
                        <StoreImage src={item.img} alt="" className="h-full w-full object-contain" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-sm font-semibold leading-[19px] text-gray-800">{item.name}</span>
                        <span className="mt-1.5 block text-base font-extrabold text-gray-900">{formatPrice(item.price)}</span>
                        {tag ? (
                          <span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-bold ${tag.className}`}>
                            {tag.label}
                          </span>
                        ) : null}
                      </span>
                    </button>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-[42px] items-center overflow-hidden rounded-lg border border-gray-200">
                        <button
                          type="button"
                          onClick={() => onUpdate(item.id, item.qty - 1)}
                          disabled={outOfStock}
                          className="flex h-[42px] w-10 items-center justify-center border-0 bg-white text-gray-700 disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-7 text-center text-sm font-bold">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => onUpdate(item.id, item.qty + 1)}
                          disabled={outOfStock || atMax}
                          className="flex h-[42px] w-10 items-center justify-center border-0 bg-white disabled:opacity-40"
                          style={{ color: Colors.base_color }}
                          aria-label={atMax ? "Maximum stock reached" : "Increase quantity"}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => saveForLater(item)}
                        className="flex h-[42px] flex-1 items-center justify-center gap-1.5 border-0 bg-transparent text-[13px] font-bold text-[#0a255d]"
                      >
                        <Bookmark className="h-4 w-4" />
                        Save for later
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="flex h-[42px] w-[42px] items-center justify-center rounded-lg border-0 bg-red-50 text-red-600"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}

              <section className="rounded-xl border border-gray-200 bg-white p-3.5">
                <h3 className="mb-2 text-sm font-extrabold text-gray-900">Bill details</h3>
                <div className="flex justify-between py-1 text-[13px] text-gray-600">
                  <span>Item total</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between py-1 text-[13px] text-gray-600">
                  <span>Delivery</span>
                  <span className="font-semibold text-gray-900">At checkout</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-[15px] font-extrabold text-gray-900">
                  <span>To pay</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </section>
            </div>
          )}
        </div>

        {!empty ? (
          <div className="absolute bottom-0 left-1/2 flex w-full max-w-3xl -translate-x-1/2 items-center gap-3.5 rounded-t-2xl border-t border-gray-200 bg-white px-4 pt-3.5 pb-[max(14px,env(safe-area-inset-bottom))]">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-extrabold leading-6 text-gray-900">{formatPrice(subtotal)}</p>
            </div>
            <button
              type="button"
              onClick={placeOrder}
              className="h-12 flex-1 rounded-lg border-0 text-base font-bold text-white"
              style={{ background: Colors.base_color }}
            >
              Place order
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="absolute left-3 top-[max(10px,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white"
            aria-label="Close cart"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
      </div>

      <MobileDeliveryAreaSheet
        open={areaOpen}
        onClose={() => {
          setAreaOpen(false);
          setAreaLabel(readDeliveryAreaLabel());
        }}
      />
    </div>
  );
}
