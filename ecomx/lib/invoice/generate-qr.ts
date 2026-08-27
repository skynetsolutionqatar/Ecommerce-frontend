import QRCode from "qrcode";

const QR_OPTS = {
  margin: 1,
  width: 160,
  errorCorrectionLevel: "M" as const,
  color: { dark: "#0D1F3C", light: "#FFFFFF" },
};

/**
 * QR as a JPEG data URL — PNG data URLs often fail in @react-pdf/renderer
 * browser/on-the-fly rendering; JPEG embeds reliably in the PDF.
 */
export async function generateInvoiceQrDataUrl(invoiceNumber: string): Promise<string> {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, invoiceNumber, QR_OPTS);
    return canvas.toDataURL("image/jpeg", 0.92);
  }

  return QRCode.toDataURL(invoiceNumber, {
    ...QR_OPTS,
    type: "image/jpeg",
  });
}
