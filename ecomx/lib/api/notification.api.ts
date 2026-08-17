import { apiGet, apiPatch } from "./client";
import type { ApiNotification, NotificationsResponse } from "@/types/notification.types";

export async function fetchNotifications(): Promise<NotificationsResponse> {
  const res = await apiGet<NotificationsResponse>("/notifications");
  return res.data;
}

export async function markNotificationRead(id: string): Promise<ApiNotification> {
  const res = await apiPatch<{ notification: ApiNotification }>(`/notifications/${id}/read`);
  return res.data.notification;
}

export async function markAllNotificationsRead(): Promise<{ modifiedCount: number }> {
  const res = await apiPatch<{ modifiedCount: number }>("/notifications/read-all");
  return res.data;
}
