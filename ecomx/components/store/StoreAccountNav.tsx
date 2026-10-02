"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, Package, User } from "lucide-react";
import Avatar from "@/components/Avatar";
import { Colors } from "@/lib/theme";
import { ROUTES } from "@/lib/routes";

export type StoreAccountNavActive = "profile" | "addresses" | "orders";

interface StoreAccountLayoutProps {
  active: StoreAccountNavActive;
  userName: string;
  userEmail?: string;
  avatarUrl?: string;
  children: ReactNode;
}

function navItemClass(active: boolean) {
  return `flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-left text-[13px] font-medium transition ${
    active ? "bg-gray-100 font-semibold" : "text-gray-800 hover:bg-gray-50"
  }`;
}

function mobileTabClass(active: boolean) {
  return `shrink-0 rounded-full px-4 py-2 text-xs font-semibold sm:text-sm ${
    active ? "text-white" : "border border-gray-200 bg-white text-gray-700"
  }`;
}

export default function StoreAccountLayout({
  active,
  userName,
  userEmail,
  avatarUrl,
  children,
}: StoreAccountLayoutProps) {
  const firstName = userName.trim().split(/\s+/)[0] || userName;
  const activeStyle = { color: Colors.base_color };

  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href={ROUTES.account}
          className={mobileTabClass(active === "profile")}
          style={active === "profile" ? { background: Colors.base_color } : undefined}
        >
          Profile
        </Link>
        <Link
          href={`${ROUTES.account}?section=addresses`}
          className={mobileTabClass(active === "addresses")}
          style={active === "addresses" ? { background: Colors.base_color } : undefined}
        >
          Addresses
        </Link>
        <Link
          href={ROUTES.orders}
          className={mobileTabClass(active === "orders")}
          style={active === "orders" ? { background: Colors.base_color } : undefined}
        >
          My Orders
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-5">
        <aside className="hidden flex-col gap-3 lg:flex">
          <div className="rounded-sm border border-gray-200 bg-white px-4 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar
                name={userName}
                size={40}
                imageUrl={avatarUrl}
                colorSeed={userEmail}
                className="border border-gray-200 shadow-none"
              />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Hello</p>
                <p className="truncate text-sm font-bold text-gray-900">{firstName}</p>
              </div>
            </div>
          </div>

          <nav className="rounded-sm border border-gray-200 bg-white py-2 shadow-sm">
            <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
              Account
            </p>
            <Link
              href={ROUTES.orders}
              className={`${navItemClass(active === "orders")} mx-1`}
              style={active === "orders" ? activeStyle : undefined}
            >
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                My Orders
              </span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
            <p className="mt-2 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
              Account Settings
            </p>
            <Link
              href={ROUTES.account}
              className={`${navItemClass(active === "profile")} mx-1`}
              style={active === "profile" ? activeStyle : undefined}
            >
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile Information
              </span>
            </Link>
            <Link
              href={`${ROUTES.account}?section=addresses`}
              className={`${navItemClass(active === "addresses")} mx-1`}
              style={active === "addresses" ? activeStyle : undefined}
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Manage Addresses
              </span>
            </Link>
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </>
  );
}
