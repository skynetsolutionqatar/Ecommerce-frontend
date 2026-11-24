import { describe, expect, it } from "vitest";
import {
  allowedTransitions,
  isAdminRole,
  sanitizeRedirectPath,
} from "@/lib/Constant";
import { canAccessAdminPanel } from "@/lib/config";
import { getConfirmPasswordError, getNewPasswordError } from "@/lib/auth/password-rules";

describe("sanitizeRedirectPath", () => {
  const fallback = "/";

  it("accepts same-origin absolute paths", () => {
    expect(sanitizeRedirectPath("/shop?category=pos", fallback)).toBe("/shop?category=pos");
    expect(sanitizeRedirectPath("  /checkout  ", fallback)).toBe("/checkout");
  });

  it.each([
    ["absolute URL", "https://evil.example"],
    ["protocol-relative", "//evil.example"],
    ["backslash form", "/\\evil.example"],
    ["control character", "/shop\nSet-Cookie"],
    ["relative path", "shop"],
  ])("falls back for %s", (_label, value) => {
    expect(sanitizeRedirectPath(value, fallback)).toBe(fallback);
  });

  it("falls back for null and undefined", () => {
    expect(sanitizeRedirectPath(null, fallback)).toBe(fallback);
    expect(sanitizeRedirectPath(undefined, fallback)).toBe(fallback);
  });
});

describe("order status transitions", () => {
  it("allows pending orders to be confirmed or cancelled", () => {
    expect(allowedTransitions.pending).toEqual(["confirmed", "cancelled"]);
  });

  it("makes cancelled and refunded terminal", () => {
    expect(allowedTransitions.cancelled).toEqual([]);
    expect(allowedTransitions.refunded).toEqual([]);
  });

  it("only allows refunds after delivery", () => {
    expect(allowedTransitions.delivered).toEqual(["refunded"]);
  });
});

describe("admin access", () => {
  it("treats admin and superadmin as store admins", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("superadmin")).toBe(true);
    expect(isAdminRole("customer")).toBe(false);
  });

  it("denies customers and unknown roles the admin panel", () => {
    expect(canAccessAdminPanel("customer")).toBe(false);
    expect(canAccessAdminPanel(undefined)).toBe(false);
  });

  it("lets admin roles into the admin panel on a store deployment", () => {
    expect(canAccessAdminPanel("admin")).toBe(true);
  });
});

describe("password rules", () => {
  it("requires at least 8 characters, an uppercase letter and a number", () => {
    expect(getNewPasswordError("")).toBe("New password is required");
    expect(getNewPasswordError("Ab1")).toMatch(/at least 8/);
    expect(getNewPasswordError("abcdefg1")).toMatch(/uppercase/);
    expect(getNewPasswordError("Abcdefgh")).toMatch(/number/);
    expect(getNewPasswordError("Abcdefg1")).toBeUndefined();
  });

  it("checks that the confirmation matches", () => {
    expect(getConfirmPasswordError("", "Abcdefg1")).toBe("Please confirm your new password");
    expect(getConfirmPasswordError("Abcdefg2", "Abcdefg1")).toBe("Passwords do not match");
    expect(getConfirmPasswordError("Abcdefg1", "Abcdefg1")).toBeUndefined();
  });
});
