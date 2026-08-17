"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { useAreas, useCountries, useDistricts, useValidateLocationMutation } from "@/hooks/useLocations";
import { DEFAULT_COUNTRY_ID, MAP_PICK_AREA_ID } from "@/types/location.types";

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
}

interface MapValidation {
  deliverable: boolean;
  message: string;
  districtId: string;
  areaId: string;
  districtName: string;
  areaName: string;
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
  const [mapValidation, setMapValidation] = useState<MapValidation | null>(null);
  const [mapChecking, setMapChecking] = useState(false);

  const { data: countries = [] } = useCountries();
  const { data: districts = [], isLoading: districtsLoading } = useDistricts(form.countryId);
  const { data: areas = [], isLoading: areasLoading } = useAreas(form.districtId);
  const validateLocationMut = useValidateLocationMutation();
  const validateLocationRef = useRef(validateLocationMut.mutateAsync);
  validateLocationRef.current = validateLocationMut.mutateAsync;
  const lastValidatedCoordsRef = useRef<string | null>(null);
  const formRef = useRef(form);
  formRef.current = form;
  const isMapMode = form.locationMode === "map";
  const selectedCountry = countries.find((c) => c._id === form.countryId);
  const selectedDistrict = districts.find((d) => d._id === form.districtId);
  const selectedArea = areas.find((a) => a._id === form.areaId);
  const resolvedDistrictName = selectedDistrict?.name ?? mapValidation?.districtName ?? "";
  const resolvedAreaName = selectedArea?.name ?? mapValidation?.areaName ?? "";
  const deliveryReady = isMapMode
    ? mapValidation?.deliverable === true
    : !!form.districtId && !!form.areaId && form.areaId !== MAP_PICK_AREA_ID;

