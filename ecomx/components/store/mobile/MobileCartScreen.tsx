"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronDown, ChevronLeft, MapPin, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import StoreImage from "@/components/StoreImage";
import MobileDeliveryAreaSheet from "@/components/store/mobile/MobileDeliveryAreaSheet";
import { useProducts } from "@/hooks/useProducts";
import { PRODUCT_STATUS } from "@/lib/Constant";
import { ROUTES } from "@/lib/routes";
import { useDeliveryAreaLabel } from "@/hooks/useDeliveryAreaLabel";
import { loadCheckoutProgress } from "@/lib/store/checkout-address-cache";
import { apiProductImage } from "@/lib/store/api-product-display";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import { showInfo, showSuccess } from "@/lib/toast";
import { formatPrice } from "@/lib/utils";
import type { CartItem, WishlistItem } from "@/lib/types";
import type { ApiProduct } from "@/types/product.types";

function itemCountLabel(count: number) {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

function deliveryChargeLabel(): string {
  const status = loadCheckoutProgress()?.deliveryStatus;
  if (!status?.deliverable || typeof status.deliveryCharge !== "number") return "At checkout";
  return status.deliveryCharge > 0 ? formatPrice(status.deliveryCharge) : "Free";
}

function toPayAmount(subtotal: number): number {
  const status = loadCheckoutProgress()?.deliveryStatus;
  if (status?.deliverable && typeof status.deliveryCharge === "number") {
    return subtotal + status.deliveryCharge;
  }
  return subtotal;
}

export default function MobileCartScreen({
  cart,
  onClose,
  onUpdate,
  onRemove,
  onGoToShop,
  onRefresh,
  isWishlisted,
  onToggleWishlist,
  onAddProduct,
  onOpenProduct,
}: {
  cart: CartItem[];
  onClose: () => void;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onGoToShop?: () => void;
  onRefresh?: () => void;
  isWishlisted?: (productId: string) => boolean;
  onToggleWishlist?: (item: WishlistItem) => void;
  onAddProduct?: (product: ApiProduct) => void;
  onOpenProduct?: (product: ApiProduct) => void;
}) {
  const router = useRouter();
  const { areaLabel, refreshAreaLabel } = useDeliveryAreaLabel();
  const [areaOpen, setAreaOpen] = useState(false);
  const [suggestTab, setSuggestTab] = useState<"buys" | "picks">("buys");
  const hasItems = cart.length > 0;
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const payable = toPayAmount(subtotal);
  const blocked = cart.some((item) => item.stock != null && item.stock <= 0);

  const bestBuys = useProducts(
    { status: PRODUCT_STATUS.ACTIVE, isBestSeller: true, limit: 8 },
    !hasItems
  );
  const topPicks = useProducts(
    { status: PRODUCT_STATUS.ACTIVE, sortBy: "averageRating", sortOrder: "desc", limit: 8 },
    !hasItems
  );
  const suggestions = useMemo(
    () => (suggestTab === "buys" ? bestBuys.data?.products : topPicks.data?.products) ?? [],
    [bestBuys.data?.products, suggestTab, topPicks.data?.products]
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    onRefresh?.();
    return () => {
      document.body.style.overflow = prev;
    };
    // Refresh once when the phone cart opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeOrder = () => {
    if (blocked) {
      showInfo("Remove or update unavailable items before checkout.");
      return;
    }
    onClose();
    router.push(ROUTES.checkout);
  };

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

  return (
    <div className="mobile-cart-screen fixed inset-0 z-[300] flex flex-col bg-[#f1f3f6]">
      {hasItems ? (
        <header className="flex items-center gap-2 border-b border-gray-200 bg-white px-2 pb-3 pt-[max(10px,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border-0 bg-transparent"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.2} />
          </button>
          <div>
            <h1 className="text-[18px] font-extrabold leading-tight text-gray-900">My cart</h1>
            <p className="text-xs text-gray-500">{itemCountLabel(count)} · Skynet Store</p>
          </div>
        </header>
      ) : (
        <div className="pt-[max(8px,env(safe-area-inset-top))]" />
      )}

      <div className={`min-h-0 flex-1 overflow-y-auto px-4 pt-3.5 ${hasItems ? "pb-28" : "pb-8"}`}>
        {hasItems ? (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setAreaOpen(true)}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-left"
            >
              <span>
                <span className="block text-[11px] font-bold uppercase tracking-wide text-gray-500">Deliver to</span>
                <span className="block text-[15px] font-extrabold text-gray-900">{areaLabel}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {cart.map((item) => {
              const out = item.stock != null && item.stock <= 0;
              const low = item.stock != null && item.stock > 0 && item.qty >= item.stock;
              return (
                <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3.5">
                  <button
                    type="button"
                    onClick={() => item.slug && router.push(ROUTES.product(item.slug))}
                    className="flex gap-3 border-0 bg-transparent p-0 text-left"
                  >
                    <span className={`h-[84px] w-[84px] shrink-0 overflow-hidden rounded-lg border border-gray-200 ${productImageSurfaceClass} ${out ? "opacity-50" : ""}`}>
                      <StoreImage src={item.img} alt="" className="h-full w-full object-contain p-1.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm font-semibold leading-[19px] text-gray-800">{item.name}</span>
                      <span className={`mt-1.5 block text-base font-extrabold ${out ? "text-gray-400" : "text-gray-900"}`}>
                        {formatPrice(item.price)}
                      </span>
                      {out ? (
                        <span className="mt-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[11.5px] font-bold text-red-600">
                          Out of stock · remove to check out
                        </span>
                      ) : low ? (
                        <span className="mt-1 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11.5px] font-bold text-amber-700">
                          Only {item.stock} left
                        </span>
                      ) : null}
                    </span>
                  </button>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-[42px] items-center overflow-hidden rounded-lg border border-gray-200">
                      <button type="button" className="flex h-[42px] w-9 items-center justify-center border-0 bg-white" aria-label="Decrease quantity" onClick={() => onUpdate(item.id, item.qty - 1)}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                      <button
                        type="button"
                        className="flex h-[42px] w-9 items-center justify-center border-0 bg-white disabled:opacity-40"
                        aria-label="Increase quantity"
                        disabled={out || (item.stock != null && item.qty >= item.stock)}
                        onClick={() => onUpdate(item.id, item.qty + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button type="button" onClick={() => saveForLater(item)} className="flex h-[42px] flex-1 items-center justify-center gap-1.5 border-0 bg-transparent text-[13px] font-bold text-[#0a255d]">
                      <Bookmark className="h-4 w-4" strokeWidth={1.9} />
                      Save for later
                    </button>
                    <button type="button" onClick={() => onRemove(item.id)} className="flex h-[42px] w-[42px] items-center justify-center rounded-lg border-0 bg-red-50 text-red-600" aria-label={`Remove ${item.name} from cart`}>
                      <Trash2 className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                </article>
              );
            })}

            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-2 text-base font-extrabold text-gray-900">Bill details</h2>
              <div className="flex justify-between text-sm text-gray-600"><span>Item total</span><span>{formatPrice(subtotal)}</span></div>
              <div className="mt-2 flex justify-between text-sm text-gray-600"><span>Delivery</span><span>{deliveryChargeLabel()}</span></div>
              <div className="mt-2 flex justify-between text-sm text-gray-600"><span>VAT</span><span>Included</span></div>
              <div className="mt-2.5 flex justify-between border-t border-dashed border-gray-300 pt-2.5 text-[17px] font-extrabold text-gray-900">
                <span>To pay</span>
                <span>{formatPrice(payable)}</span>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pt-2">
            <button type="button" onClick={() => setAreaOpen(true)} className="flex items-center gap-1 border-0 bg-transparent p-0 text-lg font-extrabold text-gray-900">
              <MapPin className="h-4 w-4" strokeWidth={1.9} />
              {areaLabel}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="flex flex-col items-center gap-4 px-2 pt-4">
              <div className="relative flex h-[130px] w-[140px] items-center justify-center rounded-[40px] bg-[#e8eef8]">
                <ShoppingCart className="h-20 w-20 text-[#0a255d]" strokeWidth={1.3} />
                <span className="absolute right-6 top-0 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-[26px] font-bold text-white">0</span>
              </div>
              <p className="text-center text-[21px] text-gray-900">Your Cart is Empty!</p>
              <button
                type="button"
                onClick={() => {
                  onGoToShop?.();
                  onClose();
                }}
                className="h-12 w-full rounded-lg border-0 bg-[#0a255d] text-lg font-bold text-white"
              >
                Start Shopping
              </button>
            </div>
            <div>
              <div className="mb-3 flex justify-center gap-8">
                {(["buys", "picks"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSuggestTab(tab)}
                    className={`border-0 bg-transparent pb-1.5 text-[15px] ${suggestTab === tab ? "border-b-2 border-gray-900 font-extrabold text-gray-900" : "font-semibold text-gray-400"}`}
                  >
                    {tab === "buys" ? "Best Buys" : "Top Picks"}
                  </button>
                ))}
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {bestBuys.isLoading || topPicks.isLoading ? (
                  <p className="text-sm text-gray-500">Loading suggestions</p>
                ) : (
                  suggestions.map((product) => {
                    const image = apiProductImage(product);
                    return (
                      <div
                        key={product._id}
                        className="w-[132px] shrink-0 overflow-hidden rounded-lg bg-white text-left shadow-[0_2px_8px_rgba(14,27,51,0.08)]"
                      >
                        <button
                          type="button"
                          onClick={() => onOpenProduct?.(product)}
                          className="block w-full border-0 bg-transparent p-0 text-left"
                        >
                          <span className={`block aspect-square ${productImageSurfaceClass}`}>
                            {image ? <StoreImage src={image} alt="" className="h-full w-full object-contain p-2" /> : null}
                          </span>
                          <span className="block px-2 pb-2 pt-1">
                            <span className="line-clamp-2 min-h-8 text-[12px] leading-4 text-gray-800">{product.name}</span>
                            <span className="mt-0.5 block text-[13px] font-extrabold text-gray-900">{formatPrice(product.price)}</span>
                          </span>
                        </button>
                        {onAddProduct ? (
                          <button
                            type="button"
                            onClick={() => onAddProduct(product)}
                            className="mx-2 mb-2 rounded-md border-0 bg-[#0a255d] px-2.5 py-1 text-[11px] font-bold text-white"
                          >
                            Add
                          </button>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {hasItems ? (
        <footer className="absolute inset-x-0 bottom-0 flex items-center gap-3.5 rounded-t-2xl border-t border-gray-200 bg-white px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3.5">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-extrabold leading-6 text-gray-900">{formatPrice(payable)}</p>
          </div>
          <button type="button" onClick={placeOrder} className="h-12 flex-1 rounded-lg border-0 bg-[#0a255d] text-base font-bold text-white">
            Place order
          </button>
        </footer>
      ) : null}

      <MobileDeliveryAreaSheet
        open={areaOpen}
        onClose={() => {
          setAreaOpen(false);
          refreshAreaLabel();
        }}
      />
    </div>
  );
}
