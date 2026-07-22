"use client";

import { useState } from "react";
import type { CartItem } from "@/lib/types";
import * as Icons from "@/components/Icons";
import { tw, type } from "@/lib/theme";

interface CheckoutPageProps {
  onBack: () => void;
  cart: CartItem[];
}

export default function CheckoutPage({ onBack, cart }: CheckoutPageProps) {
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const [step, setStep] = useState(1);

  const inputClass =
    "w-full rounded-xl border border-border bg-bg px-3.5 py-3 text-sm text-primary outline-none focus:border-accent";
  const labelClass = "mb-1.5 block text-xs font-bold text-primary/80";

  return (
    <div className={`${tw.pageTopOffset} min-h-screen ${tw.sectionBg} pb-20`}>
      <div className="mx-auto max-w-[900px] px-3 sm:px-5 md:px-8 lg:px-[50px]">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 flex items-center gap-1 border-0 bg-transparent text-[13px] font-semibold text-accent cursor-pointer"
        >
          <Icons.ChevronLeft /> Back
        </button>

        <h1 className="mb-2 font-display text-[42px] font-bold text-primary">Checkout</h1>

        <div className="mb-10 flex overflow-hidden rounded-full border border-border">
          {["Contact Info", "Delivery", "Payment"].map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(i + 1)}
              className={`flex-1 border-0 py-3 text-[13px] font-semibold cursor-pointer transition-all ${
                step === i + 1 ? "bg-primary text-white" : "bg-white text-muted"
              } ${i < 2 ? "border-r border-border" : ""}`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="rounded-3xl border border-border bg-white p-8">
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="mb-1 font-display text-[22px] font-bold text-primary">Contact Information</h3>
                {["Full Name", "Email Address", "Phone (+974)"].map((label) => (
                  <div key={label}>
                    <label className={labelClass}>{label}</label>
                    <input placeholder={label} className={inputClass} />
                  </div>
                ))}
                <button type="button" className={`${tw.btnPrimary} justify-center`} onClick={() => setStep(2)}>
                  Continue to Delivery <Icons.ArrowRight />
                </button>
              </div>
            )}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h3 className="mb-1 font-display text-[22px] font-bold text-primary">Delivery Details</h3>
                {["Street Address", "Area / District", "City"].map((label) => (
                  <div key={label}>
                    <label className={labelClass}>{label}</label>
                    <input placeholder={label} className={inputClass} />
                  </div>
                ))}
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[13px] text-gray-700">
                  ✓ Free installation included · Est. delivery 1–2 business days
                </div>
                <div className="flex gap-2.5">
                  <button type="button" className={`${tw.btnOutline} flex-1 justify-center`} onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button type="button" className={`${tw.btnPrimary} flex-[2] justify-center`} onClick={() => setStep(3)}>
                    Continue to Payment <Icons.ArrowRight />
                  </button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <h3 className="mb-1 font-display text-[22px] font-bold text-primary">Payment</h3>
                <div className="flex flex-wrap gap-2.5">
                  {["Credit Card", "Bank Transfer", "Cash on Delivery"].map((m, i) => (
                    <button
                      key={m}
                      type="button"
                      className={`min-w-[120px] flex-1 rounded-xl px-2 py-3 text-xs font-semibold cursor-pointer ${
                        i === 0
                          ? "border-2 border-primary bg-primary text-white"
                          : "border border-border bg-white text-primary/80"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {["Card Number", "Expiry (MM/YY)", "CVV"].map((label) => (
                  <div key={label}>
                    <label className={labelClass}>{label}</label>
                    <input placeholder={label} className={inputClass} />
                  </div>
                ))}
                <div className="mt-2 flex gap-2.5">
                  <button type="button" className={`${tw.btnOutline} flex-1 justify-center`} onClick={() => setStep(2)}>
                    ← Back
                  </button>
                  <button type="button" className={`${tw.btnPrimary} flex-[2] justify-center`}>
                    Place Order · QAR {sub.toLocaleString()} <Icons.ArrowRight />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="sticky top-[100px] rounded-3xl border border-border bg-white p-6">
            <div className="mb-4 text-sm font-bold text-primary">
              Order Summary ({cart.length} item{cart.length !== 1 ? "s" : ""})
            </div>
            {cart.slice(0, 3).map((item) => (
              <div key={item.id} className="mb-3 flex gap-2.5 border-b border-bg-soft pb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img} alt={item.name} className="h-12 w-12 shrink-0 rounded-[10px] object-cover" loading="lazy" decoding="async" />
                <div className="flex-1">
                  <div className="text-xs font-semibold leading-snug text-primary">{item.name}</div>
                  <div className="text-[11px] text-muted">Qty: {item.qty}</div>
                </div>
                <div className="text-[13px] font-bold text-primary">QAR {(item.price * item.qty).toLocaleString()}</div>
              </div>
            ))}
            <div className="flex flex-col gap-2 border-t border-border pt-3">
              {[["Subtotal", `QAR ${sub.toLocaleString()}`], ["Installation", "FREE"], ["Total", `QAR ${sub.toLocaleString()}`]].map(
                ([l, v], i) => (
                  <div key={l} className={`flex justify-between ${i === 2 ? "mt-1 border-t border-border pt-2" : ""}`}>
                    <span className={`${i === 2 ? "text-sm font-bold text-primary" : "text-xs text-muted"}`}>{l}</span>
                    <span
                      className={`${i === 2 ? `${type.price} text-sm font-extrabold text-primary` : "text-xs font-medium"} ${
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
