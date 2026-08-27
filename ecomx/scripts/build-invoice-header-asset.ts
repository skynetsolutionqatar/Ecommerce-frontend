/**
 * Builds a print-quality invoice header PNG from the source banner.
 * Run: npx tsx scripts/build-invoice-header-asset.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/** ~1200 DPI effective at 595×96pt — stays sharp when zooming */
const TARGET_WIDTH = 12_000;
const DISPLAY_WIDTH_PT = 595;
const DISPLAY_HEIGHT_PT = 96;
const TARGET_HEIGHT = Math.round(
  (TARGET_WIDTH * DISPLAY_HEIGHT_PT) / DISPLAY_WIDTH_PT,
);

const source = path.join(root, "public/images/invoice-header-banner.jpg");
const output = path.join(root, "public/images/invoice-header-banner-print.png");

async function main() {
  if (!fs.existsSync(source)) {
    throw new Error(`Missing source banner: ${source}`);
  }

  const meta = await sharp(source).metadata();
  const scaled = await sharp(source)
    .resize(TARGET_WIDTH, null, {
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
    .sharpen({ sigma: 1.2, m1: 0.5, m2: 0.5 })
    .toBuffer();

  const scaledMeta = await sharp(scaled).metadata();
  const cropTop = Math.max(
    0,
    Math.round(((scaledMeta.height ?? 0) - TARGET_HEIGHT) / 2),
  );

  await sharp(scaled)
    .extract({
      left: 0,
      top: cropTop,
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
    })
    .png({ compressionLevel: 6 })
    .toFile(output);

  const outMeta = await sharp(output).metadata();
  const dpi = Math.round((outMeta.width ?? 0) / (DISPLAY_WIDTH_PT / 72));

  console.log(`Source: ${meta.width}x${meta.height}`);
  console.log(`Output: ${output}`);
  console.log(`Size:   ${outMeta.width}x${outMeta.height}px (~${dpi} DPI at 595x96pt)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
