import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Fix rotated images by applying EXIF orientation and writing back.
// Uses sharp().rotate() which auto-rotates based on EXIF.

const ROOT = path.resolve(process.cwd(), "components", "images");
const EXT_OK = new Set([".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP"]);

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

  let fixed = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();

    try {
      const before = (await fs.stat(file)).size;
      const inputBuf = await fs.readFile(file);
      let img = sharp(inputBuf, { animated: true }).rotate();

      if (ext === ".jpg" || ext === ".jpeg") {
        img = img.jpeg({ quality: 80, mozjpeg: true, progressive: true });
      } else if (ext === ".png") {
        img = img.png({ compressionLevel: 9, palette: true });
      } else if (ext === ".webp") {
        img = img.webp({ quality: 80 });
      }

      const outBuf = await img.toBuffer();

      // Overwrite only if it actually changed a bit (avoid rewriting everything if not needed)
      // Rotation may change bytes even if not rotated; still safe to overwrite.
      await fs.writeFile(file, outBuf);
      const after = outBuf.byteLength;

      if (after !== before) {
        fixed += 1;
        console.log(`${path.relative(process.cwd(), file)}: ${fmtBytes(before)} -> ${fmtBytes(after)}`);
      }
    } catch (e) {
      console.warn(`Skip (error): ${path.relative(process.cwd(), file)} (${String(e)})`);
    }
  }

  console.log(`\nDone. Files rewritten: ${fixed} (note: some may be unchanged visually).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
