import sharp from "sharp";
import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "public/images/hero");
const files = [
  "boxpos-extreme.jpg",
  "premium-thermal.jpg",
  "premium-barcode.jpg",
  "premium-printer.jpg",
];

function lum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function sat(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/** Remove white/grey studio backgrounds + soft shadows (low saturation, high luminance). */
async function knockOutBackground(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const l = lum(r, g, b);
    const s = sat(r, g, b);

    // Hard knock: bright low-chroma pixels (white + grey backdrop)
    if (l >= 200 && s <= 0.18) {
      data[i + 3] = 0;
      continue;
    }

    // Soft knock: light grey shadows under product
    if (l >= 165 && s <= 0.12) {
      const t = Math.min(1, (l - 165) / 55);
      data[i + 3] = Math.round(data[i + 3] * (1 - t));
      continue;
    }

    // Near-white with slight tint
    if (r >= 235 && g >= 235 && b >= 235) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 12 })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

for (const file of files) {
  const input = path.join(dir, file);
  const base = file.replace(/\.(jpg|jpeg|png)$/i, "");
  const output = path.join(dir, `${base}-cutout.png`);
  if (!fs.existsSync(input)) {
    console.warn("skip missing", input);
    continue;
  }
  await knockOutBackground(input, output);
  const meta = await sharp(output).metadata();
  console.log(`${base}-cutout.png ${meta.width}x${meta.height}`);
}
