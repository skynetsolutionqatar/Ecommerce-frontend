import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { API_CONFIG } from "@/lib/config";
import { generateInvoiceQrDataUrl } from "@/lib/invoice/generate-qr";
import { registerInvoiceFontsFromDir } from "@/lib/invoice/fonts";
import { buildInvoicePayload, invoiceFilename } from "@/lib/invoice/invoice-utils";
import type { ApiOrder } from "@/types/order.types";

const FONT_DIR = path.join(process.cwd(), "public", "fonts", "invoice");
const LOGO = path.join(process.cwd(), "public", "images", "skynet-logo.jpg");
const BANNER = path.join(process.cwd(), "public", "images", "invoice-banner-bg.png");

let fontsReady = false;

async function ensureFonts() {
  if (fontsReady) return;
  registerInvoiceFontsFromDir(FONT_DIR);
  fontsReady = true;
}

async function fetchMyOrder(id: string, authorization: string): Promise<ApiOrder> {
  const res = await fetch(`${API_CONFIG.baseURL}/orders/my/${id}`, {
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
      "x-tenant-id": API_CONFIG.tenantId,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const message = await res.text().catch(() => "");
    throw new Error(message || `Order fetch failed (${res.status})`);
  }

  const json = (await res.json()) as { data?: { order?: ApiOrder } };
  const order = json.data?.order;
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authorization = req.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await ensureFonts();

    const order = await fetchMyOrder(id, authorization);
    const payload = buildInvoicePayload(order, {
      logoUrl: LOGO,
      bannerBgUrl: BANNER,
    });

    const qrDataUrl = await generateInvoiceQrDataUrl(payload.invoiceNumber);
    const buffer = await renderToBuffer(
      <InvoiceDocument data={{ ...payload, qrDataUrl }} />
    );

    const filename = invoiceFilename(order.orderNumber);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate invoice";
    const status = message.includes("delivered") ? 400 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
