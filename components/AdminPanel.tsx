import React, { useMemo, useRef, useState } from "react";
import { loadSiteConfig, saveSiteConfig, SiteConfig, HeroSlideConfig } from "./siteConfig";

// Frontend-only admin panel (localStorage). Not secure.
const ADMIN_PASSWORD = "admin";

async function fileToCompressedDataUrl(file: File, opts: { maxW: number; maxH: number; quality: number }) {
  // Converts image -> resized JPEG data URL (smaller than PNG usually)
  const bitmap = await createImageBitmap(file);

  const { maxW, maxH, quality } = opts;
  const scale = Math.min(maxW / bitmap.width, maxH / bitmap.height, 1);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, w, h);

  // JPEG for smaller size in localStorage.
  return canvas.toDataURL("image/jpeg", quality);
}

const AdminPanel: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  const initial = useMemo<SiteConfig>(() => loadSiteConfig() || {}, []);
  const [cfg, setCfg] = useState<SiteConfig>(initial);

  const [pw, setPw] = useState("");

  const heroFileRef = useRef<HTMLInputElement | null>(null);

  const login = () => {
    if (pw === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return;
    }
    window.alert("Wrong password");
  };

  const persist = (next: SiteConfig) => {
    setCfg(next);
    saveSiteConfig(next);
  };

  const heroSlides = cfg.heroSlides || [];

  const addHeroSlide = () => {
    const src = window.prompt("Paste image URL for Hero slide (https://...)");
    if (!src) return;
    const alt = window.prompt("Alt text (short label)") || "Hero slide";
    const objectPosition = window.prompt('Object position (CSS) e.g. "center 30%" (optional)') || "";
    const next: HeroSlideConfig = {
      src: src.trim(),
      alt: alt.trim(),
      objectPosition: objectPosition.trim() || undefined,
    };
    persist({ ...cfg, heroSlides: [...heroSlides, next] });
  };

  const triggerHeroUpload = () => {
    heroFileRef.current?.click();
  };

  const onHeroFilesSelected = async (files: FileList | null) => {
    if (!files || !files.length) return;
    try {
      // Keep images reasonably small for localStorage.
      const dataUrls = await Promise.all(
        Array.from(files).map((f) => fileToCompressedDataUrl(f, { maxW: 1920, maxH: 1080, quality: 0.82 })),
      );

      const nextSlides: HeroSlideConfig[] = dataUrls.map((src, idx) => ({
        src,
        alt: `Hero slide ${heroSlides.length + idx + 1}`,
      }));

      persist({ ...cfg, heroSlides: [...heroSlides, ...nextSlides] });
    } catch (e: any) {
      window.alert(`Upload failed: ${e?.message || String(e)}`);
    } finally {
      if (heroFileRef.current) heroFileRef.current.value = "";
    }
  };

  const removeHeroSlide = (i: number) => {
    const next = heroSlides.filter((_, idx) => idx !== i);
    persist({ ...cfg, heroSlides: next });
  };

  const resetAll = () => {
    if (!window.confirm("Reset ALL admin image settings? (This clears localStorage config)")) return;
    persist({});
  };

  return (
    <section className="container mx-auto px-6">
      <div className="text-center mb-10">
        <span className="inline-block px-4 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm font-bold mb-6 tracking-widest">
          ADMIN
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-brand-dark">Site Admin Panel</h1>
        <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">
          Change Hero slides. Saved in this browser (localStorage). This is not secure.
        </p>
      </div>

      {!isAdmin ? (
        <div className="max-w-md mx-auto rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl p-6">
          <div className="text-sm font-bold text-slate-800">Enter admin password</div>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="mt-3 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3"
            placeholder="Password"
          />
          <button
            type="button"
            onClick={login}
            className="mt-4 w-full px-5 py-3 rounded-xl font-bold text-white bg-brand-dark hover:bg-brand-light transition"
          >
            Unlock
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Hidden input for uploads */}
          <input
            ref={heroFileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onHeroFilesSelected(e.target.files)}
          />

          {/* Hero */}
          <div className="rounded-[2rem] bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl p-6">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <div className="text-sm font-bold text-brand-dark">Hero Slides</div>
                <div className="text-xs text-slate-500">You can paste image URLs or upload images (saved in this browser).</div>
                <div className="mt-1 text-xs text-amber-700">Note: localStorage has a size limit. Upload only a few compressed images.</div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={addHeroSlide}
                  className="px-4 py-2 rounded-xl font-bold text-white bg-brand-dark hover:bg-brand-light transition"
                >
                  + Add by URL
                </button>
                <button
                  type="button"
                  onClick={triggerHeroUpload}
                  className="px-4 py-2 rounded-xl font-bold text-slate-800 bg-white/80 border border-slate-200 hover:bg-white transition"
                >
                  Upload Images
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-4 py-2 rounded-xl font-bold text-slate-700 bg-white/80 border border-slate-200 hover:bg-white transition"
                >
                  Reset
                </button>
              </div>
            </div>

            {heroSlides.length ? (
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                {heroSlides.map((s, i) => (
                  <div key={`${s.src}-${i}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-bold text-slate-900">{s.alt}</div>
                    <div className="mt-1 text-xs text-slate-500 break-all">{s.src}</div>
                    {s.objectPosition ? <div className="mt-1 text-xs text-slate-500">pos: {s.objectPosition}</div> : null}
                    <div className="mt-3 aspect-[16/9] rounded-xl overflow-hidden border border-slate-200">
                      <img src={s.src} alt={s.alt} className="w-full h-full object-cover" />
                    </div>
                    <button type="button" onClick={() => removeHeroSlide(i)} className="mt-3 text-sm font-bold text-rose-600 hover:underline">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 text-slate-600">No custom hero slides saved. Using default slides.</div>
            )}
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-amber-900 text-sm">
            Gallery editing has been removed from the Admin Panel to avoid conflicting saved settings.
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminPanel;
