"use client";

import { Edit3, LogOut, Menu, RefreshCcw, Store, User } from "lucide-react";
import NotificationBell from "@/components/admin/main/Notification";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";
import CommandSearch from "@/components/admin/utils/CommandSearch";
import LiveClock from "@/components/admin/main/LiveClock";
import { adminSections } from "@/components/admin/utils/SideSection";
import { adminType } from "@/lib/admin/typography";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="relative z-[100] flex w-full min-w-0 items-center justify-between gap-2 border-b border-border bg-card px-3 py-2 sm:px-4 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 md:max-w-2xl lg:w-2/5">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted/60 md:hidden"
          >
            <Menu size={20} />
          </button>
        ) : null}
        <CommandSearch sections={adminSections} />
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden lg:block">
          <LiveClock />
        </div>

        <AdminThemeToggle />

        <NotificationBell />

        <div
          ref={dropdownRef}
          className="relative flex cursor-pointer items-center"
          onClick={() => setOpen(!open)}
        >
          <User className="mb-1 h-6 w-6 rounded-full border-2 border-muted-foreground text-muted-foreground" />

          {open && (
            <div className="absolute right-0 top-12 z-[110] w-56 rounded-xl border border-border bg-card shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <p className={adminType.navUserName}>
                  {user?.name ?? "Admin User"}
                </p>
                <p className={adminType.navUserEmail}>
                  {user?.email ?? "admin@skynet.com"}
                </p>
              </div>

              <div className="flex flex-col p-2">
                <button
                  type="button"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted/60 ${adminType.navMenuItem}`}
                >
                  <User size={16} /> Profile
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted/60 ${adminType.navMenuItem}`}
                >
                  <Edit3 size={16} /> Change Password
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted/60 ${adminType.navMenuItem}`}
                >
                  <RefreshCcw size={16} /> Switch User
                </button>

                <Link
                  href="/"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted/60 ${adminType.navMenuItem}`}
                >
                  <Store className="h-4 w-4 opacity-60" />
                  Go to Store
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 hover:bg-red-500/10 ${adminType.navMenuItemDanger}`}
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
