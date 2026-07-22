"use client";

import {
  Bell,
  Edit3,
  LogOut,
  RefreshCcw,
  User,
} from "lucide-react";
import CommandSearch from "@/components/admin/utils/CommandSearch";
import LiveClock from "@/components/admin/main/LiveClock";
import { adminSections } from "@/components/admin/utils/SideSection";
import { adminType } from "@/lib/admin/typography";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
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
    <header className="relative flex w-full items-center justify-between border-b border-gray-200 bg-white px-6 py-2">
      <div className="flex w-2/5 min-w-80 max-w-2xl items-center rounded-md py-2">
        <CommandSearch sections={adminSections} />
      </div>

      <div className="flex items-center gap-6">
        <LiveClock />

        <div className="relative">
          <Bell className="cursor-pointer text-gray-600" size={22} />
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
        </div>

        <div
          ref={dropdownRef}
          className="relative flex cursor-pointer items-center"
          onClick={() => setOpen(!open)}
        >
          <User className="mb-1 h-6 w-6 rounded-full border-2 border-gray-600 text-gray-600" />

          {open && (
            <div className="absolute right-0 top-12 w-56 rounded-xl border border-gray-100 bg-white shadow-lg">
              <div className="border-b border-gray-200 px-4 py-3">
                <p className={adminType.navUserName}>{user?.name ?? "Admin User"}</p>
                <p className={adminType.navUserEmail}>{user?.email ?? "admin@skynet.com"}</p>
              </div>

              <div className="flex flex-col p-2">
                <button
                  type="button"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100 ${adminType.navMenuItem}`}
                >
                  <User size={16} /> Profile
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100 ${adminType.navMenuItem}`}
                >
                  <Edit3 size={16} /> Change Password
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100 ${adminType.navMenuItem}`}
                >
                  <RefreshCcw size={16} /> Switch User
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 hover:bg-red-50 ${adminType.navMenuItemDanger}`}
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
