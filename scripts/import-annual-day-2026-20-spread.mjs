import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Import 20 *non-continuous* images from D:/annual day2026,
// compress to WebP, and place into components/images/gallery/annual-day-2026.

const SRC_DIR = "D:/annual day2026";
const OUT_DIR = path.resolve("components/images/gallery/annual-day-2026");

const COUNT = 20;
const MAX_WIDTH = 1800;
const QUALITY = 72;

function isImage(name) {
  return /\.(jpe?g|png|webp)$/i.test(name);
}

function pickSpread(list, count) {
  if (list.length <= count) return list.slice();

  // Evenly spaced picks across full list.
  // Use midpoints of each bucket to avoid long continuous runs.
  const step = list.length / count;
  const picks = [];
  const used = new Set();

  for (let i = 0; i < count; i++) {
    const idx = Math.min(list.length - 1, Math.floor((i + 0.5) * step));
    let j = idx;
    // avoid duplicates (unlikely) + ensure in range
    while (used.has(j) && j < list.length - 1) j++;
    while (used.has(j) && j > 0) j--;
    used.add(j);
    picks.push(list[j]);
  }

  return picks;
}

async function main() {
  if (!fs.existsSync(SRC_DIR)) throw new Error(`Source not found: ${SRC_DIR}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const names = fs
    .readdirSync(SRC_DIR)
    .filter((n) => isImage(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  const picked = pickSpread(names, COUNT);
  console.log(`Found ${names.length} images. Picking ${picked.length} (spread-out).`);

  let i = 0;
  for (const name of picked) {
    i++;
    const src = path.join(SRC_DIR, name);
    const outName = `ad2026-${String(i).padStart(2, "0")}.webp`;
    const outPath = path.join(OUT_DIR, outName);

    const img = sharp(src, { failOn: "none" });
    const meta = await img.metadata();

    let pipeline = img.rotate();
    if (meta.width && meta.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    await pipeline.webp({ quality: QUALITY, effort: 6 }).toFile(outPath);
    console.log(`(${i}/${picked.length}) ${name} -> ${outName}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
