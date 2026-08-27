/**
 * Generates invoice PDFs for sample orders and reports page counts.
 * Run: npx tsx scripts/test-invoice-pdf.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateInvoicePdfBlob } from "../lib/invoice/generate-invoice-pdf";
import { buildInvoicePayload } from "../lib/invoice/invoice-utils";
import { registerInvoiceFontsFromDir } from "../lib/invoice/fonts";
import { paginateOrderItems } from "../lib/invoice/paginate-items";
import type { ApiOrder } from "../types/order.types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

registerInvoiceFontsFromDir(path.join(root, "public/fonts/invoice"));

const assetOptions = {
  logoUrl: path.join(root, "public/images/skynet-logo.jpg"),
  bannerBgUrl: path.join(root, "public/images/invoice-banner-bg.png"),
};

const smallOrder = {
  _id: "test",
  tenantId: "tenant",
  customerId: "customer",
  orderNumber: "SKY-2026-00023",
  status: "delivered",
  createdAt: "2026-08-13T00:00:00.000Z",
  deliveredAt: "2026-08-13T00:00:00.000Z",
  paymentStatus: "paid",
  paymentMethod: "bank_transfer",
  subtotal: 6.5,
  shippingCharge: 0,
  discountAmount: 0,
  taxAmount: 0,
  totalAmount: 6.5,
  items: [
    {
      productId: "prod1",
      name: "Barcode Labels 38MM x 25MM -1000 Labels- Direct Thermal",
      quantity: 1,
      price: 6.5,
      subtotal: 6.5,
      sku: "LBL-38x25",
    },
  ],
  deliveryAddress: {
    fullName: "Junair pt",
    phone: "9539018161",
    line1: "Pallippat Thoompan (H), Thalakkadathoor",
    city: "Tirur",
    country: "Qatar",
  },
} satisfies ApiOrder;

const largeOrder = {
  _id: "6a83eacd133b9bc17d12f462",
  tenantId: "6a363c2f05587300d65b2720",
  customerId: "6a5e32b5af69036bc0f3dabb",
  orderNumber: "SKY-2026-00026",
  status: "delivered",
  createdAt: "2026-08-18T05:17:01.623Z",
  deliveredAt: "2026-08-18T05:17:49.270Z",
  paymentStatus: "paid",
  paymentMethod: "cash_on_delivery",
  subtotal: 9914.5,
  shippingCharge: 0,
  discountAmount: 0,
  taxAmount: 0,
  totalAmount: 9914.5,
  items: [
    { productId: "1", name: "Weighing Scale Machine-RONGTA RLS1100", quantity: 1, price: 1800, subtotal: 1800 },
    { productId: "2", name: "Barcode Label-Direct Thermal- 58MM x 39MM-800 Labels", quantity: 1, price: 8, subtotal: 8 },
    { productId: "3", name: "Barcode Ribbons 55MM X 300 MTR, Premium Wax Out", quantity: 1, price: 25, subtotal: 25 },
    { productId: "4", name: "Barcode Labels 38MM x 25MM -1000 Labels- Direct Thermal", quantity: 1, price: 6.5, subtotal: 6.5 },
    { productId: "5", name: "Datalogic Barcode Scanner Wired 1D-QD2200", quantity: 1, price: 290, subtotal: 290 },
    { productId: "6", name: "Cash Drawer", quantity: 1, price: 220, subtotal: 220 },
    { productId: "7", name: "Wireless Keyboard and Mouse", quantity: 2, price: 130, subtotal: 260 },
    { productId: "8", name: "BOXPOS Thermal Receipt Printer BPR300 - USB + Serial", quantity: 1, price: 400, subtotal: 400 },
    { productId: "9", name: "Zebra ZD220 TT Label Printer, 203 dpi/8 Dots Per mm Resolution, 4 in./102 mm Per Second Print Speed, Peeler, EPLII, ZPLII, USB | ZD22042-T0EG00EZ", quantity: 2, price: 900, subtotal: 1800 },
    { productId: "10", name: "BOXP BPS110 1D LASER SCANNER", quantity: 1, price: 200, subtotal: 200 },
    { productId: "11", name: "BOXPOS Thermal Receipt Printer BPR300 - USB + Serial + Ethernet", quantity: 1, price: 400, subtotal: 400 },
    { productId: "12", name: "BOXP BPS250 2D BARCODE SCANNER", quantity: 2, price: 280, subtotal: 560 },
    { productId: "13", name: "BOXP BPS250BD 2D BARCODE SCANNER(BT+DONGLE)", quantity: 2, price: 360, subtotal: 720 },
    { productId: "14", name: "BOXP BPS980V 2D VERTICAL BARCODE SCANNER", quantity: 3, price: 425, subtotal: 1275 },
    { productId: "15", name: "HONEYWELL EDA52, 4G&WIFI5, ANDROID 11 GMS WWAN, WLAN 4GB/64GB 13MP+5MP 2D BT NFC USB, 5.5\" SCREEN(PART#EDA52-11AE64N21RK)", quantity: 1, price: 1850, subtotal: 1850 },
    { productId: "16", name: "55MM*300MTR CARBON TRANSFER PAPER PREMIUM RESIN OUT 1 INCH 55MM NORMAL WITHOUT NOTCH", quantity: 1, price: 100, subtotal: 100 },
  ],
  deliveryAddress: {
    fullName: "Junair pt",
    phone: "9539018161",
    line1: "Pallippat Thoompan (H)",
    line2: "Al Hilal",
    city: "Doha",
    state: "Doha",
    country: "Qatar",
  },
} satisfies ApiOrder;

function countPdfPages(buffer: Buffer): number {
  return (buffer.toString("latin1").match(/\/Type\s*\/Page\b/g) ?? []).length;
}

async function writeInvoice(order: ApiOrder, outPath: string) {
  const { firstPage, continuations } = paginateOrderItems(order.items);
  const payload = buildInvoicePayload(order, assetOptions);
  const blob = await generateInvoicePdfBlob(payload);
  const buffer = Buffer.from(await blob.arrayBuffer());
  fs.writeFileSync(outPath, buffer);
  const pageCount = countPdfPages(buffer);
  console.log(`PDF written: ${outPath}`);
  console.log(
    `  Items page 1: ${firstPage.length}/${order.items.length}, continuation chunks: [${continuations.map((c) => c.length).join(", ")}], pages: ${pageCount}`,
  );
  return pageCount;
}

async function main() {
  const smallPages = await writeInvoice(
    smallOrder,
    path.join(root, "tmp-invoice-test.pdf"),
  );
  const largePages = await writeInvoice(
    largeOrder,
    path.join(root, "tmp-invoice-large-test.pdf"),
  );

  if (smallPages !== 2) {
    console.error(`Expected 2 pages for small order, got ${smallPages}`);
    process.exit(1);
  }

  if (largePages < 3 || largePages > 4) {
    console.error(`Unexpected page count for large order: ${largePages}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
