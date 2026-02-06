import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Generates placeholder / random images for the Gallery.
// Output: components/images/gallery/annual-day-2026/*.webp

const OUT_DIR = path.resolve("components/images/gallery/annual-day-2026");
const COUNT = 12;

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function hslToRgb(h, s, l) {
  // h: 0..360, s/l: 0..1
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let [r1, g1, b1] = [0, 0, 0];
  if (hp >= 0 && hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const m = l - c / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function svgTemplate({ w, h, title, subtitle, c1, c2, seed }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="20"/>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#g)"/>

  <!-- soft blobs -->
  <g filter="url(#blur)" opacity="0.55">
    <circle cx="${Math.floor(w * 0.2)}" cy="${Math.floor(h * 0.35)}" r="${Math.floor(h * 0.35)}" fill="#ffffff"/>
    <circle cx="${Math.floor(w * 0.85)}" cy="${Math.floor(h * 0.2)}" r="${Math.floor(h * 0.3)}" fill="#000000" opacity="0.2"/>
    <circle cx="${Math.floor(w * 0.75)}" cy="${Math.floor(h * 0.8)}" r="${Math.floor(h * 0.25)}" fill="#ffffff" opacity="0.6"/>
  </g>

  <!-- footer bar -->
  <rect x="0" y="${h - 140}" width="${w}" height="140" fill="#000" opacity="0.18"/>

  <text x="70" y="${h - 80}" fill="#fff" font-size="60" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" font-weight="800">${title}</text>
  <text x="70" y="${h - 35}" fill="#fff" opacity="0.9" font-size="28" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" font-weight="600">${subtitle}</text>

  <!-- tiny seed marker -->
  <text x="${w - 70}" y="${h - 35}" text-anchor="end" fill="#fff" opacity="0.5" font-size="18" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas">#${seed}</text>
</svg>`;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (let i = 1; i <= COUNT; i++) {
    const rng = mulberry32(2026000 + i * 97);
    const w = 1600;
    const h = 1000;

    const h1 = randInt(rng, 0, 360);
    const h2 = (h1 + randInt(rng, 40, 140)) % 360;

    const a = hslToRgb(h1, 0.75, 0.45);
    const b = hslToRgb(h2, 0.75, 0.45);

    const c1 = `rgb(${a.r},${a.g},${a.b})`;
    const c2 = `rgb(${b.r},${b.g},${b.b})`;

    const svg = svgTemplate({
      w,
      h,
      title: "Annual Day 2026",
      subtitle: "Gallery (placeholder images)",
      c1,
      c2,
      seed: i,
    });

    const outName = `annual-day-2026-${String(i).padStart(2, "0")}.webp`;
    const outPath = path.join(OUT_DIR, outName);

    // SVG -> WebP (compressed)
    await sharp(Buffer.from(svg))
      .webp({ quality: 70, effort: 6 })
      .toFile(outPath);

    // eslint-disable-next-line no-console
    console.log("Wrote", outPath);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
