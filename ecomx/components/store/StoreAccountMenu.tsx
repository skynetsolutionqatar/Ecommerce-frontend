"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, LogOut, MapPin, Package, User } from "lucide-react";
import * as Icons from "@/components/Icons";
import Avatar from "@/components/Avatar";
import { ADMIN_ROUTES, isAdminRole } from "@/lib/config";
import { ROUTES } from "@/lib/routes";
import type { StoreUser } from "@/lib/types";
import { useAuthStore } from "@/store/auth.store";
import { Colors } from "@/lib/theme";

interface StoreAccountMenuProps {
  user?: StoreUser | null;
  wishlistCount: number;
  onLoginOpen: () => void;
  onLogout?: () => void;
  onWishlistOpen: () => void;
}

type ShortcutItem = {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  badge?: string;
};

export default function StoreAccountMenu({
  user,
  wishlistCount,
  onLoginOpen,
  onLogout,
  onWishlistOpen,
}: StoreAccountMenuProps) {
  const router = useRouter();
  const authRole = useAuthStore((s) => s.user?.role);
  const showAdminPanel = isAdminRole(authRole);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(max-width: 767px)");
    if (!mq.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  const go = (href: string) => {
    close();
    router.push(href);
  };

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "";

  const shortcuts: ShortcutItem[] = [
    {
      key: "orders",
      label: "Orders",
      icon: <Package className="h-5 w-5" strokeWidth={1.75} />,
      onClick: () => go(ROUTES.orders),
    },
    {
      key: "wishlist",
      label: "Wishlist",
      icon: <Heart className="h-5 w-5" strokeWidth={1.75} />,
      onClick: () => {
        close();
        onWishlistOpen();
      },
      badge: wishlistCount > 0 ? String(wishlistCount) : undefined,
    },
    {
      key: "addresses",
      label: "Addresses",
      icon: <MapPin className="h-5 w-5" strokeWidth={1.75} />,
      onClick: () => go(`${ROUTES.account}?section=addresses`),
    },
    {
      key: "profile",
      label: "Profile",
      icon: <User className="h-5 w-5" strokeWidth={1.75} />,
      onClick: () => go(ROUTES.account),
    },
  ];

  return (
    <div ref={rootRef} className="relative shrink-0">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-transparent px-2 py-1.5 text-left hover:bg-gray-50 md:px-3 md:py-2"
        whileTap={{ scale: 0.98 }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={user ? "Account menu" : "Login or Sign up"}
      >
        {user ? (
          <Avatar
            name={user.name}
            size={18}
            imageUrl={user.avatarUrl}
            colorSeed={user.email}
            className="border border-gray-200 shadow-none md:h-5 md:w-5"
          />
        ) : (
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-gray-700 md:h-5 md:w-5">
            <Icons.User />
          </span>
        )}
        <span className="hidden min-w-0 flex-col leading-tight min-[480px]:flex">
          <span className="text-[10px] text-gray-500 md:text-[11px]">Hello</span>
          <span
            className="truncate text-[12px] font-semibold md:text-[13px]"
            style={{ color: user ? "#111827" : Colors.base_color }}
          >
            {user ? firstName || user.name : "Sign in"}
          </span>
        </span>
        <ChevronDown
          className={`h-3 w-3 shrink-0 text-gray-500 transition-transform sm:h-3.5 sm:w-3.5 ${
            open ? "rotate-180" : ""
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close account menu"
              className="fixed inset-0 z-[155] bg-black/45 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
            role="menu"
            className="fixed left-3 right-3 top-[calc(var(--header-height,5.5rem)+0.5rem)] z-[160] max-h-[min(85dvh,560px)] overflow-y-auto overscroll-contain rounded-lg border border-gray-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.18)] md:absolute md:inset-auto md:right-0 md:top-[calc(100%+8px)] md:max-h-[min(70vh,480px)] md:w-[min(calc(100vw-2rem),340px)]"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
          >
            {user ? (
              <>
                <div className="border-b border-gray-100 px-4 pb-3 pt-4">
                  <p className="text-[15px] font-semibold text-gray-900">
                    Hello <span className="font-bold">{firstName || user.name}</span>
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-gray-600">{user.email}</p>
                  <button
                    type="button"
                    onClick={() => go(ROUTES.account)}
                    className="mt-3 w-full rounded-sm border border-gray-300 py-2 text-[13px] font-semibold text-gray-800 transition hover:bg-gray-50"
                  >
                    View Profile
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 border-b border-gray-100 px-3 py-3 min-[480px]:grid-cols-4 min-[480px]:gap-1 min-[480px]:px-2">
                  {shortcuts.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      role="menuitem"
                      onClick={item.onClick}
                      className="relative flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-center transition hover:bg-gray-50 active:bg-gray-100"
                    >
                      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                        {item.icon}
                        {item.badge ? (
                          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                            {item.badge}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-[10px] font-medium leading-tight text-gray-800 min-[480px]:text-[11px]">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2 px-2 py-2">
                  {showAdminPanel ? (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => go(ADMIN_ROUTES.dashboard)}
                      className="w-full rounded-sm border border-gray-300 py-2 text-[13px] font-semibold transition hover:bg-gray-50"
                      style={{ color: Colors.base_color }}
                    >
                      Go to Admin Panel
                    </button>
                  ) : null}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      close();
                      onLogout?.();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-[13px] font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4">
                <p className="text-[13px] text-gray-700">
                  New customer?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      onLoginOpen();
                    }}
                    className="font-semibold"
                    style={{ color: Colors.base_color }}
                  >
                    Start Here.
                  </button>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    onLoginOpen();
                  }}
                  className="mt-4 w-full rounded-sm py-2.5 text-sm font-bold text-white shadow-sm"
                  style={{ background: Colors.base_color }}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    onLoginOpen();
                  }}
                  className="mt-3 w-full rounded-sm border border-gray-300 py-2 text-[13px] font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Sign Up
                </button>
              </div>
            )}
          </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
