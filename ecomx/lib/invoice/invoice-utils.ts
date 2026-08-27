import { ORDER_STATUS } from "@/lib/Constant";
import {
  SKYNET_BANK,
  SKYNET_COMPANY,
  SKYNET_TERMS,
  buildInvoiceNumber,
} from "@/lib/invoice/invoice-config";
import type { InvoicePayload } from "@/types/invoice.types";
import { orderAddress, type ApiOrder } from "@/types/order.types";

export const INVOICE_LOGO_PATH = "/images/skynet-logo.jpg";
export const INVOICE_BANNER_BG_PATH = "/images/invoice-banner-bg.png";

export const INVOICE_HEADER_BANNER = {
  pageW: 595,
  height: 96,
};

export function invoiceCurrency(): string {
  const token = SKYNET_BANK.currency.split(/[\s–-]/)[0]?.trim();
  return token || "QAR";
}

export function assertInvoiceEligible(order: ApiOrder): void {
  if (order.status !== ORDER_STATUS.DELIVERED) {
    throw new Error("Invoice is only available for delivered orders.");
  }
}

export function getInvoiceLogoUrl(origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${INVOICE_LOGO_PATH}`;
}

export function getInvoiceBannerBgUrl(origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${INVOICE_BANNER_BG_PATH}`;
}

export function invoiceFilename(orderNumber: string): string {
  return `invoice-${orderNumber}.pdf`;
}

export function withInvoiceOrder(order: ApiOrder): ApiOrder {
  return {
    ...order,
    deliveryAddress: orderAddress(order),
  };
}

export function buildInvoicePayload(
  order: ApiOrder,
  options?: {
    logoUrl?: string;
    bannerBgUrl?: string;
    qrDataUrl?: string;
  },
): InvoicePayload {
  assertInvoiceEligible(order);

  const normalizedOrder = withInvoiceOrder(order);
  const logoUrl = options?.logoUrl ?? getInvoiceLogoUrl();
  const bannerBgUrl = options?.bannerBgUrl ?? getInvoiceBannerBgUrl();

  return {
    order: normalizedOrder,
    invoiceNumber: buildInvoiceNumber(normalizedOrder.orderNumber),
    filename: invoiceFilename(normalizedOrder.orderNumber),
    currency: invoiceCurrency(),
    company: SKYNET_COMPANY,
    bank: SKYNET_BANK,
    terms: SKYNET_TERMS,
    logoUrl,
    bannerBgUrl,
    qrDataUrl: options?.qrDataUrl,
  };
}
