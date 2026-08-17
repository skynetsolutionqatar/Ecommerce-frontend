"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { connectSocket } from "@/lib/socket";

export interface OrderUpdate {
  orderNumber: string;
  status: string;
  message?: string;
  updatedAt: string | Date;
}

export function useOrderTracking(orderNumber: string | null) {
  const { isAuthenticated, isHydrated } = useAuth();
  const [lastUpdate, setLastUpdate] = useState<OrderUpdate | null>(null);

  useEffect(() => {
    if (!isHydrated || !orderNumber) return;

    const socket = connectSocket();

    if (!isAuthenticated) {
      socket.emit("track-order", orderNumber);
    }

    const handleUpdate = (data: OrderUpdate) => {
      if (data.orderNumber === orderNumber) {
        setLastUpdate(data);
      }
    };

    socket.on("order-status-changed", handleUpdate);
    socket.on("order-update", handleUpdate);

    return () => {
      socket.off("order-status-changed", handleUpdate);
      socket.off("order-update", handleUpdate);
    };
  }, [orderNumber, isAuthenticated, isHydrated]);

  return { lastUpdate };
}