  const runMapValidation = useCallback(async (lat: number, lng: number) => {
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (lastValidatedCoordsRef.current === key) return;
    lastValidatedCoordsRef.current = key;

    setMapChecking(true);
    setMapValidation(null);
    try {
      const result = await validateLocationRef.current({ lat, lng });
      if (result.deliverable && result.area && result.district) {
        const preselectedDistrict = formRef.current.districtId;
        if (preselectedDistrict && preselectedDistrict !== result.district._id) {
          setMapValidation({
            deliverable: false,
            message:
              "This location is outside your selected district. Pick a point inside your district or change district first.",
            districtId: "",
            areaId: "",
            districtName: "",
            areaName: "",
          });
          setForm((prev) => ({ ...prev, areaId: "" }));
          return;
        }
        setForm((prev) => ({
          ...prev,
          districtId: result.district!._id,
          areaId: result.area!._id,
          locationMode: "list",
        }));
        setMapValidation({
          deliverable: true,
          message: result.message,
          districtId: result.district._id,
          areaId: result.area._id,
          districtName: result.district.name,
          areaName: result.area.name,
        });
        setErrors((prev) => ({ ...prev, areaId: undefined, districtId: undefined }));
      } else {
        setForm((prev) => ({ ...prev, areaId: "" }));
        setMapValidation({
          deliverable: false,
          message: result.message,
          districtId: "",
          areaId: "",
          districtName: "",
          areaName: "",
        });
      }
    } catch {
      setMapValidation({
        deliverable: false,
        message: "Could not verify this location. Please try again.",
        districtId: "",
        areaId: "",
        districtName: "",
        areaName: "",
      });
      setForm((prev) => ({ ...prev, areaId: "" }));
    } finally {
      setMapChecking(false);
    }
  }, []);

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
      if (
        cached.locationMode === "map" &&
        cached.mapLat != null &&
        cached.mapLng != null
      ) {
        void runMapValidation(cached.mapLat, cached.mapLng);
      }
    } else if (initialContact) {
      setForm((prev) => ({
        ...prev,
        fullName: initialContact.fullName || prev.fullName,
        email: initialContact.email || prev.email,
        phone: initialContact.phone || prev.phone,
      }));
    }
    setAddressLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load cached address once
  }, [addressLoaded, initialContact]);

  const inputClass = (field: keyof CheckoutFormData) =>
    `w-full rounded-xl border bg-bg px-3.5 py-3 text-sm text-primary outline-none focus:border-accent ${
      errors[field] ? "border-red-400" : "border-border"
    }`;
  const selectClass = (field: keyof CheckoutFormData) =>
    `${inputClass(field)} cursor-pointer appearance-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-muted`;
  const labelClass = "mb-1.5 block text-sm md:text-xs font-bold text-primary/80";

  const handleDistrictChange = (districtId: string) => {
    lastValidatedCoordsRef.current = null;
    setForm((prev) => ({
      ...prev,
      districtId,
      areaId: "",
      locationMode: "list",
      mapLat: null,
      mapLng: null,
    }));
    setMapValidation(null);
    setErrors((prev) => ({ ...prev, districtId: undefined, areaId: undefined }));
  };

  const handleAreaChange = (areaId: string) => {
    lastValidatedCoordsRef.current = null;
    if (areaId === MAP_PICK_AREA_ID) {
      setForm((prev) => ({
        ...prev,
        areaId: MAP_PICK_AREA_ID,
        locationMode: "map",
        mapLat: null,
        mapLng: null,
      }));
      setMapValidation(null);
      setErrors((prev) => ({ ...prev, areaId: undefined }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      areaId,
      locationMode: "list",
      mapLat: null,
      mapLng: null,
    }));
    setMapValidation(null);
    setErrors((prev) => ({ ...prev, areaId: undefined }));
  };

  const handleOpenMap = () => {
    if (!form.districtId) {
      setErrors((prev) => ({ ...prev, districtId: "Select district first" }));
      return;
    }
    handleAreaChange(MAP_PICK_AREA_ID);
  };

  const handleMapPick = (lat: number, lng: number) => {
    lastValidatedCoordsRef.current = null;
    setForm((prev) => ({
      ...prev,
      mapLat: lat,
      mapLng: lng,
      locationMode: "map",
      areaId: MAP_PICK_AREA_ID,
    }));
    void runMapValidation(lat, lng);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => handleMapPick(pos.coords.latitude, pos.coords.longitude),
      () => showError("Could not get your location. Please pick a point on the map.")
    );
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
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: Partial<Record<keyof CheckoutFormData, string>> = {};
    if (!form.line1.trim()) next.line1 = "Street address is required";
    if (isMapMode) {
      if (form.mapLat == null || form.mapLng == null) {
        next.areaId = "Pick your delivery location on the map";
      } else if (!mapValidation?.deliverable) {
        next.areaId =
          mapValidation?.message ??
          "This location is outside our delivery zone. Pick a deliverable area to continue.";
      }
    } else {
      if (!form.districtId) next.districtId = "District is required";
      if (!form.areaId || form.areaId === MAP_PICK_AREA_ID) next.areaId = "Area is required";
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
      const orderNumber = await onPlaceOrder({
        deliveryAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          line1: form.line1.trim(),
          line2: resolvedAreaName ?? "",
          city: resolvedDistrictName ?? "",
          state: resolvedDistrictName ?? "",
          country: selectedCountry?.name ?? "Qatar",
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
                  <label className={labelClass} htmlFor="country">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="country"
                    value={form.countryId}
                    disabled
                    className={selectClass("countryId")}
                  >
                    {countries.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                    {countries.length === 0 ? (
                      <option value={DEFAULT_COUNTRY_ID}>Qatar</option>
                    ) : null}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="district">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="district"
                    value={form.districtId}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    disabled={districtsLoading}
                    className={selectClass("districtId")}
                  >
                    <option value="">
                      {districtsLoading ? "Loading districts..." : "Select district"}
                    </option>
                    {districts.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {errors.districtId ? (
                    <p className="mt-1 text-sm md:text-xs text-red-600">{errors.districtId}</p>
                  ) : null}
                </div>
                <div>
                  <label className={labelClass} htmlFor="area">
                    Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="area"
                    value={isMapMode ? "" : form.areaId}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    disabled={!form.districtId || areasLoading}
                    className={selectClass("areaId")}
                  >
                    <option value="">
                      {!form.districtId
                        ? "Select district first"
                        : areasLoading
                          ? "Loading areas..."
                          : "Select area"}
                    </option>
                    {areas.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  {mapValidation?.deliverable && !isMapMode ? (
                    <p className="mt-1 text-sm md:text-xs text-green-600">{mapValidation.message}</p>
                  ) : null}
                  {!isMapMode ? (
                    <button
                      type="button"
                      onClick={handleOpenMap}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Can&apos;t find your area? Pick on map
                    </button>
                  ) : null}
                  {!isMapMode && errors.areaId ? (
                    <p className="mt-1 text-sm md:text-xs text-red-600">{errors.areaId}</p>
                  ) : null}
                </div>

                {isMapMode ? (
                  <div className="rounded-xl border border-border bg-gray-50 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-primary">Pick delivery location</p>
                      <button
                        type="button"
                        onClick={handleUseMyLocation}
                        disabled={mapChecking}
                        className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-primary hover:bg-gray-100 disabled:opacity-50"
                      >
                        Use my location
                      </button>
                    </div>
                    <DeliveryMapPicker
                      lat={form.mapLat}
                      lng={form.mapLng}
                      districtId={form.districtId}
                      districtName={selectedDistrict?.name}
                      onPick={handleMapPick}
                    />
                    {mapChecking ? (
                      <p className="mt-2 text-sm text-muted">Checking delivery availability...</p>
                    ) : mapValidation?.deliverable ? (
                      <p className="mt-2 text-sm text-green-600">✓ {mapValidation.message}</p>
                    ) : mapValidation && !mapValidation.deliverable ? (
                      <p className="mt-2 text-sm text-red-600">{mapValidation.message}</p>
                    ) : (
                      <p className="mt-2 text-sm text-muted">
                        Tap the map to choose your location inside {selectedDistrict?.name ?? "the selected district"}.
                      </p>
                    )}
                    {errors.areaId ? (
                      <p className="mt-2 text-sm md:text-xs text-red-600">{errors.areaId}</p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          locationMode: "list",
                          areaId: mapValidation?.areaId ?? "",
                        }))
                      }
                      className="mt-3 text-xs font-semibold text-muted hover:text-primary"
                    >
                      ← Back to area list
                    </button>
                  </div>
                ) : null}

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
                    className={`${tw.btnPrimary} flex-[2] justify-center disabled:opacity-50`}
                    disabled={isMapMode && !deliveryReady}
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
