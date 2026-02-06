export type HeroSlideConfig = {
  src: string;
  alt: string;
  objectPosition?: string; // e.g. "center 30%"
};

export type GalleryImageConfig = { src: string; alt?: string };

export type GallerySectionConfig = {
  title: string;
  subtitle?: string;
  images: GalleryImageConfig[];
};

export type SiteConfig = {
  heroSlides?: HeroSlideConfig[];
  gallerySections?: GallerySectionConfig[];
};

export const SITE_CONFIG_STORAGE_KEY = "future_spark_site_config_v1";

export function loadSiteConfig(): SiteConfig | null {
  try {
    const raw = localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SiteConfig;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSiteConfig(next: SiteConfig) {
  try {
    localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}
