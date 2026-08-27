import { pdf } from "@react-pdf/renderer";

import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { registerInvoiceFonts } from "@/lib/invoice/fonts";
import { generateInvoiceQrDataUrl } from "@/lib/invoice/generate-qr";
import {
  getInvoiceBannerBgUrl,
  getInvoiceLogoUrl,
} from "@/lib/invoice/invoice-utils";
import type { InvoicePayload } from "@/types/invoice.types";

export async function generateInvoicePdfBlob(
  data: InvoicePayload,
  options?: { origin?: string },
): Promise<Blob> {
  registerInvoiceFonts(options?.origin);

  const origin =
    options?.origin ??
    (typeof window !== "undefined" ? window.location.origin : undefined);

  const logoUrl = data.logoUrl || getInvoiceLogoUrl(origin);
  const bannerBgUrl = data.bannerBgUrl || getInvoiceBannerBgUrl(origin);
  const qrDataUrl =
    data.qrDataUrl ?? (await generateInvoiceQrDataUrl(data.invoiceNumber));

  const payload: InvoicePayload = {
    ...data,
    logoUrl,
    bannerBgUrl,
    qrDataUrl,
  };

  return pdf(<InvoiceDocument data={payload} />).toBlob();
}
