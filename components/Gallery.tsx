import React, { useEffect, useMemo, useState } from "react";
// siteConfig-based gallery customization removed

type GalleryImage = { src: string; alt: string };

type GallerySection = {
  title: string;
  subtitle?: string;
  images: GalleryImage[];
};

const GALLERY_ENDPOINT = (import.meta as any).env?.VITE_GALLERY_ENDPOINT as string | undefined;

function imagesFromFolder(glob: Record<string, { default: string }>, label: string): GalleryImage[] {
  return Object.keys(glob)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((path, idx) => ({
      src: glob[path].default,
      alt: `${label} ${idx + 1}`,
    }));
}

const campusGlob = import.meta.glob("./images/gallery/campus/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP}", {
  eager: true,
}) as Record<string, { default: string }>;

const annualDay2026Glob = import.meta.glob(
  "./images/gallery/annual-day-2026/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP}",
  { eager: true },
) as Record<string, { default: string }>;

const childrensDayGlob = import.meta.glob(
  "./images/gallery/childrens-day/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP}",
  { eager: true },
) as Record<string, { default: string }>;

const defaultGalleries: GallerySection[] = [
  {
    title: "Campus Highlights",
    subtitle: "Auto-scrolling highlights from campus life, activities, and events.",
    images: imagesFromFolder(campusGlob, "Campus highlight"),
  },
  {
    title: "Annual Day 2026",
    subtitle: "Dance, music, awards, and celebrations — Annual Day 2026.",
    images: imagesFromFolder(annualDay2026Glob, "Annual Day 2026"),
  },
  {
    title: "Children’s Day",
    subtitle: "Smiles, fun, and celebrations from Children’s Day.",
    images: imagesFromFolder(childrensDayGlob, "Children’s Day"),
  },
];

const PREVIEW_COUNT = 200; // increase so auto-scroll shows many more images

const ADMIN_TOKEN_STORAGE_KEY = "future_spark_admin_token_v1";

function hasAdminToken() {
  try {
    return !!(localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "").trim();
  } catch {
    return false;
  }
}

const Gallery: React.FC = () => {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [remoteGalleries, setRemoteGalleries] = useState<GallerySection[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(hasAdminToken());
  }, []);

  useEffect(() => {
    if (!GALLERY_ENDPOINT) return;

    const run = async () => {
      try {
        const url = new URL(GALLERY_ENDPOINT);
        url.searchParams.set("type", "gallery");
        url.searchParams.set("_ts", String(Date.now()));
        const res = await fetch(url.toString(), { cache: "no-store" });
        const j = await res.json().catch(() => null);
        if (!res.ok || !j || j.ok !== true || !Array.isArray(j.albums)) return;

        const mapped: GallerySection[] = j.albums
          .map((a: any) => ({
            title: String(a.title || "").trim(),
            subtitle: a.subtitle ? String(a.subtitle) : undefined,
            images: Array.isArray(a.images)
              ? a.images
                  .map((im: any) => ({
                    src: String(im.src || "").trim(),
                    alt: String(im.alt || a.title || "photo").trim(),
                  }))
                  .filter((im: any) => !!im.src)
              : [],
          }))
          .filter((a) => a.title && a.images.length);

        if (mapped.length) setRemoteGalleries(mapped);
      } catch {
        // ignore; fallback to local
      }
    };

    run();
  }, []);

  const galleryRows = useMemo(() => {
    // Show remote albums (Drive) *and* local bundled albums together.
    const seen = new Set<string>();
    const merged: GallerySection[] = [];

    const pushUnique = (arr: GallerySection[]) => {
      arr.forEach((g) => {
        const key = (g.title || "").trim().toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        merged.push(g);
      });
    };

    if (remoteGalleries && remoteGalleries.length) pushUnique(remoteGalleries);
    pushUnique(defaultGalleries);

    return merged.map((g) => ({
      ...g,
      preview: g.images.slice(0, PREVIEW_COUNT),
    }));
  }, [remoteGalleries]);

  return (
    <section className="container mx-auto px-6">
      <div className="text-center mb-10">
        <span className="inline-block px-4 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm font-bold mb-6 tracking-widest">
          GALLERY
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-brand-dark">School Gallery</h1>
        <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">Browse event-wise collections — each row auto-scrolls.</p>

        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          <a
            href="/gallery-admin"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-brand-dark hover:bg-brand-light shadow-lg transition active:scale-95"
          >
            Add photos
          </a>
          {!isAdmin ? (
            <div className="text-xs text-slate-500">(Admin login required)</div>
          ) : null}
        </div>
      </div>

      <div className="space-y-10">
        {galleryRows.map((gallery) => {
          const isOpen = !!open[gallery.title];
          const loop = gallery.preview.length < 2 ? gallery.preview : [...gallery.preview, ...gallery.preview];

          return (
            <div key={gallery.title} className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-brand-dark">{gallery.title}</h2>
                {gallery.subtitle ? <p className="text-slate-600 md:text-right">{gallery.subtitle}</p> : null}
              </div>

              {gallery.images.length > 0 ? (
                <>
                  {/* Preview row (auto-scroll) */}
                  <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/60 backdrop-blur-xl shadow-xl">
                    {/* Fade edges */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white/90 to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white/90 to-transparent z-10" />

                    <div className="py-6">
                      <div className="galleryMarquee group">
                        {loop.map((img, idx) => (
                          <div
                            key={`${gallery.title}-${img.alt}-${idx}`}
                            className="galleryItem rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-lg"
                          >
                            <div className="relative h-full w-full overflow-hidden">
                              <img
                                src={img.src}
                                alt={img.alt}
                                className="galleryImg h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* View more */}
                  {gallery.images.length > PREVIEW_COUNT ? (
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setOpen((p) => ({ ...p, [gallery.title]: !p[gallery.title] }))}
                        className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-brand-dark hover:bg-brand-light shadow-lg transition active:scale-95"
                      >
                        {isOpen ? "Hide full gallery" : `View full gallery (${gallery.images.length})`}
                      </button>
                    </div>
                  ) : null}

                  {/* Full gallery grid (on click) */}
                  {isOpen ? (
                    <div className="mt-4 rounded-[2rem] border border-slate-200 bg-white/70 backdrop-blur-xl shadow-xl p-5">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {gallery.images.map((img, idx) => (
                          <div
                            key={`${gallery.title}-full-${idx}`}
                            className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm"
                          >
                            <img
                              src={img.src}
                              alt={img.alt}
                              className="galleryImg w-full h-[160px] sm:h-[170px] md:h-[180px] object-cover transition-transform duration-500 hover:scale-110"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-[2rem] border border-slate-200 bg-white/70 backdrop-blur-xl shadow-xl p-6 text-slate-700">
                  <div className="font-bold">Coming soon</div>
                  <div className="mt-2 text-slate-600">Add photos to the folder for this event and we will show them here.</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Component-scoped styles */}
      <style>{`
        .galleryMarquee {
          display: flex;
          gap: 18px;
          width: max-content;
          padding: 0 18px;
          animation: galleryScroll 60s linear infinite;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
        .group:hover .galleryMarquee {
          animation-play-state: paused;
        }
        .galleryItem {
          width: 260px;
          height: 340px;
          flex: 0 0 auto;
        }
        .galleryItem img {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
        @media (max-width: 640px) {
          .galleryItem {
            width: 210px;
            height: 280px;
          }
        }
        @keyframes galleryScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .galleryMarquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};

export default Gallery;
