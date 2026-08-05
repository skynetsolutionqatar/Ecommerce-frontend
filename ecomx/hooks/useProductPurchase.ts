"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

interface UseProductPurchaseOptions {
  product: Product;
  onAddToCart: (product: Product, color: string, size: string, qty?: number) => void;
  onBuyNow: (product: Product, color: string, size: string, qty?: number) => Promise<boolean>;
}

export function useProductPurchase({
  product,
  onAddToCart,
  onBuyNow,
}: UseProductPurchaseOptions) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");

  const maxQty =
    product.stock != null && product.stock > 0 ? product.stock : Number.POSITIVE_INFINITY;
  const outOfStock = product.stock != null ? product.stock <= 0 : false;
  const selectedColor = product.colors[0]?.name ?? "Default";

  useEffect(() => {
    setSelectedSize(product.sizes?.[0] ?? "");
    setQty(1);
    setBuyError("");
  }, [product.id, product.sizes]);

  useEffect(() => {
    if (Number.isFinite(maxQty) && qty > maxQty) {
      setQty(Math.max(1, maxQty));
    }
  }, [maxQty, qty]);

  const addToCart = () => {
    if (outOfStock) return;
    onAddToCart(product, selectedColor, selectedSize, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = async () => {
    if (outOfStock || buying) return;

    setBuyError("");
    setBuying(true);

    try {
      const ok = await onBuyNow(product, selectedColor, selectedSize, qty);
      if (!ok) {
        setBuyError("Unable to proceed. Please sign in or check available stock.");
      }
    } finally {
      setBuying(false);
    }
  };

  return {
    selectedSize,
    setSelectedSize,
    qty,
    setQty,
    maxQty,
    outOfStock,
    added,
    buying,
    buyError,
    addToCart,
    buyNow,
  };
}
