"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Grid3x3, Home, ShoppingCart, Tag, User } from "lucide-react";
import { Colors } from "@/lib/theme";
import { ROUTES } from "@/lib/routes";
import { shopDealsUrl } from "@/lib/store/mobile-chrome";
import type { StoreUser } from "@/lib/types";

type TabKey = "home" | "shop" | "deals" | "account" | "cart";

const DEALS_FAB = 56;

function DealsFab({ active, href }: { active: boolean; href: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="relative flex h-14 w-14 items-center justify-center"
      aria-label="Deals"
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full bg-red-500/25"
        initial={false}
        animate={
          reduceMotion
            ? { opacity: active ? 0.35 : 0, scale: 1 }
            : { opacity: [0, 0.45, 0], scale: [1, 1.45, 1.45] }
        }
        transition={
          reduceMotion
            ? { duration: 0.2 }
            : { duration: 1.7, repeat: Infinity, ease: "linear", times: [0, 0.18, 1] }
        }
      />
      <motion.span
        className="relative flex items-center justify-center rounded-full border-[3px] border-white bg-red-500 text-white shadow-[0_6px_18px_rgba(239,68,68,0.45)]"
        style={{ width: DEALS_FAB, height: DEALS_FAB }}
        animate={
          reduceMotion
            ? { y: 0, scaleY: 1, scaleX: 1 }
            : { y: [0, -8, 0, -2, 0], scaleY: [1, 1, 0.92, 1, 1], scaleX: [1, 1, 1.07, 1, 1] }
        }
        transition={
          reduceMotion
            ? { duration: 0.2 }
            : { duration: 1.7, repeat: Infinity, ease: "easeInOut", times: [0, 0.16, 0.3, 0.36, 1] }
        }
      >
        <Tag className="h-[26px] w-[26px]" strokeWidth={2.1} aria-hidden />
      </motion.span>
    </Link>
  );
}

function TabItem({
  label,
  active,
  href,
  onClick,
  icon,
  badge,
}: {
  label: string;
  active: boolean;
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  badge?: number;
}) {
  const inner = (
    <>
      <span
        className={`relative flex h-[38px] w-[38px] items-center justify-center rounded-full transition-colors ${
          active ? "text-white" : "text-gray-500"
        }`}
        style={active ? { background: Colors.base_color } : undefined}
      >
        {icon}
        {badge != null && badge > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-black text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
      </span>
      <span
        className={`max-w-full truncate text-[11px] leading-tight ${
          active ? "font-bold text-[#0a255d]" : "font-semibold text-gray-500"
        }`}
      >
        {label}
      </span>
    </>
  );

  const className = "flex min-w-0 flex-1 flex-col items-center gap-0.5 pt-1";

  if (href) {
    return (
      <Link href={href} className={className} aria-current={active ? "page" : undefined}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${className} border-0 bg-transparent`}>
      {inner}
    </button>
  );
}

export default function MobileStoreTabBar({
  cartCount,
  cartOpen,
  onCartOpen,
  user,
  onLoginOpen,
}: {
  cartCount: number;
  cartOpen: boolean;
  onCartOpen: () => void;
  user?: StoreUser | null;
  onLoginOpen: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const dealsActive = pathname === ROUTES.shop && searchParams.get("deals") === "1";

  const activeTab = (): TabKey => {
    if (cartOpen) return "cart";
    if (dealsActive) return "deals";
    if (pathname === ROUTES.home) return "home";
    if (pathname === ROUTES.shop && !dealsActive) return "shop";
    if (pathname.startsWith(ROUTES.account) || pathname.startsWith(ROUTES.orders)) return "account";
    return "home";
  };

  const active = activeTab();

  const accountHref = ROUTES.account;

  return (
    <nav
      aria-label="Store"
      className="mobile-store-tab-bar pointer-events-none fixed inset-x-0 bottom-0 z-[140] md:hidden"
    >
      <div
        className="pointer-events-auto mx-3"
        style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
      >
        <div
          className="relative overflow-visible rounded-2xl border border-gray-200/90 bg-white/95 shadow-[0_6px_24px_rgba(15,23,42,0.14)] backdrop-blur-md"
          style={{ paddingTop: 26, borderTopColor: "rgba(10, 37, 93, 0.12)", borderTopWidth: 2 }}
        >
          <div
            className="absolute left-1/2 z-10 -translate-x-1/2"
            style={{ top: 8 }}
          >
            <DealsFab active={active === "deals"} href={shopDealsUrl()} />
          </div>

          <div className="flex items-end px-1.5 pb-2.5 pt-1">
            <TabItem
              label="Home"
              active={active === "home"}
              href={ROUTES.home}
              icon={<Home className="h-[21px] w-[21px]" strokeWidth={active === "home" ? 2 : 1.7} />}
            />
            <TabItem
              label="Categories"
              active={active === "shop"}
              href={ROUTES.shop}
              icon={
                <Grid3x3 className="h-[21px] w-[21px]" strokeWidth={active === "shop" ? 2 : 1.7} />
              }
            />
            <p className="flex min-w-[4.25rem] flex-1 items-end justify-center pb-0.5 text-center text-[11px] font-extrabold leading-tight text-red-500">
              Deals
            </p>
            <TabItem
              label="Account"
              active={active === "account"}
              href={accountHref}
              icon={<User className="h-[21px] w-[21px]" strokeWidth={active === "account" ? 2 : 1.7} />}
            />
            <TabItem
              label="Cart"
              active={active === "cart"}
              onClick={onCartOpen}
              badge={cartCount}
              icon={
                <ShoppingCart
                  className="h-[21px] w-[21px]"
                  strokeWidth={active === "cart" ? 2 : 1.7}
                />
              }
            />
          </div>
        </div>
      </div>
    </nav>
  );
}