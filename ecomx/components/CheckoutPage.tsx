"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "@/lib/types";
import type { PlaceOrderPayload } from "@/types/order.types";
import * as Icons from "@/components/Icons";
import { tw, type } from "@/lib/theme";
import { showError, showSuccess } from "@/lib/toast";
import { getApiErrorMessage } from "@/lib/api/errors";
import { ROUTES } from "@/lib/routes";
import {
  loadCheckoutAddress,
  saveCheckoutAddress,
} from "@/lib/store/checkout-address-cache";

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  country: string;
}

interface CheckoutPageProps {
  onBack: () => void;
  cart: CartItem[];
  isLoggedIn: boolean;
  onLoginOpen: () => void;
  onPlaceOrder: (payload: PlaceOrderPayload) => Promise<string>;
  initialContact?: Pick<CheckoutFormData, "fullName" | "email" | "phone">;
}

const INITIAL_FORM: CheckoutFormData = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  country: "Qatar",
};

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function CheckoutPage({
  onBack,
  cart,
  isLoggedIn,
  onLoginOpen,
  onPlaceOrder,
  initialContact,
}: CheckoutPageProps) {
  const router = useRouter();
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CheckoutFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [submitError, setSubmitError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [addressLoaded, setAddressLoaded] = useState(false);

  useEffect(() => {
    if (addressLoaded) return;
    const cached = loadCheckoutAddress();
    if (cached) {
      setForm((prev) => ({
        ...prev,
        ...cached,
        fullName: initialContact?.fullName || cached.fullName,
        email: initialContact?.email || cached.email,
        phone: initialContact?.phone || cached.phone,
      }));
    } else if (initialContact) {
      setForm((prev) => ({
        ...prev,
        fullName: initialContact.fullName || prev.fullName,
        email: initialContact.email || prev.email,
        phone: initialContact.phone || prev.phone,
      }));
    }
    setAddressLoaded(true);
  }, [addressLoaded, initialContact]);

  const inputClass = (field: keyof CheckoutFormData) =>
    `w-full rounded-xl border bg-bg px-3.5 py-3 text-sm text-primary outline-none focus:border-accent ${
      errors[field] ? "border-red-400" : "border-border"
    }`;
  const labelClass = "mb-1.5 block text-sm md:text-xs font-bold text-primary/80";

  const setField = (field: keyof CheckoutFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = () => {
    const next: Partial<Record<keyof CheckoutFormData, string>> = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!validateEmail(form.email)) next.email = "Enter a valid email";
    if (!form.phone.trim()) next.phone = "Phone number is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: Partial<Record<keyof CheckoutFormData, string>> = {};
    if (!form.line1.trim()) next.line1 = "Street address is required";
    if (!form.city.trim()) next.city = "City is required";
    if (!form.country.trim()) next.country = "Country is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateAll = () => validateStep1() && validateStep2();

  const goToStep = (target: number) => {
    if (target <= step) {
      setStep(target);
      return;
    }
    if (target >= 2 && !validateStep1()) return;
    if (target >= 3 && !validateStep2()) return;
    setStep(target);
  };

  const handlePlaceOrder = async () => {
    setSubmitError("");

    if (cart.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    if (!isLoggedIn) {
      onLoginOpen();
      setSubmitError("Please sign in to place an order.");
      return;
    }

    if (!validateAll()) {
      if (!validateStep1()) setStep(1);
      else if (!validateStep2()) setStep(2);
      return;
    }

    setPlacing(true);
    try {
      const orderNumber = await onPlaceOrder({
        deliveryAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          line1: form.line1.trim(),
          line2: form.line2.trim() || undefined,
          city: form.city.trim(),
          country: form.country.trim(),
        },
        paymentMethod: "cash_on_delivery",
      });
      saveCheckoutAddress(form);
      router.push(`${ROUTES.orders}?placed=${encodeURIComponent(orderNumber)}`);
      showSuccess(`Order ${orderNumber} placed successfully`);
    } catch (err) {
      const message = getApiErrorMessage(err, "Could not place order. Please try again.");
      showError(message);
      setSubmitError(message);
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className={`${tw.pageTopOffset} min-h-screen ${tw.sectionBg} pb-20`}>
        <div className="mx-auto max-w-[900px] px-3 py-16 text-center sm:px-5 md:px-8">
          <p className="mb-4 text-sm text-muted">Your cart is empty.</p>
          <button type="button" onClick={onBack} className={tw.btnPrimary}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${tw.pageTopOffset} min-h-screen ${tw.sectionBg} pb-20`}>
      <div className="mx-auto max-w-[900px] px-3 pt-2 sm:px-5 md:px-8 lg:px-[50px]">
        <button
          type="button"
          onClick={onBack}
          className={`${tw.storeBackLink} mb-6`}
        >
          <Icons.ChevronLeft /> Back
        </button>

        <h1 className="mb-2 font-display text-[28px] font-bold text-primary sm:text-[36px] md:text-[42px]">
          Checkout
        </h1>

        <div className="mb-10 flex flex-col overflow-hidden rounded-full border border-border sm:flex-row">
          {["Contact Info", "Delivery", "Payment"].map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => goToStep(i + 1)}
              className={`flex-1 border-0 py-3 text-[11px] font-semibold cursor-pointer transition-all sm:text-[13px] ${
                step === i + 1 ? "bg-primary text-white" : "bg-white text-muted"
              } ${i < 2 ? "sm:border-r sm:border-border" : ""} ${i > 0 ? "border-t border-border sm:border-t-0" : ""}`}
            >
              <span className="sm:hidden">{i + 1}. {s.split(" ")[0]}</span>
              <span className="hidden sm:inline">{i + 1}. {s}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="rounded-3xl border border-border bg-white p-4 sm:p-6 md:p-8">
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="mb-1 font-display text-[22px] font-bold text-primary">
                  Contact Information
                </h3>
                <div>
                  <label className={labelClass} htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    required
                    value={form.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                    placeholder="Full Name"
                    className={inputClass("fullName")}
                  />
                  {errors.fullName ? (
                    <p className="mt-1 text-sm md:text-xs text-red-600">{errors.fullName}</p>
                  ) : null}
                </div>
                <div>
                  <label className={labelClass} htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="Email Address"
                    className={inputClass("email")}
                  />
                  {errors.email ? (
                    <p className="mt-1 text-sm md:text-xs text-red-600">{errors.email}</p>
                  ) : null}
                </div>
                <div>
                  <label className={labelClass} htmlFor="phone">
                    Phone (+974) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="Phone (+974)"
                    className={inputClass("phone")}
                  />
                  {errors.phone ? (
                    <p className="mt-1 text-sm md:text-xs text-red-600">{errors.phone}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className={`${tw.btnPrimary} justify-center`}
                  onClick={() => validateStep1() && setStep(2)}
                >
                  Continue to Delivery <Icons.ArrowRight />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h3 className="mb-1 font-display text-[22px] font-bold text-primary">
                  Delivery Details
                </h3>
                <div>
                  <label className={labelClass} htmlFor="line1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="line1"
                    required
                    value={form.line1}
                    onChange={(e) => setField("line1", e.target.value)}
                    placeholder="Street Address"
                    className={inputClass("line1")}
                  />
                  {errors.line1 ? (
                    <p className="mt-1 text-sm md:text-xs text-red-600">{errors.line1}</p>
                  ) : null}
                </div>
                <div>
                  <label className={labelClass} htmlFor="line2">
                    Area / District
                  </label>
                  <input
                    id="line2"
                    value={form.line2}
                    onChange={(e) => setField("line2", e.target.value)}
                    placeholder="Area / District"
                    className={inputClass("line2")}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    required
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    placeholder="City"
                    className={inputClass("city")}
                  />
                  {errors.city ? (
                    <p className="mt-1 text-sm md:text-xs text-red-600">{errors.city}</p>
                  ) : null}
                </div>
                <div>
                  <label className={labelClass} htmlFor="country">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="country"
                    required
                    value={form.country}
                    onChange={(e) => setField("country", e.target.value)}
                    placeholder="Country"
                    className={inputClass("country")}
                  />
                  {errors.country ? (
                    <p className="mt-1 text-sm md:text-xs text-red-600">{errors.country}</p>
                  ) : null}
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[13px] text-gray-700">
                  ✓ Free installation included · Est. delivery 1–2 business days
                </div>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    className={`${tw.btnOutline} flex-1 justify-center`}
                    onClick={() => setStep(1)}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className={`${tw.btnPrimary} flex-[2] justify-center`}
                    onClick={() => validateStep2() && setStep(3)}
                  >
                    Continue to Payment <Icons.ArrowRight />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <h3 className="mb-1 font-display text-[22px] font-bold text-primary">Payment</h3>
                <div className="rounded-xl border-2 border-primary bg-primary/5 px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg text-white">
                      💵
                    </span>
                    <div>
                      <p className="text-sm font-bold text-primary">Cash on Delivery</p>
                      <p className="text-sm md:text-xs text-muted">Pay when your order arrives</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[13px] text-gray-700">
                  ✓ No online payment required · Pay the delivery agent in QAR
                </div>
                {!isLoggedIn ? (
                  <p className="text-sm md:text-xs font-medium text-amber-700">
                    Sign in is required to place an order.{" "}
                    <button
                      type="button"
                      onClick={onLoginOpen}
                      className="font-bold underline"
                    >
                      Sign in
                    </button>
                  </p>
                ) : null}
                {submitError ? (
                  <p className="text-sm md:text-xs font-medium text-red-600">{submitError}</p>
                ) : null}
                <div className="mt-2 flex gap-2.5">
                  <button
                    type="button"
                    className={`${tw.btnOutline} flex-1 justify-center`}
                    onClick={() => setStep(2)}
                    disabled={placing}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={placing}
                    onClick={() => void handlePlaceOrder()}
                    className={`${tw.btnPrimary} flex-[2] justify-center disabled:opacity-60`}
                  >
                    {placing ? "Placing Order..." : `Place Order · QAR ${sub.toLocaleString()}`}{" "}
                    {!placing ? <Icons.ArrowRight /> : null}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="sticky top-[100px] rounded-3xl border border-border bg-white p-4 sm:p-6">
            <div className="mb-4 text-sm font-bold text-primary">
              Order Summary ({cart.length} item{cart.length !== 1 ? "s" : ""})
            </div>
            {cart.slice(0, 3).map((item) => (
              <div key={item.id} className="mb-3 flex gap-2.5 border-b border-bg-soft pb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.img}
                  alt={item.name}
                  className="h-12 w-12 shrink-0 rounded-[10px] object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex-1">
                  <div className="text-sm md:text-xs font-semibold leading-snug text-primary">{item.name}</div>
                  <div className="text-[13px] md:text-[11px] text-muted">Qty: {item.qty}</div>
                </div>
                <div className="text-[13px] font-bold text-primary">
                  QAR {(item.price * item.qty).toLocaleString()}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-2 border-t border-border pt-3">
              {[["Subtotal", `QAR ${sub.toLocaleString()}`], ["Installation", "FREE"], ["Total", `QAR ${sub.toLocaleString()}`]].map(
                ([l, v], i) => (
                  <div
                    key={l}
                    className={`flex justify-between ${i === 2 ? "mt-1 border-t border-border pt-2" : ""}`}
                  >
                    <span
                      className={`${i === 2 ? "text-sm font-bold text-primary" : "text-sm md:text-xs text-muted"}`}
                    >
                      {l}
                    </span>
                    <span
                      className={`${i === 2 ? `${type.price} text-sm font-extrabold text-primary` : "text-sm md:text-xs font-medium"} ${
                        i === 1 ? "text-gray-600" : "text-primary/80"
                      }`}
                    >
                      {v}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
