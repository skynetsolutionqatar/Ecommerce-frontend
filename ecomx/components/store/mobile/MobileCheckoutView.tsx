"use client";

import dynamic from "next/dynamic";
import { ChevronLeft, Lock } from "lucide-react";
import StoreImage from "@/components/StoreImage";
import LocationAreaSearchInput from "@/components/store/LocationAreaSearchInput";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import { formatPrice, sanitizeQatarPhoneInput } from "@/lib/utils";
import type { CartItem } from "@/lib/types";
import type { ApiAreaSearchResult } from "@/types/location.types";
import type { PublicDeliverySettings } from "@/types/delivery-settings.types";

const DeliveryMapPicker = dynamic(() => import("@/components/store/DeliveryMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
      Loading map...
    </div>
  ),
});

const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-[#0a255d]";

export default function MobileCheckoutView({
  cartCount,
  cart,
  subtotal,
  deliveryLabel,
  toPay,
  onBack,
  isLoggedIn,
  onSignIn,
  onChangeAddress,
  fullName,
  email,
  phone,
  line1,
  locationQuery,
  errors,
  onFullName,
  onEmail,
  onPhone,
  onLine1,
  onLocationChange,
  onLocationSelect,
  onLocationBlur,
  locationChecking,
  deliveryMessage,
  deliveryOk,
  showMap,
  onToggleMap,
  locating,
  onUseMyLocation,
  mapLat,
  mapLng,
  countryId,
  deliverySettings,
  onMapPick,
  showSaveDefault,
  saveAsDefault,
  onSaveDefault,
  placing,
  submitError,
  onPlaceOrder,
}: {
  cartCount: number;
  cart: CartItem[];
  subtotal: number;
  deliveryLabel: string;
  toPay: number;
  onBack: () => void;
  isLoggedIn: boolean;
  onSignIn: () => void;
  onChangeAddress: () => void;
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  locationQuery: string;
  errors: Partial<Record<"fullName" | "email" | "phone" | "line1" | "areaId", string>>;
  onFullName: (value: string) => void;
  onEmail: (value: string) => void;
  onPhone: (value: string) => void;
  onLine1: (value: string) => void;
  onLocationChange: (value: string) => void;
  onLocationSelect: (area: ApiAreaSearchResult) => void;
  onLocationBlur: () => void;
  locationChecking: boolean;
  deliveryMessage?: string;
  deliveryOk: boolean;
  showMap: boolean;
  onToggleMap: () => void;
  locating: boolean;
  onUseMyLocation: () => void;
  mapLat: number | null;
  mapLng: number | null;
  countryId: string;
  deliverySettings?: PublicDeliverySettings | null;
  onMapPick: (lat: number, lng: number) => void;
  showSaveDefault: boolean;
  saveAsDefault: boolean;
  onSaveDefault: (value: boolean) => void;
  placing: boolean;
  submitError?: string;
  onPlaceOrder: () => void;
}) {
  return (
    <div className="mobile-checkout flex min-h-[100dvh] flex-col bg-[#f1f3f6]">
      <header className="flex items-center gap-2 border-b border-gray-200 bg-white px-2 pb-3 pt-[max(10px,env(safe-area-inset-top))]">
        <button type="button" onClick={onBack} className="flex h-11 w-11 items-center justify-center rounded-full border-0 bg-transparent" aria-label="Back">
          <ChevronLeft className="h-6 w-6" strokeWidth={2.2} />
        </button>
        <div>
          <h1 className="text-[18px] font-extrabold leading-tight text-gray-900">Checkout</h1>
          <p className="text-xs text-gray-500">
            {cartCount} {cartCount === 1 ? "item" : "items"} · Cash on delivery
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4 pb-28 pt-3.5">
        {!isLoggedIn ? (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e8eef8] text-[#0a255d]">
              <Lock className="h-[19px] w-[19px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-extrabold text-gray-900">Sign in to place your order</span>
              <span className="block text-xs text-gray-500">Your cart and address details are kept.</span>
            </span>
            <button type="button" onClick={onSignIn} className="rounded-lg border-0 bg-[#0a255d] px-3 py-2 text-xs font-bold text-white">
              Sign in
            </button>
          </div>
        ) : null}

        <div>
          <p className={`px-1 text-xs font-semibold ${deliveryOk ? "text-emerald-700" : "text-red-600"}`}>
            {deliveryOk ? deliveryMessage || "We deliver to this area" : "Set and check your delivery area to place the order"}
          </p>
        </div>

        <section className="flex flex-col gap-3.5 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-extrabold text-gray-900">Contact and address</h2>
            {isLoggedIn ? (
              <button type="button" onClick={onChangeAddress} className="border-0 bg-transparent text-sm font-bold text-[#0a255d]">
                Change
              </button>
            ) : null}
          </div>
          <label className="block text-sm font-bold text-gray-800">
            Full name
            <input id="m-fullName" value={fullName} onChange={(e) => onFullName(e.target.value)} className={`${fieldClass} mt-1.5`} autoComplete="name" />
            {errors.fullName ? <span className="mt-1 block text-xs font-medium text-red-600">{errors.fullName}</span> : null}
          </label>
          <label className="block text-sm font-bold text-gray-800">
            Email
            <input id="m-email" type="email" value={email} onChange={(e) => onEmail(e.target.value)} className={`${fieldClass} mt-1.5`} autoComplete="email" />
            {errors.email ? <span className="mt-1 block text-xs font-medium text-red-600">{errors.email}</span> : null}
          </label>
          <label className="block text-sm font-bold text-gray-800">
            Phone
            <span className="mt-1.5 flex overflow-hidden rounded-xl border border-gray-200">
              <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-sm font-semibold">+974</span>
              <input id="m-phone" inputMode="numeric" maxLength={8} value={phone} onChange={(e) => onPhone(sanitizeQatarPhoneInput(e.target.value))} className="w-full border-0 px-3 py-3 text-sm outline-none" placeholder="00000000" />
            </span>
            {errors.phone ? <span className="mt-1 block text-xs font-medium text-red-600">{errors.phone}</span> : null}
          </label>
          <label className="block text-sm font-bold text-gray-800">
            Building, street, zone
            <input id="m-line1" value={line1} onChange={(e) => onLine1(e.target.value)} className={`${fieldClass} mt-1.5`} />
            {errors.line1 ? <span className="mt-1 block text-xs font-medium text-red-600">{errors.line1}</span> : null}
          </label>
          <label className="block text-sm font-bold text-gray-800">
            Delivery location
            <LocationAreaSearchInput
              id="m-location"
              value={locationQuery}
              onChange={onLocationChange}
              onSelect={onLocationSelect}
              onBlur={onLocationBlur}
              onClear={() => onLocationChange("")}
              showSearchIcon
              clearable
              className={`${fieldClass} mt-1.5`}
            />
            {locationChecking ? (
              <span className="mt-1 block text-xs text-gray-500">Checking delivery availability...</span>
            ) : deliveryOk ? (
              <span className="mt-1 block text-xs font-semibold text-emerald-700">{deliveryMessage}</span>
            ) : errors.areaId ? (
              <span className="mt-1 block text-xs font-medium text-red-600">{errors.areaId}</span>
            ) : null}
          </label>
          <button type="button" onClick={onToggleMap} className="self-start border-0 bg-transparent text-xs font-semibold text-[#0a255d]">
            {showMap ? "Hide map" : "Pick location on map"}
          </button>
          {showMap ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <button type="button" onClick={onUseMyLocation} disabled={locationChecking || locating} className="mb-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
                {locating ? "Locating..." : "Use my location"}
              </button>
              <DeliveryMapPicker
                lat={mapLat}
                lng={mapLng}
                countryId={countryId}
                storeOrigin={
                  deliverySettings
                    ? {
                        lat: deliverySettings.originLat,
                        lng: deliverySettings.originLng,
                        maxRadiusKm: deliverySettings.maxRadiusKm,
                        label: deliverySettings.originLabel,
                      }
                    : undefined
                }
                onPick={onMapPick}
              />
            </div>
          ) : null}
          {showSaveDefault ? (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={saveAsDefault} onChange={(e) => onSaveDefault(e.target.checked)} className="h-4 w-4" />
              Set as default delivery address
            </label>
          ) : null}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-1 text-base font-extrabold text-gray-900">Items ({cartCount})</h2>
          {cart.map((item, index) => (
            <div key={item.id} className={`flex items-center gap-3 py-2.5 ${index > 0 ? "border-t border-gray-100" : ""}`}>
              <span className={`h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200 ${productImageSurfaceClass}`}>
                <StoreImage src={item.img} alt="" className="h-full w-full object-contain" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-gray-800">{item.name}</span>
                <span className="text-xs text-gray-500">{item.qty} × {formatPrice(item.price)}</span>
              </span>
              <span className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
        </section>

        <section className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-lg" aria-hidden>💵</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold text-gray-900">Cash on delivery</span>
            <span className="block text-xs text-gray-500">Pay when your order arrives</span>
          </span>
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-[#0a255d]" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#0a255d]" />
          </span>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-base font-extrabold text-gray-900">Bill details</h2>
          <div className="flex justify-between text-sm text-gray-600"><span>Item total</span><span>{formatPrice(subtotal)}</span></div>
          <div className="mt-2 flex justify-between text-sm text-gray-600"><span>Delivery</span><span>{deliveryLabel}</span></div>
          <div className="mt-2 flex justify-between text-sm text-gray-600"><span>VAT</span><span>Included</span></div>
          <div className="mt-2.5 flex justify-between border-t border-dashed border-gray-300 pt-2.5 text-[17px] font-extrabold">
            <span>To pay</span><span>{formatPrice(toPay)}</span>
          </div>
          {submitError ? <p className="mt-2 text-xs font-medium text-red-600">{submitError}</p> : null}
        </section>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-[120] flex items-center gap-3.5 rounded-t-2xl border-t border-gray-200 bg-white px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3.5 md:hidden">
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-extrabold leading-6">{formatPrice(toPay)}</p>
        </div>
        <button type="button" disabled={placing} onClick={onPlaceOrder} className="h-12 flex-1 rounded-lg border-0 bg-[#0a255d] text-base font-bold text-white disabled:opacity-60">
          {placing ? "Placing order..." : "Place order"}
        </button>
      </footer>
    </div>
  );
}
