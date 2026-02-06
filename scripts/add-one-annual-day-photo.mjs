import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Usage:
//   node scripts/add-one-annual-day-photo.mjs "D:/annual day2026/IMG_5778.JPG"

const srcArg = process.argv.slice(2).join(" ").trim();
if (!srcArg) {
  console.error("Missing source path argument");
  process.exit(1);
}

const SRC = srcArg;
const OUT_DIR = path.resolve("components/images/gallery/annual-day-2026");

const MAX_WIDTH = 1800;
const QUALITY = 72;

function nextName(existingNames) {
  const used = new Set(
    existingNames
      .map((n) => (n.match(/^ad2026-(\d\d)\.webp$/i) ? Number(RegExp.$1) : null))
      .filter((v) => typeof v === "number" && Number.isFinite(v)),
  );
  for (let i = 1; i < 100; i++) {
    if (!used.has(i)) return `ad2026-${String(i).padStart(2, "0")}.webp`;
  }
  return `ad2026-${Date.now()}.webp`;
}

async function main() {
  if (!fs.existsSync(SRC)) throw new Error(`Source not found: ${SRC}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const existing = fs.readdirSync(OUT_DIR);
  const outName = nextName(existing);
  const outPath = path.join(OUT_DIR, outName);

  const img = sharp(SRC, { failOn: "none" });
  const meta = await img.metadata();

  let pipeline = img.rotate();
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  await pipeline.webp({ quality: QUALITY, effort: 6 }).toFile(outPath);
  console.log(`Added ${SRC} -> ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
