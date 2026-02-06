import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_TOKEN_STORAGE_KEY = "future_spark_admin_token_v1";

const GALLERY_ENDPOINT = (import.meta as any).env?.VITE_GALLERY_ENDPOINT as string | undefined;
// NOTE: We do NOT use VITE_EVENTS_TOKEN for client-side auth.
// Admin login is based on the token stored in localStorage.

function getStoredToken() {
  try {
    return (localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

function withQuery(url: string, params: Record<string, string>) {
  const u = new URL(url);
  Object.entries(params).forEach(([k, v]) => {
    if (v && v.trim()) u.searchParams.set(k, v.trim());
  });
  return u.toString();
}

type UploadItem = {
  file: File;
  previewUrl: string;
  status: "queued" | "compressing" | "uploading" | "done" | "error";
  message?: string;
};

type RemoteImage = { id?: string; src: string; alt?: string };
type RemoteAlbum = { key: string; title: string; images: RemoteImage[] };

async function fileToWebpBlob(file: File, opts: { maxW: number; quality: number }) {
  // Load image
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, opts.maxW / bitmap.width);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, w, h);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", opts.quality),
  );
  if (!blob) throw new Error("Compression failed");
  return blob;
}

function safeAlbumKey(name: string) {
  // Keep it URL/folder safe-ish; server can also sanitize.
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const GalleryAdmin: React.FC = () => {
  const nav = useNavigate();

  const [token, setToken] = useState(() => getStoredToken());

  // Keep token in sync with localStorage (so logout immediately locks the page)
  useEffect(() => {
    const sync = () => setToken(getStoredToken());
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // Route protection: require login to view this page
  useEffect(() => {
    if (!token) {
      nav("/events-admin?next=gallery-admin", { replace: true });
    }
  }, [token, nav]);

  const logout = () => {
    try {
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
    setToken("");
    nav("/events-admin?next=gallery-admin", { replace: true });
  };

  const [albumName, setAlbumName] = useState("Annual Day 2026");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [albums, setAlbums] = useState<RemoteAlbum[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAlbumKey, setDeletingAlbumKey] = useState<string | null>(null);

  const loadAlbums = async () => {
    if (!GALLERY_ENDPOINT) return;
    setLoadingAlbums(true);
    try {
      const url = new URL(GALLERY_ENDPOINT);
      url.searchParams.set("type", "gallery");
      url.searchParams.set("_ts", String(Date.now()));
      const res = await fetch(url.toString(), { cache: "no-store" });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j || j.ok !== true || !Array.isArray(j.albums)) return;

      const mapped: RemoteAlbum[] = j.albums
        .map((a: any) => ({
          key: String(a.key || "").trim(),
          title: String(a.title || a.key || "").trim(),
          images: Array.isArray(a.images)
            ? a.images
                .map((im: any) => ({
                  id: im.id ? String(im.id) : undefined,
                  src: String(im.src || "").trim(),
                  alt: im.alt ? String(im.alt) : undefined,
                }))
                .filter((im: any) => !!im.src)
            : [],
        }))
        .filter((a: any) => a.key && a.title);

      setAlbums(mapped);
    } finally {
      setLoadingAlbums(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  const deleteAllInAlbum = async (albumKey: string, albumTitle: string) => {
    setErr(null);

    if (!token) {
      nav("/events-admin?next=gallery-admin", { replace: true });
      return;
    }
    if (!GALLERY_ENDPOINT) {
      setErr("Gallery endpoint not configured. Set VITE_GALLERY_ENDPOINT.");
      return;
    }

    const ok = window.confirm(`Delete ALL photos in "${albumTitle}"? This will move them to Drive Trash.`);
    if (!ok) return;

    setDeletingAlbumKey(albumKey);
    try {
      const postUrl = withQuery(GALLERY_ENDPOINT, { token });
      const res = await fetch(postUrl, {
        method: "POST",
        headers: {
          "content-type": "text/plain;charset=UTF-8",
        },
        body: JSON.stringify({
          formType: "gallery",
          action: "deleteAll",
          albumKey,
        }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j || j.ok !== true) {
        throw new Error(j?.error || `Delete failed: HTTP ${res.status}`);
      }
      await loadAlbums();
    } catch (e: any) {
      setErr(e?.message || "Delete failed");
    } finally {
      setDeletingAlbumKey(null);
    }
  };

  const deletePhoto = async (fileId: string) => {
    setErr(null);

    if (!token) {
      nav("/events-admin?next=gallery-admin", { replace: true });
      return;
    }
    if (!GALLERY_ENDPOINT) {
      setErr("Gallery endpoint not configured. Set VITE_GALLERY_ENDPOINT.");
      return;
    }

    setDeletingId(fileId);
    try {
      const postUrl = withQuery(GALLERY_ENDPOINT, { token });
      const res = await fetch(postUrl, {
        method: "POST",
        headers: {
          "content-type": "text/plain;charset=UTF-8",
        },
        body: JSON.stringify({
          formType: "gallery",
          action: "delete",
          fileId,
        }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j || j.ok !== true) {
        throw new Error(j?.error || `Delete failed: HTTP ${res.status}`);
      }
      await loadAlbums();
    } catch (e: any) {
      setErr(e?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const onPick = (files: FileList | null) => {
    if (!files) return;

    const next: UploadItem[] = [];
    Array.from(files).forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      const previewUrl = URL.createObjectURL(f);
      next.push({ file: f, previewUrl, status: "queued" });
    });

    setItems((prev) => [...prev, ...next]);
  };

  const clear = () => {
    items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setItems([]);
  };

  const uploadAll = async () => {
    setErr(null);

    if (!token) {
      nav("/events-admin?next=gallery-admin", { replace: true });
      return;
    }

    if (!GALLERY_ENDPOINT) {
      setErr("Gallery endpoint not configured. Set VITE_GALLERY_ENDPOINT.");
      return;
    }

    const album = albumName.trim();
    if (!album) {
      setErr("Please enter an album name.");
      return;
    }

    const key = safeAlbumKey(album);
    if (!key) {
      setErr("Album name is invalid.");
      return;
    }

    if (!items.length) {
      setErr("Please select photos.");
      return;
    }

    const MAX_FILES = 15;
    const toUpload = items.slice(0, MAX_FILES);

    setBusy(true);
    try {
      // Compress in browser to WebP, then upload as base64.
      for (let idx = 0; idx < toUpload.length; idx++) {
        const it = toUpload[idx];

        setItems((prev) => {
          const copy = prev.slice();
          if (copy[idx]) copy[idx] = { ...copy[idx], status: "compressing", message: undefined };
          return copy;
        });

        const webpBlob = await fileToWebpBlob(it.file, { maxW: 1800, quality: 0.75 });

        // Convert to base64 safely (avoid call stack issues with huge Uint8Array spreads)
        const b64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onerror = () => reject(new Error("Failed to read image"));
          r.onload = () => {
            const s = String(r.result || "");
            const m = s.match(/^data:.*?;base64,(.+)$/);
            resolve(m ? m[1] : "");
          };
          r.readAsDataURL(webpBlob);
        });

        if (!b64) throw new Error("Base64 conversion failed");

        const filename = `${Date.now()}-${idx + 1}.webp`;

        setItems((prev) => {
          const copy = prev.slice();
          if (copy[idx]) copy[idx] = { ...copy[idx], status: "uploading" };
          return copy;
        });

        const postUrl = withQuery(GALLERY_ENDPOINT, { token });
        const res = await fetch(postUrl, {
          method: "POST",
          headers: {
            // simple content-type to avoid CORS preflight
            "content-type": "text/plain;charset=UTF-8",
          },
          body: JSON.stringify({
            formType: "gallery",
            action: "upload",
            albumTitle: album,
            albumKey: key,
            filename,
            contentType: "image/webp",
            base64: b64,
          }),
        });

        const j = await res.json().catch(() => null);
        if (!res.ok || !j || j.ok !== true) {
          throw new Error(j?.error || `Upload failed: HTTP ${res.status}`);
        }

        setItems((prev) => {
          const copy = prev.slice();
          if (copy[idx]) copy[idx] = { ...copy[idx], status: "done" };
          return copy;
        });
      }

      // Refresh remote list
      await loadAlbums();

      if (items.length > MAX_FILES) {
        setErr(`Completed: uploaded ${MAX_FILES}. Please upload remaining ${items.length - MAX_FILES} in next batch.`);
      } else {
        setErr(`Completed: uploaded ${toUpload.length} photos successfully.`);
      }
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
      setItems((prev) => prev.map((p) => (p.status === "done" ? p : { ...p, status: "error" })));
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    // Don't render the admin UI even for a moment; redirect effect will run.
    return null;
  }

  return (
    <section className="container mx-auto px-6">
      <div className="text-center mb-10">
        <span className="inline-block px-4 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm font-bold mb-6 tracking-widest">
          GALLERY ADMIN
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-brand-dark">Upload Photos</h1>
        <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">
          Create albums and upload photos. They will be visible to everyone visiting the website.
        </p>
      </div>

      <div className="max-w-3xl mx-auto rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? nav(-1) : nav("/"))}
            className="px-4 py-2 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            Back
          </button>

          {token ? (
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-xl font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition"
            >
              Logout
            </button>
          ) : null}
        </div>

        {!token ? (
          <div className="mt-4 text-sm font-bold text-rose-700">
            Not logged in. Click “Login” and use your admin password.
          </div>
        ) : null}

        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-sm font-bold text-slate-700">
            Album name
            <input
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2"
              placeholder="e.g., Sports Day 2026"
            />
          </label>

          <label className="text-sm font-bold text-slate-700">
            Pick photos
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => onPick(e.target.files)}
              className="mt-1 block w-full"
            />
          </label>
        </div>

        {err ? <div className="mt-4 text-sm font-bold text-rose-700">{err}</div> : null}

        <div className="mt-5 flex gap-3 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => nav("/events-admin?next=gallery-admin")}
            className="px-5 py-3 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            Login
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={busy}
            className="px-5 py-3 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 transition"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={uploadAll}
            disabled={busy || items.length === 0}
            className="px-5 py-3 rounded-xl font-bold text-white bg-brand-dark hover:bg-brand-light disabled:opacity-60 transition"
          >
            {busy ? "Uploading..." : `Upload ${Math.min(items.length, 15)}${items.length > 15 ? ` (of ${items.length})` : ""}`}
          </button>
        </div>

        {items.length ? (
          <div className="mt-6">
            <div className="text-sm font-bold text-slate-700">Selected ({items.length})</div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((it, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
                  <img src={it.previewUrl} alt={it.file.name} className="w-full h-[140px] object-cover" />
                  <div className="p-2 text-xs">
                    <div className="truncate font-bold text-slate-800">{it.file.name}</div>
                    <div className="mt-1 text-slate-500">{it.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-10 border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-lg font-extrabold text-brand-dark">Manage uploaded albums</div>
            <button
              type="button"
              onClick={loadAlbums}
              disabled={loadingAlbums}
              className="px-4 py-2 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 transition"
            >
              {loadingAlbums ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {albums.length ? (
            <div className="mt-4 space-y-8">
              {albums.map((a) => (
                <div key={a.key} className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow p-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="font-extrabold text-slate-900">{a.title}</div>
                    <button
                      type="button"
                      onClick={() => deleteAllInAlbum(a.key, a.title)}
                      disabled={!!deletingAlbumKey}
                      className="px-4 py-2 rounded-xl font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 disabled:opacity-60 transition"
                      title="Delete all photos in this album"
                    >
                      {deletingAlbumKey === a.key ? "Deleting..." : "Delete all"}
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {a.images.map((im, idx) => (
                      <div key={`${a.key}-${im.id || idx}`} className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
                        <img src={im.src} alt={im.alt || a.title} className="w-full h-[140px] object-cover" />
                        <div className="p-2 text-xs flex items-center justify-between gap-2">
                          <div className="truncate text-slate-600">{im.id ? im.id.slice(0, 10) + "…" : ""}</div>
                          {im.id ? (
                            <button
                              type="button"
                              onClick={() => deletePhoto(im.id!)}
                              disabled={!!deletingId}
                              className="px-3 py-1 rounded-lg font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 disabled:opacity-60"
                              title="Delete photo"
                            >
                              {deletingId === im.id ? "Deleting..." : "Delete"}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-600">No remote albums found yet.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GalleryAdmin;
