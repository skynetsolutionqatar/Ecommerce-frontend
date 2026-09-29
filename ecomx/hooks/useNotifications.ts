"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { connectSocket } from "@/lib/socket";
import { ADMIN_ROUTES } from "@/lib/config";
import { showInfo, showNavigableInfo } from "@/lib/toast";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api/notification.api";
import type { AdminNotification, ApiNotification } from "@/types/notification.types";

export const NOTIFICATIONS_KEY = "notifications";

function notificationProductId(d: ApiNotification["data"]): string | null {
  if (!d || !("productId" in d) || d.productId == null) return null;
  const id = d.productId;
  return typeof id === "string" && id.trim() ? id.trim() : String(id);
}

function hrefForNotification(n: ApiNotification): string {
  const d = n.data;
  switch (n.type) {
    case "new-order":
      return d && "orderId" in d && d.orderId
        ? ADMIN_ROUTES.order(d.orderId)
        : ADMIN_ROUTES.orders;
    case "new-review":
      return d && "reviewId" in d && d.reviewId
        ? ADMIN_ROUTES.review(d.reviewId)
        : ADMIN_ROUTES.reviews;
    case "low-stock": {
      const productId = notificationProductId(d);
      return productId ? ADMIN_ROUTES.inventoryUpdate(productId) : ADMIN_ROUTES.inventory;
    }
  }
}

function mapNotification(n: ApiNotification): AdminNotification {
  return {
    id: n._id,
    type: n.type,
    title: n.title,
    message: n.message,
    href: hrefForNotification(n),
    data: n.data,
    read: n.read,
    createdAt: n.createdAt,
  };
}

export function useNotifications() {
  const router = useRouter();
  const { isAdmin, isHydrated } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [NOTIFICATIONS_KEY],
    queryFn: fetchNotifications,
    enabled: isHydrated && isAdmin,
    staleTime: 30_000,
  });

  const notifications = (data?.notifications ?? []).map(mapNotification);
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);
  const unreadCount = data?.unreadCount ?? unread.length;

  useEffect(() => {
    if (!isHydrated || !isAdmin) return;

    const socket = connectSocket();
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    };

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onNewOrder = (payload: { orderNumber: string; amount: number }) => {
      refresh();
      showInfo(`New order ${payload.orderNumber} · QAR ${payload.amount}`, { duration: 8000 });
    };

    const onNewReview = (payload: { product: string; rating: number }) => {
      refresh();
      showInfo(`New review: ${payload.rating}★ for ${payload.product}`, { duration: 8000 });
    };

    const onLowStock = (payload: { product: string; stock: number; productId?: string }) => {
      refresh();
      const message = `Low stock: ${payload.product} (${payload.stock} left)`;
      const productId =
        typeof payload.productId === "string" && payload.productId.trim()
          ? payload.productId.trim()
          : null;
      const href = productId ? ADMIN_ROUTES.inventoryUpdate(productId) : ADMIN_ROUTES.inventory;

      if (productId) {
        showNavigableInfo(message, () => router.push(href), { duration: 10000 });
      } else {
        showInfo(message, { duration: 10000 });
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new-order", onNewOrder);
    socket.on("new-review", onNewReview);
    socket.on("low-stock", onLowStock);

    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new-order", onNewOrder);
      socket.off("new-review", onNewReview);
      socket.off("low-stock", onLowStock);
    };
  }, [isHydrated, isAdmin, queryClient, router]);

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });

  return {
    unread,
    read,
    unreadCount,
    isConnected,
    isLoading,
    markRead: (id: string) => markReadMutation.mutate(id),
    markAllRead: () => markAllReadMutation.mutate(),
  };
}
