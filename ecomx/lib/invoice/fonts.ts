import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerInvoiceFonts(baseUrl?: string) {
  if (registered) return;
  registered = true;

  const base =
    baseUrl ??
    (typeof window !== "undefined" ? window.location.origin : "");

  const prefix = base ? `${base}/fonts/invoice` : "/fonts/invoice";

  Font.register({
    family: "NotoSans",
    fonts: [
      { src: `${prefix}/NotoSans-Regular.ttf`, fontWeight: 400 },
      { src: `${prefix}/NotoSans-Bold.ttf`, fontWeight: 700 },
    ],
  });

  Font.register({
    family: "NotoSansArabic",
    src: `${prefix}/NotoSansArabic-Regular.ttf`,
  });
}

/** Node/test usage with absolute filesystem paths */
export function registerInvoiceFontsFromDir(fontDir: string) {
  if (registered) return;
  registered = true;

  Font.register({
    family: "NotoSans",
    fonts: [
      { src: `${fontDir}/NotoSans-Regular.ttf`, fontWeight: 400 },
      { src: `${fontDir}/NotoSans-Bold.ttf`, fontWeight: 700 },
    ],
  });

  Font.register({
    family: "NotoSansArabic",
    src: `${fontDir}/NotoSansArabic-Regular.ttf`,
  });
}
