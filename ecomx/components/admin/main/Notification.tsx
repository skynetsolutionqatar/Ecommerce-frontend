"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Package, Star, AlertTriangle, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDateTime } from "@/lib/utils";
import type { AdminNotification } from "@/types/notification.types";

const TYPE_ICONS = {
  "new-order": <Package className="h-4 w-4 text-blue-500" />,
  "new-review": <Star className="h-4 w-4 text-yellow-500" />,
  "low-stock": <AlertTriangle className="h-4 w-4 text-red-500" />,
};

const TYPE_BG = {
  "new-order": "bg-blue-50 dark:bg-blue-500/15",
  "new-review": "bg-yellow-50 dark:bg-amber-500/15",
  "low-stock": "bg-red-50 dark:bg-red-500/15",
};

type Tab = "unread" | "read";

export default function NotificationBell({ tone = "default" }: { tone?: "default" | "primary" }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("unread");
  const ref = useRef<HTMLDivElement>(null);
  const { unread, read, unreadCount, isConnected, isLoading, markRead, markAllRead } =
    useNotifications();

  const list = tab === "unread" ? unread : read;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        className={
          tone === "primary"
            ? "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 dark:hover:bg-white/10"
            : "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted/60"
        }
      >
        <Bell
          className={`h-5 w-5 ${
            tone === "primary"
              ? isConnected
                ? "text-white/90 dark:text-white/85"
                : "text-white/50 dark:text-white/45"
              : isConnected
                ? "text-muted-foreground"
                : "text-muted-foreground/50"
          }`}
        />

        {unreadCount > 0 ? (
          <span className="admin-notification-count-badge absolute -right-0.5 -top-0.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}

        <span
          className={`absolute bottom-1 right-1 h-2 w-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      </button>

      {open ? (
        <div className="absolute end-0 top-12 z-[110] w-80 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">
                  {isConnected ? "Live" : "Disconnected"}
                </p>
              </div>
              {tab === "unread" && unread.length > 0 ? (
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mark all read
                </button>
              ) : null}
            </div>

            <div className="mt-3 flex gap-1 rounded-lg bg-muted/50 p-1">
              <TabButton
                active={tab === "unread"}
                label="Unread"
                count={unreadCount}
                onClick={() => setTab("unread")}
              />
              <TabButton
                active={tab === "read"}
                label="Read"
                count={read.length}
                onClick={() => setTab("read")}
              />
            </div>
          </div>

          <div className="max-h-96 divide-y divide-border overflow-y-auto">
            {isLoading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Loading...</p>
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10">
                <CheckCheck className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {tab === "unread" ? "No unread notifications" : "No read notifications"}
                </p>
              </div>
            ) : (
              list.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markRead}
                  onNavigate={() => setOpen(false)}
                />
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
          label === "Unread" && count > 0
            ? "admin-notification-count-badge min-w-[1.125rem] border-0 px-1.5 shadow-none"
            : active
              ? "bg-muted text-foreground"
              : "bg-muted/60 text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function NotificationItem({
  notification: n,
  onRead,
  onNavigate,
}: {
  notification: AdminNotification;
  onRead: (id: string) => void;
  onNavigate?: () => void;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (!n.read) onRead(n.id);
    onNavigate?.();
    router.push(n.href);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 ${
        !n.read ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
      }`}
    >
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TYPE_BG[n.type]}`}
      >
        {TYPE_ICONS[n.type]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{n.title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">{formatDateTime(n.createdAt)}</p>
      </div>
      {!n.read ? <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" /> : null}
    </button>
  );
}
