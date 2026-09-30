"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "@/lib/types";
import type { PlaceOrderPayload } from "@/types/order.types";
import { productImageSurfaceClass } from "@/lib/store/product-image-utils";
import StoreImage from "@/components/StoreImage";
import * as Icons from "@/components/Icons";
import { tw, type } from "@/lib/theme";
import { showError, showSuccess } from "@/lib/toast";
import { getApiErrorMessage } from "@/lib/api/errors";
import { ROUTES } from "@/lib/routes";
import { getStoredAttribution } from "@/lib/utm";
import { getCurrentCoords } from "@/lib/geolocation";
import {
  clearDeliverySelection,
  hasVerifiedDeliverySelection,
  loadCheckoutProgress,
  saveCheckoutAddress,
  saveCheckoutProgress,
} from "@/lib/store/checkout-address-cache";
import {
  useCheckDeliveryMutation,
  useCountries,
  useValidateLocationMutation,
} from "@/hooks/useLocations";
import { usePublicDeliverySettings } from "@/hooks/useDeliverySettings";
import { DEFAULT_COUNTRY_ID, QATAR_ONLY_LOCATION_ERROR } from "@/types/location.types";
import type { ApiAreaSearchResult } from "@/types/location.types";
import LocationAreaSearchInput, {
  formatAreaSearchLabel,
} from "@/components/store/LocationAreaSearchInput";
import {
  isValidQatarPhone,
  normalizeRegisterPhone,
  sanitizeQatarPhoneInput,
} from "@/lib/utils";

const DeliveryMapPicker = dynamic(() => import("@/components/store/DeliveryMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-gray-50 text-sm text-muted">
      Loading map...
    </div>
  ),
});

export type DeliveryLocationMode = "list" | "map";

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  countryId: string;
  districtId: string;
  areaId: string;
  locationMode: DeliveryLocationMode;
  mapLat: number | null;
  mapLng: number | null;
  districtName?: string;
  areaName?: string;
}

interface DeliveryStatus {
  deliverable: boolean;
  message: string;
  districtId: string;
  areaId: string;
  districtName: string;
  areaName: string;
  distanceKm?: number | null;
  deliveryCharge?: number | null;
}

