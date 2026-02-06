import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Import images from an external folder, compress to WebP, and place into gallery folder.
// Only processes JPG/JPEG/PNG/WEBP (skips CR2/MP4).

const SRC_DIR = "D:/annual day2026";
const OUT_DIR = path.resolve("components/images/gallery/annual-day-2026");

const MAX_IMAGES = 80; // keep site light; increase if needed
const MAX_WIDTH = 1800; // resize down if bigger
const QUALITY = 72;

function isImage(name) {
  return /\.(jpe?g|png|webp)$/i.test(name);
}

async function main() {
  if (!fs.existsSync(SRC_DIR)) throw new Error(`Source not found: ${SRC_DIR}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const names = fs
    .readdirSync(SRC_DIR)
    .filter((n) => isImage(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  const slice = names.slice(0, MAX_IMAGES);
  console.log(`Found ${names.length} images. Importing ${slice.length}...`);

  let i = 0;
  for (const name of slice) {
    i++;
    const src = path.join(SRC_DIR, name);
    const outName = `ad2026-${String(i).padStart(4, "0")}.webp`;
    const outPath = path.join(OUT_DIR, outName);

    const img = sharp(src, { failOn: "none" });
    const meta = await img.metadata();

    let pipeline = img.rotate(); // auto-orient

    if (meta.width && meta.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    await pipeline.webp({ quality: QUALITY, effort: 6 }).toFile(outPath);

    console.log(`(${i}/${slice.length}) ${name} -> ${outName}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
