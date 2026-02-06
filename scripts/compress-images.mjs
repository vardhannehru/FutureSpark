import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Compress images in-place.
// Defaults tuned for web hero/gallery photos.
const ROOT = path.resolve(process.cwd(), "components", "images");
const EXT_OK = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".JPG", ".JPEG", ".PNG", ".WEBP", ".GIF"]);

const MAX_WIDTH = Number(process.env.MAX_WIDTH || 1920);
const JPEG_QUALITY = Number(process.env.JPEG_QUALITY || 75);
const PNG_QUALITY = Number(process.env.PNG_QUALITY || 80);
const WEBP_QUALITY = Number(process.env.WEBP_QUALITY || 75);

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

function fmtBytes(n) {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

async function main() {
  const all = await walk(ROOT);
  const files = all.filter((f) => EXT_OK.has(path.extname(f)));

  let totalBefore = 0;
  let totalAfter = 0;
  let changed = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const stat = await fs.stat(file);
    const before = stat.size;
    totalBefore += before;

    // Skip tiny files
    if (before < 40 * 1024) {
      totalAfter += before;
      continue;
    }

    try {
      const fileBuf = await fs.readFile(file);
      const input = sharp(fileBuf, { animated: true });
      const meta = await input.metadata();

      let pipeline = input;
      if (meta.width && meta.width > MAX_WIDTH) {
        pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
      }

      if (ext === ".jpg" || ext === ".jpeg") {
        pipeline = pipeline.jpeg({
          quality: JPEG_QUALITY,
          mozjpeg: true,
          progressive: true,
        });
      } else if (ext === ".png") {
        pipeline = pipeline.png({
          quality: PNG_QUALITY,
          compressionLevel: 9,
          palette: true,
        });
      } else if (ext === ".webp") {
        pipeline = pipeline.webp({ quality: WEBP_QUALITY });
      } else {
        // gif or unknown - leave as-is
        totalAfter += before;
        continue;
      }

      const buf = await pipeline.toBuffer();
      // Only overwrite if smaller (avoid quality loss when not gaining size)
      if (buf.byteLength < before) {
        await fs.writeFile(file, buf);
        const after = buf.byteLength;
        totalAfter += after;
        changed += 1;
        // eslint-disable-next-line no-console
        console.log(`${path.relative(process.cwd(), file)}: ${fmtBytes(before)} -> ${fmtBytes(after)}`);
      } else {
        totalAfter += before;
      }
    } catch (err) {
      totalAfter += before;
      // eslint-disable-next-line no-console
      console.warn(`Skip (error): ${path.relative(process.cwd(), file)} (${String(err)})`);
    }
  }

  // eslint-disable-next-line no-console
  console.log("\nSummary");
  console.log(`Files scanned: ${files.length}`);
  console.log(`Files optimized: ${changed}`);
  console.log(`Total: ${fmtBytes(totalBefore)} -> ${fmtBytes(totalAfter)} (saved ${fmtBytes(Math.max(0, totalBefore - totalAfter))})`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