function formatLocationLabel(areaName?: string, districtName?: string) {
  if (!areaName && !districtName) return "";
  if (areaName && districtName) {
    return formatAreaSearchLabel({ name: areaName, districtName });
  }
  return areaName ?? districtName ?? "";
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
  countryId: DEFAULT_COUNTRY_ID,
  districtId: "",
  areaId: "",
  locationMode: "list",
  mapLat: null,
  mapLng: null,
};

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Same local 8-digit format as login/register phone fields. */
function toCheckoutPhoneDigits(phone: string): string {
  if (!phone.trim()) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("974") && digits.length >= 11) {
    return sanitizeQatarPhoneInput(digits.slice(3));
  }
  return sanitizeQatarPhoneInput(digits);
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
  const subRef = useRef(sub);
  subRef.current = sub;
  const { data: deliverySettings } = usePublicDeliverySettings();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CheckoutFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [submitError, setSubmitError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | null>(null);
  const [locationChecking, setLocationChecking] = useState(false);
  const [locating, setLocating] = useState(false);

  const deliveryCharge =
    deliveryStatus?.deliverable === true ? (deliveryStatus.deliveryCharge ?? 0) : 0;
  const orderTotal = sub + deliveryCharge;

  const { data: countries = [] } = useCountries();
  const validateLocationMut = useValidateLocationMutation();
  const checkDeliveryMut = useCheckDeliveryMutation();
  const validateLocationRef = useRef(validateLocationMut.mutateAsync);
  validateLocationRef.current = validateLocationMut.mutateAsync;
  const checkDeliveryRef = useRef(checkDeliveryMut.mutateAsync);
  checkDeliveryRef.current = checkDeliveryMut.mutateAsync;
  const lastValidatedKeyRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const formRef = useRef(form);
  formRef.current = form;
  const locationQueryRef = useRef(locationQuery);
  locationQueryRef.current = locationQuery;
  const selectedCountry = countries.find((c) => c._id === form.countryId);
  const resolvedDistrictName = deliveryStatus?.districtName ?? form.districtName ?? "";
  const resolvedAreaName = deliveryStatus?.areaName ?? form.areaName ?? "";
  const deliveryReady =
    deliveryStatus?.deliverable === true &&
    form.mapLat != null &&
    form.mapLng != null;

  const applyDeliveryResult = useCallback(
    (
      result: {
        deliverable: boolean;
        message: string;
        area?: { _id: string; name: string; districtId?: string };
        district?: { _id: string; name: string };
        distanceKm?: number | null;
        deliveryCharge?: number | null;
        lat?: number;
        lng?: number;
      },
      coords?: { lat: number | null; lng: number | null }
    ) => {
      if (result.deliverable && result.area && result.district) {
        const { area, district } = result;
        const label = formatLocationLabel(area.name, district.name);
        setLocationQuery(label);
        const lat = coords?.lat ?? result.lat ?? formRef.current.mapLat;
        const lng = coords?.lng ?? result.lng ?? formRef.current.mapLng;
        setForm((prev) => ({
          ...prev,
          districtId: district._id,
          areaId: area._id,
          locationMode: lat != null && lng != null ? "map" : "list",
          mapLat: lat ?? prev.mapLat,
          mapLng: lng ?? prev.mapLng,
          districtName: district.name,
          areaName: area.name,
        }));
        setDeliveryStatus({
          deliverable: true,
          message: result.message,
          districtId: district._id,
          areaId: area._id,
          districtName: district.name,
          areaName: area.name,
          distanceKm: result.distanceKm,
          deliveryCharge: result.deliveryCharge,
        });
        saveCheckoutAddress({
          ...formRef.current,
          districtId: district._id,
          areaId: area._id,
          locationMode: lat != null && lng != null ? "map" : "list",
          mapLat: lat ?? formRef.current.mapLat,
          mapLng: lng ?? formRef.current.mapLng,
          districtName: district.name,
          areaName: area.name,
        });
        setErrors((prev) => ({ ...prev, areaId: undefined }));
      } else {
        setForm((prev) => ({
          ...prev,
          districtId: "",
          areaId: "",
          districtName: "",
          areaName: "",
        }));
        const reason = result.message || QATAR_ONLY_LOCATION_ERROR;
        setDeliveryStatus({
          deliverable: false,
          message: reason,
          districtId: "",
          areaId: "",
          districtName: "",
          areaName: "",
        });
        setErrors((prev) => ({ ...prev, areaId: reason }));
      }
    },
    []
  );

  const runDeliveryValidation = useCallback(
    async (override?: { mapLat?: number | null; mapLng?: number | null; query?: string }) => {
      const currentForm = formRef.current;
      const query = (override?.query ?? locationQueryRef.current).trim();
      const mapLat = override?.mapLat ?? currentForm.mapLat;
      const mapLng = override?.mapLng ?? currentForm.mapLng;
      const hasCoords = mapLat != null && mapLng != null;
      const orderSubtotal = subRef.current;
      const key = hasCoords
        ? `map:${mapLat.toFixed(5)},${mapLng.toFixed(5)}:${orderSubtotal.toFixed(2)}`
        : `text:${query.toLowerCase()}:${orderSubtotal.toFixed(2)}`;

      if (!hasCoords && !query) {
        lastValidatedKeyRef.current = null;
        setDeliveryStatus(null);
        setForm((prev) => ({
          ...prev,
          districtId: "",
          areaId: "",
          districtName: "",
          areaName: "",
        }));
        return;
      }

      if (lastValidatedKeyRef.current === key) return;
      lastValidatedKeyRef.current = key;

      setLocationChecking(true);
      setDeliveryStatus(null);
      try {
        if (hasCoords) {
          const result = await validateLocationRef.current({
            lat: mapLat,
            lng: mapLng,
            countryId: currentForm.countryId || DEFAULT_COUNTRY_ID,
            subtotal: orderSubtotal,
          });
          applyDeliveryResult(result, { lat: mapLat, lng: mapLng });
          return;
        }

        const result = await checkDeliveryRef.current({
          countryId: currentForm.countryId || DEFAULT_COUNTRY_ID,
          q: query,
          subtotal: orderSubtotal,
        });
        applyDeliveryResult(result);
      } catch {
        setDeliveryStatus({
          deliverable: false,
          message: "Could not verify this location. Please try again.",
          districtId: "",
          areaId: "",
          districtName: "",
          areaName: "",
        });
        setForm((prev) => ({
          ...prev,
          districtId: "",
          areaId: "",
          districtName: "",
          areaName: "",
        }));
      } finally {
        setLocationChecking(false);
      }
    },
    [applyDeliveryResult]
  );

  useEffect(() => {
    if (addressLoaded) return;
    const progress = loadCheckoutProgress();
    if (progress) {
      const cached = progress.form;
      setForm((prev) => ({
        ...prev,
        ...cached,
        fullName: initialContact?.fullName || cached.fullName,
        email: initialContact?.email || cached.email,
        phone: toCheckoutPhoneDigits(initialContact?.phone || cached.phone),
      }));
      setStep(progress.step);
      if (progress.locationQuery) {
        setLocationQuery(progress.locationQuery);
      }
      if (progress.deliveryStatus) {
        setDeliveryStatus(progress.deliveryStatus);
      } else {
        const label = formatLocationLabel(cached.areaName, cached.districtName);
        if (hasVerifiedDeliverySelection(cached) && label) {
          setLocationQuery(label);
          setDeliveryStatus({
            deliverable: true,
            message: `Delivery available in ${label}`,
            districtId: cached.districtId,
            areaId: cached.areaId,
            districtName: cached.districtName ?? "",
            areaName: cached.areaName ?? "",
          });
        } else if (
          cached.mapLat != null &&
          cached.mapLng != null &&
          hasVerifiedDeliverySelection(cached)
        ) {
          setShowMap(true);
          void runDeliveryValidation({
            mapLat: cached.mapLat,
            mapLng: cached.mapLng,
          });
        }
      }
    } else if (initialContact) {
      setForm((prev) => ({
        ...prev,
        fullName: initialContact.fullName || prev.fullName,
        email: initialContact.email || prev.email,
        phone: toCheckoutPhoneDigits(initialContact.phone || prev.phone),
      }));
    }
    setAddressLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load cached address once
  }, [addressLoaded, initialContact]);

  useEffect(() => {
    if (!addressLoaded) return;
    saveCheckoutProgress({
      form,
      step,
      locationQuery,
      deliveryStatus,
    });
  }, [addressLoaded, form, step, locationQuery, deliveryStatus]);

  useEffect(() => {
    if (!addressLoaded) return;
    const hasCoords = form.mapLat != null && form.mapLng != null;
    const query = locationQuery.trim();
    if (!hasCoords && !query) return;
    lastValidatedKeyRef.current = null;
    void runDeliveryValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-quote when cart subtotal changes
  }, [sub, addressLoaded]);

  const inputClass = (field: keyof CheckoutFormData) =>
    `w-full rounded-xl border bg-bg px-3.5 py-3 text-sm text-primary outline-none focus:border-accent ${
      errors[field] ? "border-red-400" : "border-border"
    }`;
  const labelClass = "mb-1.5 block text-sm font-bold text-gray-800";

  const scheduleLocationValidation = () => {
    if (debounceTimerRef.current != null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    lastValidatedKeyRef.current = null;
    debounceTimerRef.current = window.setTimeout(() => {
      void runDeliveryValidation();
    }, 500);
  };

  const handleLocationQueryChange = (value: string) => {
    setLocationQuery(value);
    setDeliveryStatus(null);
    lastValidatedKeyRef.current = null;
    clearDeliverySelection();
    setForm((prev) => ({
      ...prev,
      mapLat: null,
      mapLng: null,
      districtId: "",
      areaId: "",
      districtName: "",
      areaName: "",
    }));
    if (errors.areaId) {
      setErrors((prev) => ({ ...prev, areaId: undefined }));
    }
    scheduleLocationValidation();
  };

  const handleAreaSelect = (area: ApiAreaSearchResult) => {
    const label = formatAreaSearchLabel(area);
    setLocationQuery(label);
    setDeliveryStatus(null);
    lastValidatedKeyRef.current = null;
    if (errors.areaId) {
      setErrors((prev) => ({ ...prev, areaId: undefined }));
    }
    setForm((prev) => ({
      ...prev,
      mapLat: area.lat,
      mapLng: area.lng,
      locationMode: "map",
      districtId: "",
      areaId: "",
      districtName: "",
      areaName: "",
    }));
    void runDeliveryValidation({
      mapLat: area.lat,
      mapLng: area.lng,
      query: label,
    });
  };

  const handleLocationBlur = () => {
    if (debounceTimerRef.current != null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    lastValidatedKeyRef.current = null;
    void runDeliveryValidation();
  };

  const handleMapPick = (lat: number, lng: number) => {
    lastValidatedKeyRef.current = null;
    setForm((prev) => ({
      ...prev,
      mapLat: lat,
      mapLng: lng,
      locationMode: "map",
    }));
    void runDeliveryValidation({ mapLat: lat, mapLng: lng });
  };

  const handleUseMyLocation = async () => {
    setLocating(true);
    try {
      const { lat, lng } = await getCurrentCoords();
      handleMapPick(lat, lng);
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Could not get your location. Please pick a point on the map."
      );
    } finally {
      setLocating(false);
    }
  };

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
    else if (!isValidQatarPhone(form.phone)) {
      next.phone = "Enter an 8-digit Qatar mobile number (starts with 3, 5, 6, or 7)";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: Partial<Record<keyof CheckoutFormData, string>> = {};
    if (!form.line1.trim()) next.line1 = "Street address is required";
    if (!locationQuery.trim() && form.mapLat == null) {
      next.areaId = "Enter your delivery location or pick on the map";
    } else if (!deliveryReady) {
      next.areaId =
        deliveryStatus?.message ??
        QATAR_ONLY_LOCATION_ERROR;
    }
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
      const attribution = getStoredAttribution();
      const orderNumber = await onPlaceOrder({
        deliveryAddress: {
          fullName: form.fullName.trim(),
          phone: normalizeRegisterPhone(form.phone),
          line1: form.line1.trim(),
          line2: resolvedAreaName ?? "",
          city: resolvedDistrictName ?? "",
          state: resolvedDistrictName ?? "",
          country: selectedCountry?.name ?? "Qatar",
          lat: form.mapLat ?? undefined,
          lng: form.mapLng ?? undefined,
        },
        paymentMethod: "cash_on_delivery",
        attribution,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
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
              className={`flex-1 border-0 px-1 py-3 text-[13px] font-semibold leading-snug cursor-pointer transition-all sm:text-[13px] ${
                step === i + 1 ? "bg-primary text-white" : "bg-white text-gray-700"
              } ${i < 2 ? "sm:border-r sm:border-border" : ""} ${i > 0 ? "border-t border-border sm:border-t-0" : ""}`}
            >
              <span className="sm:hidden">{i + 1}. {s}</span>
              <span className="hidden sm:inline">{i + 1}. {s}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
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
                    Phone (Qatar) <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`flex overflow-hidden rounded-xl border bg-bg focus-within:border-accent ${
                      errors.phone ? "border-red-400 focus-within:border-red-400" : "border-border"
                    }`}
                  >
                    <span className="flex items-center border-r border-border bg-bg-soft px-3 text-sm font-semibold text-primary">
                      +974
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      required
                      maxLength={8}
                      value={form.phone}
                      onChange={(e) =>
                        setField("phone", sanitizeQatarPhoneInput(e.target.value))
                      }
                      placeholder="00000000"
                      autoComplete="tel-national"
                      className="w-full border-0 bg-transparent px-3.5 py-3 text-sm text-primary outline-none placeholder:text-muted/50"
                    />
                  </div>
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
                  <label className={labelClass} htmlFor="locationQuery">
                    Delivery Location <span className="text-red-500">*</span>
                  </label>
                  <LocationAreaSearchInput
                    id="locationQuery"
                    value={locationQuery}
                    onChange={handleLocationQueryChange}
                    onSelect={handleAreaSelect}
                    onBlur={handleLocationBlur}
                    showSearchIcon
                    className={inputClass("areaId")}
                  />
                  {locationChecking ? (
                    <p className="mt-1 text-sm md:text-xs text-muted">
                      Checking delivery availability...
                    </p>
                  ) : deliveryStatus?.deliverable ? (
                    <p className="mt-1 text-sm md:text-xs text-green-600">
                      ✓ {deliveryStatus.message}
                    </p>
                  ) : deliveryStatus && !deliveryStatus.deliverable ? (
                    <p className="mt-1 text-sm md:text-xs text-red-600">
                      {deliveryStatus.message}
                    </p>
                  ) : errors.areaId ? (
                    <p className="mt-1 text-sm md:text-xs text-red-600">{errors.areaId}</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setShowMap((v) => !v)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    {showMap ? "Hide map" : "Pick location on map"}
                  </button>
                </div>

                {showMap ? (
                  <div className="rounded-xl border border-border bg-gray-50 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-primary">Pick delivery location</p>
                      <button
                        type="button"
                        onClick={() => void handleUseMyLocation()}
                        disabled={locationChecking || locating}
                        className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-primary hover:bg-gray-100 disabled:opacity-50"
                      >
                        {locating ? "Locating..." : "Use my location"}
                      </button>
                    </div>
                    <DeliveryMapPicker
                      lat={form.mapLat}
                      lng={form.mapLng}
                      countryId={form.countryId}
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
                      onPick={handleMapPick}
                    />
                  </div>
                ) : null}

                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[13px] text-gray-700">
                  ✓ Delivery within {deliverySettings?.maxRadiusKm ?? 20} km of our store · Free
                  installation included
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
                    className={`${tw.btnPrimary} flex-[2] justify-center disabled:opacity-50`}
                    disabled={!deliveryReady || locationChecking}
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
                    {placing ? "Placing Order..." : `Place Order · QAR ${orderTotal.toLocaleString()}`}{" "}
                    {!placing ? <Icons.ArrowRight /> : null}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="sticky top-[100px] rounded-3xl border border-border bg-white p-4 sm:p-6">
            <div className="mb-4 text-base font-bold text-gray-900 sm:text-sm">
              Order Summary ({cart.length} item{cart.length !== 1 ? "s" : ""})
            </div>
            {cart.slice(0, 3).map((item) => (
              <div key={item.id} className="mb-3 flex gap-2.5 border-b border-bg-soft pb-3">
                <div className={`h-12 w-12 shrink-0 overflow-hidden rounded-[10px] ${productImageSurfaceClass}`}>
                  <StoreImage src={item.img} alt={item.name} className="h-full w-full object-contain" />
                </div>
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
              {[
                ["Subtotal", `QAR ${sub.toLocaleString()}`],
                [
                  "Delivery",
                  deliveryStatus?.deliverable
                    ? deliveryCharge === 0
                      ? "FREE"
                      : `QAR ${deliveryCharge.toLocaleString()}`
                    : "—",
                ],
                ["Installation", "FREE"],
                ["Total", `QAR ${orderTotal.toLocaleString()}`],
              ].map(
                ([l, v], i) => (
                  <div
                    key={l}
                    className={`flex justify-between ${i === 3 ? "mt-1 border-t border-border pt-2" : ""}`}
                  >
                    <span
                      className={`${i === 3 ? "text-sm font-bold text-primary" : "text-sm font-medium text-gray-700"}`}
                    >
                      {l}
                    </span>
                    <span
                      className={`${i === 3 ? `${type.price} text-sm font-extrabold text-primary` : "text-sm font-medium"} ${
                        i === 2 ? "text-gray-700" : "text-gray-900"
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
