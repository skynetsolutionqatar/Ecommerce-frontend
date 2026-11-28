"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronRight,
  FileText,
  Globe,
  Heart,
  HelpCircle,
  LogOut,
  Map,
  MapPin,
  Moon,
  Package,
  User,
} from "lucide-react";
import MobileDeliveryAreaSheet from "@/components/store/mobile/MobileDeliveryAreaSheet";
import { readDeliveryAreaLabel } from "@/lib/store/delivery-area-label";
import { MOBILE_TAB_BAR_HEIGHT_PX } from "@/lib/store/mobile-chrome";
import { ROUTES } from "@/lib/routes";
import { accountContactLabel } from "@/lib/auth-utils";
import { authApi } from "@/lib/api/auth.api";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import type { AuthUser } from "@/types/auth.types";

const HEADER_NAVY = "#0a255d";

export default function MobileAccountTab({
  user,
  wishlistCount,
  onLoginOpen,
  onLogout,
  onWishlistOpen,
}: {
  user?: AuthUser | null;
  wishlistCount: number;
  onLoginOpen: () => void;
  onLogout?: () => void;
  onWishlistOpen: () => void;
}) {
  const router = useRouter();
  const isLoggedIn = useAuthStore(selectIsAuthenticated);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [areaSheetOpen, setAreaSheetOpen] = useState(false);
  const [areaLabel, setAreaLabel] = useState(() => readDeliveryAreaLabel(""));
  const hasArea = areaLabel !== "Select your area" && areaLabel.length > 0;

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "";
  const initial = firstName.charAt(0).toUpperCase();
  const contact = user ? accountContactLabel(user.email, user.phone) : "";

  const refreshArea = () => setAreaLabel(readDeliveryAreaLabel(""));

  const signOut = () => {
    if (!window.confirm("Sign out? You can sign in again anytime.")) return;
    void authApi
      .logout()
      .catch(() => {})
      .finally(() => {
        clearAuth();
        onLogout?.();
      });
  };

  return (
    <div className="mobile-account-tab min-h-[100dvh] bg-[#f1f3f6] lg:hidden">
      <div
        className="relative overflow-hidden rounded-b-[20px] px-4 pb-[22px]"
        style={{ background: HEADER_NAVY, paddingTop: "max(16px, env(safe-area-inset-top))" }}
      >
        <div
          className="pointer-events-none absolute -right-[70px] -top-[90px] h-[240px] w-[240px] rounded-full border border-white/10"
          aria-hidden
        />
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/15 text-white">
          {isLoggedIn && initial ? (
            <span className="text-[22px] font-extrabold">{initial}</span>
          ) : (
            <User className="h-[26px] w-[26px]" strokeWidth={1.8} />
          )}
        </div>
        <h1 className="mt-2 text-[22px] font-extrabold leading-7 text-white">
          {isLoggedIn ? `Hello, ${firstName || "there"}` : "Hello, guest"}
        </h1>
        {isLoggedIn ? (
          contact ? <p className="text-sm leading-5 text-white/80">{contact}</p> : null
        ) : (
          <>
            <p className="text-sm leading-5 text-white/80">
              Sign in to track orders, save addresses and reorder in one tap.
            </p>
            <button
              type="button"
              onClick={onLoginOpen}
              className="mt-3 w-full rounded-xl bg-white py-3 text-[15px] font-extrabold text-[#0a255d]"
            >
              Sign in or create account
            </button>
          </>
        )}
      </div>

      <div
        className="flex flex-col gap-3.5 px-4 pt-4"
        style={{ paddingBottom: MOBILE_TAB_BAR_HEIGHT_PX + 24 }}
      >
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          <Shortcut
            label="Orders"
            icon={<Package className="h-5 w-5" strokeWidth={1.75} />}
            onClick={() => (isLoggedIn ? router.push(ROUTES.orders) : onLoginOpen())}
            tone="tint"
          />
          <Shortcut
            label="Wishlist"
            icon={<Heart className="h-5 w-5" strokeWidth={1.75} />}
            badge={wishlistCount}
            onClick={onWishlistOpen}
            tone="danger"
          />
          <Shortcut
            label="Help"
            icon={<HelpCircle className="h-5 w-5" strokeWidth={1.75} />}
            onClick={() => router.push(ROUTES.faq)}
            tone="success"
          />
        </div>

        <SettingsCard>
          {isLoggedIn ? (
            <>
              <SettingsRow
                icon={<User className="h-5 w-5" />}
                label="Personal info"
                value={user?.name?.trim() || undefined}
                onClick={() => router.push(`${ROUTES.account}?section=profile`)}
              />
              <SettingsRow
                icon={<MapPin className="h-5 w-5" />}
                label="Saved addresses"
                value="Manage"
                onClick={() => router.push(ROUTES.accountAddresses)}
              />
            </>
          ) : null}
          <SettingsRow
            icon={<Map className="h-5 w-5" />}
            label="Delivery area"
            value={hasArea ? areaLabel : undefined}
            hint={hasArea ? undefined : "Set area"}
            onClick={() => setAreaSheetOpen(true)}
          />
          <SettingsRow icon={<Moon className="h-5 w-5" />} label="Appearance" value="System" />
          <SettingsRow icon={<Bell className="h-5 w-5" />} label="Notifications" value="On" />
          <SettingsRow icon={<Globe className="h-5 w-5" />} label="Country & currency" value="Qatar · QAR" />
          <SettingsRow
            icon={<HelpCircle className="h-5 w-5" />}
            label="FAQ"
            onClick={() => router.push(ROUTES.faq)}
          />
          <SettingsRow
            icon={<FileText className="h-5 w-5" />}
            label="Terms & cancellation policy"
            onClick={() => router.push(ROUTES.terms)}
          />
        </SettingsCard>

        {isLoggedIn ? (
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-left"
          >
            <LogOut className="h-5 w-5 text-gray-600" strokeWidth={1.75} />
            <span className="text-sm font-bold text-gray-900">Sign out</span>
          </button>
        ) : null}

        <p className="pt-1 text-center text-xs text-gray-500">Skynet Store</p>
      </div>

      <MobileDeliveryAreaSheet
        open={areaSheetOpen}
        onClose={() => {
          setAreaSheetOpen(false);
          refreshArea();
        }}
      />
    </div>
  );
}

function Shortcut({
  label,
  icon,
  badge,
  onClick,
  tone,
}: {
  label: string;
  icon: React.ReactNode;
  badge?: number;
  onClick: () => void;
  tone: "tint" | "danger" | "success";
}) {
  const bg =
    tone === "danger" ? "bg-red-50 text-red-600" : tone === "success" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-[#0a255d]";
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-1.5 py-2.5 text-center sm:gap-2 sm:px-2 sm:py-3"
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${bg}`}>
        {icon}
      </span>
      <span className="w-full truncate text-[10px] font-extrabold leading-tight text-gray-900 sm:text-xs">
        {label}
      </span>
      {badge != null && badge > 0 ? (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-black text-white sm:right-2 sm:top-2 sm:h-5 sm:min-w-5 sm:text-[10px]">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100">
      {children}
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  hint?: string;
  onClick?: () => void;
}) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-sm font-bold text-gray-900">{label}</span>
      {value ? (
        <span className="max-w-[45%] truncate text-xs font-semibold text-gray-500">{value}</span>
      ) : hint ? (
        <span className="text-xs font-extrabold text-[#0a255d]">{hint}</span>
      ) : null}
      {onClick ? <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" /> : null}
    </div>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full border-0 bg-white p-0 text-left">
        {inner}
      </button>
    );
  }
  return inner;
}
