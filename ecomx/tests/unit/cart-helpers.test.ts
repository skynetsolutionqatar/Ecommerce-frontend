import { describe, expect, it } from "vitest";
import {
  apiCartToCartItems,
  isQtyAllowed,
  mergeGuestCartItem,
} from "@/lib/store/cart-helpers";
import type { CartItem } from "@/lib/types";

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: "line-1",
    productId: "p-1",
    name: "POS terminal",
    brand: "Skynet",
    price: 100,
    img: "",
    qty: 1,
    stock: 10,
    ...overrides,
  };
}

describe("isQtyAllowed", () => {
  it("rejects quantities below 1", () => {
    expect(isQtyAllowed(0)).toBe(false);
    expect(isQtyAllowed(-2)).toBe(false);
  });

  it("allows any positive quantity when stock is unknown", () => {
    expect(isQtyAllowed(500)).toBe(true);
  });

  it("caps quantity at stock", () => {
    expect(isQtyAllowed(3, 3)).toBe(true);
    expect(isQtyAllowed(4, 3)).toBe(false);
  });
});

describe("mergeGuestCartItem", () => {
  it("adds a new product at its requested quantity when stock allows", () => {
    const next = item({ qty: 2, stock: 5 });
    expect(mergeGuestCartItem([], next)).toEqual([next]);
  });

  it("clamps a new product to available stock", () => {
    const result = mergeGuestCartItem([], item({ qty: 8, stock: 3 }));
    expect(result[0].qty).toBe(3);
  });

  it("does not add a product that has no stock", () => {
    expect(mergeGuestCartItem([], item({ qty: 1, stock: 0 }))).toEqual([]);
  });

  it("increments an existing line and caps it at stock", () => {
    const existing = [item({ qty: 2, stock: 5 })];
    const result = mergeGuestCartItem(existing, item({ qty: 4, stock: 5 }));
    expect(result).toHaveLength(1);
    expect(result[0].qty).toBe(5);
  });

  it("returns the same list when an existing line is already at stock", () => {
    const existing = [item({ qty: 5, stock: 5 })];
    const result = mergeGuestCartItem(existing, item({ qty: 1, stock: 5 }));
    expect(result).toBe(existing);
  });
});

describe("apiCartToCartItems", () => {
  it("returns an empty list for a missing or empty cart", () => {
    expect(apiCartToCartItems(null)).toEqual([]);
    expect(apiCartToCartItems(undefined)).toEqual([]);
    expect(apiCartToCartItems({ items: [] } as never)).toEqual([]);
  });

  it("maps a server line with a string productId", () => {
    const cart = {
      items: [
        {
          _id: "line-9",
          productId: "p-9",
          name: "Thermal printer",
          price: 250,
          quantity: 2,
        },
      ],
    };
    const [line] = apiCartToCartItems(cart as never);
    expect(line).toMatchObject({
      id: "line-9",
      productId: "p-9",
      name: "Thermal printer",
      price: 250,
      qty: 2,
    });
  });
});
