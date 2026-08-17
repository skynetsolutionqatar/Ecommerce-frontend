export type NotificationType = "new-order" | "new-review" | "low-stock";

export interface OrderNotificationData {
  orderId: string;
  orderNumber: string;
  customer: string;
  amount: number;
  itemCount: number;
}

export interface ReviewNotificationData {
  reviewId: string;
  productId: string;
  product: string;
  rating: number;
  customer: string;
}

export interface LowStockNotificationData {
  productId: string;
  product: string;
  sku?: string;
  stock: number;
  threshold?: number;
}

export type NotificationData =
  | OrderNotificationData
  | ReviewNotificationData
  | LowStockNotificationData;

export interface ApiNotification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: ApiNotification[];
  unreadCount: number;
}

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string;
  data?: NotificationData;
  read: boolean;
  createdAt: string;
}
