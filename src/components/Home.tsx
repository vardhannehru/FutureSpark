import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Hero from "./Hero";
import About from "./About";
import Programs from "./Programs";
import Stats from "./Stats";
import PhoneMockup from "./PhoneMockup";
import MapBlock from "./MapBlock";
import { MCBScreen } from "./MCB";

import imgCampus from "./images/futuresparkschool.jpg";
import imgSports from "./images/sports.jpg";
import imgCbse from "./images/CBSE.jpg";
import imgBoards from "./images/digitalboards.jpg";

type HomeEvent = {
  id: string;
  badge?: string;
  title: string;
  // Stored fields (preferred)
  dateISO?: string; // YYYY-MM-DD
  time24?: string; // HH:MM
  venue?: string;
  posterUrl?: string; // optional image URL
  // Back-compat (older storage)
  meta?: string; // e.g., "10 Feb • 10:00 AM • Auditorium"
  description: string;

  // For admin delete: absolute row number in the Google Sheet (1-based)
  sheetRow?: number;
};

function normalizeDriveImageUrl(url: string) {
  const u = (url || "").trim();
  if (!u) return "";
  // Convert Drive uc view links to thumbnail links (more reliable in <img>)
  const m = u.match(/drive\.google\.com\/uc\?export=view&id=([^&]+)/i);
  if (m && m[1]) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1200`;
  return u;
}

const EVENTS_STORAGE_KEY = "future_spark_events_v1";

// ✅ Google Sheet (published) CSV source (syncs across devices)
// Your published link was:
// https://docs.google.com/spreadsheets/d/e/2PACX-1vQJPW4q4RkH7JYqBaN3CY7oNlEPWhqiHDSzZl1lSOKJVyHp9VcHwE773L-XW4R72TC8e6x9L5lWzlnB/pubhtml?gid=479958431&single=true
// CSV export endpoint:
const EVENTS_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJPW4q4RkH7JYqBaN3CY7oNlEPWhqiHDSzZl1lSOKJVyHp9VcHwE773L-XW4R72TC8e6x9L5lWzlnB/pub?gid=479958431&single=true&output=csv";

// Faster option (recommended): Google Apps Script Web App endpoint that returns JSON.
// Set in .env.local:
//   VITE_EVENTS_ENDPOINT="https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec?type=events"
const EVENTS_ENDPOINT = (import.meta as any).env?.VITE_EVENTS_ENDPOINT as string | undefined;

const IS_SHEET_MODE = false;

const Home: React.FC = () => {
  const defaultEvents = useMemo<HomeEvent[]>(
    () => [
      {
        id: "default-1",
        badge: "TBD",
        title: "Event Title",
        dateISO: "",
        time24: "",
        venue: "",
        meta: "Date • Time • Venue",
        description: "Short description of the event goes here.",
      },
      {
        id: "default-2",
        badge: "TBD",
        title: "Event Title",
        dateISO: "",
        time24: "",
        venue: "",
        meta: "Date • Time • Venue",
        description: "Short description of the event goes here.",
      },
      {
        id: "default-3",
        badge: "TBD",
        title: "Event Title",
        dateISO: "",
        time24: "",
        venue: "",
        meta: "Date • Time • Venue",
        description: "Short description of the event goes here.",
      },
    ],
    [],
  );

  const [events, setEvents] = useState<HomeEvent[]>(defaultEvents);
  const formatEventMeta = (ev: HomeEvent) => {
    // Prefer structured fields; fall back to meta (older saved data)
    const dateISO = (ev.dateISO || "").trim();
    const time24 = (ev.time24 || "").trim();
    const venue = (ev.venue || "").trim();

    const parts: string[] = [];

    if (dateISO) {
      // Prefer ISO date coming from the sheet: YYYY-MM-DD
      // If the sheet contains a non-ISO string (e.g. "10 Feb"), don't crash—just show it as-is.
      const isISO = /^\d{4}-\d{2}-\d{2}$/.test(dateISO);
      if (isISO) {
        try {
          const dt = new Date(`${dateISO}T00:00:00`);
          const dateText = new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(dt);
          parts.push(dateText);
        } catch {
          parts.push(dateISO);
        }
      } else {
        parts.push(dateISO);
      }
    }

    if (time24) {
      // Preferred: 24h time HH:MM
      const isHHMM = /^\d{1,2}:\d{2}$/.test(time24);
      if (isHHMM) {
        const [hh, mm] = time24.split(":").map((x) => Number(x));
        if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
          const dt = new Date();
          dt.setHours(hh, mm, 0, 0);
          const timeText = new Intl.DateTimeFormat("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }).format(dt);
          parts.push(timeText);
        }
      } else {
        // Allow sheet values like "10:00 AM"
        parts.push(time24);
      }
    }

    if (venue) parts.push(venue);

    const built = parts.filter(Boolean).join(" • ");
    return built || (ev.meta || "");
  };

  function parseCSV(text: string): Record<string, string>[] {
    // Small CSV parser supporting quotes.
    const rows: string[][] = [];
    let cur = "";
    let inQuotes = false;
    let row: string[] = [];

    const pushCell = () => {
      row.push(cur);
      cur = "";
    };

    const pushRow = () => {
      // Skip completely empty rows
      if (row.some((c) => String(c).trim() !== "")) rows.push(row);
      row = [];
    };

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (ch === '"') {
        if (inQuotes && next === '"') {
          // escaped quote
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (!inQuotes && ch === ",") {
        pushCell();
        continue;
      }

      if (!inQuotes && (ch === "\n" || ch === "\r")) {
        if (ch === "\r" && next === "\n") i++;
        pushCell();
        pushRow();
        continue;
      }

      cur += ch;
    }
    // last cell/row
    pushCell();
    pushRow();

    const header = (rows.shift() || []).map((h) => h.trim());
    return rows
      .map((r) => {
        const obj: Record<string, string> = {};
        header.forEach((h, idx) => {
          if (!h) return;
          obj[h] = (r[idx] || "").trim();
        });
        return obj;
      })
      .filter((o) => Object.keys(o).length > 0);
  }

  const loadEventsFromSheet = async () => {
    // 1) Try Apps Script JSON endpoint (fast + no Sheets publish caching)
    if (EVENTS_ENDPOINT) {
      try {
        const url = `${EVENTS_ENDPOINT}${EVENTS_ENDPOINT.includes("?") ? "&" : "?"}_ts=${Date.now()}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { ok?: boolean; error?: string; events?: any[] };
        if (json?.ok === false) throw new Error(json.error || "events endpoint error");
        const rows = Array.isArray(json?.events) ? json.events : [];

        const mapped: HomeEvent[] = rows
          .map((r, idx) => {
            const title = String(r.title || r.Title || "").trim();
            if (!title) return null;
            const dateISO = String(r.dateISO || r.date || r.Date || "").trim();
            const time24 = String(r.time24 || r.time || r.Time || "").trim();
            const venue = String(r.venue || r.Venue || "").trim();
            const badge = String(r.badge || r.Badge || "").trim();
            const description = String(r.description || r.Description || "").trim();
            const posterUrl = String(r.posterUrl || r.poster || r.Poster || r["Poster URL"] || r["poster url"] || "").trim();
            const sheetRowRaw = (r.sheetRow ?? r.rowNumber ?? r.row ?? "") as any;
            const sheetRow = Number(sheetRowRaw);

            const ev: HomeEvent = {
              id: `sheet-${idx}-${title.replace(/\s+/g, "-")}`,
              title,
              badge,
              dateISO,
              time24,
              venue,
              posterUrl,
              meta: "",
              description,
              sheetRow: Number.isFinite(sheetRow) && sheetRow > 0 ? sheetRow : undefined,
            };
            ev.meta = formatEventMeta(ev);
            return ev;
          })
          .filter(Boolean) as HomeEvent[];

        setEvents(mapped.slice(0, 6));

        try {
          if (mapped.length) {
            localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(mapped.slice(0, 6)));
          } else {
            localStorage.removeItem(EVENTS_STORAGE_KEY);
          }
        } catch {
          // ignore
        }

        return;
      } catch {
        // fall through to CSV/localStorage
      }
    }

    // 2) Try Google Sheet published CSV (cross-device, but can be cached/delayed)
    try {
      const url = `${EVENTS_SHEET_CSV_URL}&_ts=${Date.now()}`; // cache-buster
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const csv = await res.text();
      const rows = parseCSV(csv);

      const mapped: HomeEvent[] = rows
        .map((r, idx) => {
          const title = (r.title || r.Title || "").trim();
          if (!title) return null;
          const dateISO = (r.date || r.Date || "").trim();
          const time24 = (r.time || r.Time || "").trim();
          const venue = (r.venue || r.Venue || "").trim();
          const badge = (r.badge || r.Badge || "").trim();
          const description = (r.description || r.Description || "").trim();
          const posterUrl = (r.posterUrl || r.poster || r.Poster || r["Poster URL"] || r["poster url"] || "").trim();

          const ev: HomeEvent = {
            id: `sheet-${idx}-${title.replace(/\s+/g, "-")}`,
            title,
            badge,
            dateISO,
            time24,
            venue,
            posterUrl,
            meta: "",
            description,
          };
          ev.meta = formatEventMeta(ev);
          return ev;
        })
        .filter(Boolean) as HomeEvent[];

      // Important: if the sheet loads successfully but is empty, we should NOT
      // fall back to old cached localStorage events.
      setEvents(mapped.slice(0, 6));

      try {
        if (mapped.length) {
          localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(mapped.slice(0, 6)));
        } else {
          localStorage.removeItem(EVENTS_STORAGE_KEY);
        }
      } catch {
        // ignore
      }

      return;
    } catch {
      // fallback below
    }

    // 3) Fallback to last cached localStorage (offline/blocked)
    try {
      const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as HomeEvent[];
      if (Array.isArray(parsed) && parsed.length) setEvents(parsed);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadEventsFromSheet();

    // Refresh on tab focus (useful right after editing the sheet)
    const onFocus = () => loadEventsFromSheet();
    window.addEventListener("focus", onFocus);

    // Also refresh periodically
    const t = window.setInterval(loadEventsFromSheet, 60_000);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(t);
    };
  }, []);

  return (
    <main>
      <Hero />

      {/* Home-only highlight */}
      <section className="py-6">
        <div className="container mx-auto px-6">
          <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-lg px-5 py-4 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-x-8 gap-y-2">
              <div className="text-sm md:text-base font-semibold text-slate-800">
                <span className="text-slate-500">Campus:</span>{" "}
                <span className="font-extrabold text-brand-dark">Fully Air-Conditioned (AC)</span>
              </div>

              <div className="hidden md:block text-slate-300">|</div>

              <div className="text-sm md:text-base font-semibold text-slate-800">
                <span className="text-slate-500">Transport:</span>{" "}
                <span className="font-extrabold text-brand-dark">Facility Available</span>
              </div>

              {/* CBSE affiliation pill removed from this highlight row */}
            </div>

            <div className="mt-3 relative inline-flex flex-col md:flex-row items-center justify-center gap-x-4 gap-y-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400/25 via-orange-400/20 to-rose-400/25 border border-amber-200 text-slate-900 shadow-lg glossy-badge">
              {/* glossy overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/15 to-transparent" />
              {/* strong diagonal shine */}
              <div className="pointer-events-none absolute -left-16 -top-10 h-32 w-40 bg-white/55 blur-2xl rotate-12" />
              {/* subtle sparkle */}
              <div className="pointer-events-none absolute right-3 top-2 h-2 w-2 rounded-full bg-white/70 blur-[1px]" />
              <div className="pointer-events-none absolute right-6 top-4 h-1.5 w-1.5 rounded-full bg-white/60 blur-[1px]" />
              {/* animated shimmer sweep */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-[10deg] animate-[badgeShine_2.4s_ease-in-out_infinite]" />
              </div>
              <span className="relative inline-flex items-center gap-2 text-xs md:text-sm font-extrabold">
                <span className="fire-emoji" aria-hidden="true">🔥</span>
                50% Fee Refund Guarantee
              </span>
              <span className="relative text-xs md:text-sm text-slate-700">
                if your ward does not show significant improvement
                <span className="text-slate-500"> (T&amp;C apply)</span>
              </span>
            </div>

            {/* transport moved to top row */}
          </div>
        </div>
      </section>

      {/* Quick intro */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm font-bold mb-6 shine-badge">
              FUTURE SPARK INTERNATIONAL SCHOOL
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-brand-dark">
              A school that blends academics, values and modern skills
            </h2>
            <p className="mt-5 text-slate-600 text-lg md:text-xl leading-relaxed">
              Located at Kavuri Hills, Hyderabad — we focus on discipline,
              academic brilliance and all-round excellence through sports and
              co-curricular activities.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl p-6 bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg">
              <div className="font-heading font-bold text-lg text-slate-900">
                Smart Classrooms
              </div>
              <div className="mt-2 text-slate-600">
                Technology-enabled learning with digital boards and modern
                teaching.
              </div>
            </div>
            <div className="rounded-2xl p-6 bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg">
              <div className="font-heading font-bold text-lg text-slate-900">
                Safety First
              </div>
              <div className="mt-2 text-slate-600">
                Secure campus with CC cameras, medical assistance and support
                staff.
              </div>
            </div>
            <div className="rounded-2xl p-6 bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg">
              <div className="font-heading font-bold text-lg text-slate-900">
                Holistic Development
              </div>
              <div className="mt-2 text-slate-600">
                Sports, arts, clubs and activities that build confidence and
                character.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About (image + text) */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-white/60 backdrop-blur-xl shadow-xl">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={imgCampus}
                  alt="Future Spark International School"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div>
              <span className="inline-block px-4 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm font-bold mb-4">
                ABOUT THE SCHOOL
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">
                Future Spark International School
              </h2>
              <p className="mt-4 text-slate-600 text-lg leading-relaxed">
                <span className="font-semibold text-slate-800">Welcome to Future Spark International School.</span> Future Spark
                School is located in the serene residential area at Kavuri Hills, Hyderabad, the modern metropolitan city.
                The school is a co-educational institution pursuing academic brilliance and all round excellence.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                The school stands for discipline, honing the skills involved in academics, sports and co curricular
                activities. Future Spark's aim is to build citizens that India will be proud of.
              </p>

              <div className="mt-6 flex gap-4 flex-wrap">
                <Link
                  to="/about"
                  className="px-6 py-3 rounded-xl bg-brand-dark text-white font-bold hover:bg-brand-light transition"
                >
                  Read More
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-xl border border-slate-300 text-slate-800 font-bold hover:bg-slate-50 transition"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MCB phone UI mockup preview */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <span className="inline-block px-4 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm font-bold mb-4">
                MCB
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">
                My Class Board for Parents
              </h2>
              <p className="mt-4 text-slate-600 text-lg leading-relaxed">
                A parent dashboard to see your child's diary, homework, attendance, notices, and class updates — all in
                one place.
              </p>
              <ul className="mt-5 space-y-2 text-slate-700">
                <li>• Daily diary note from class teacher</li>
                <li>• Homework list with due dates</li>
                <li>• Attendance summary & notices</li>
              </ul>

              <div className="mt-6 flex gap-4 flex-wrap">
                <Link
                  to="/mcb"
                  className="px-6 py-3 rounded-xl bg-brand-dark text-white font-bold hover:bg-brand-light transition"
                >
                  Open MCB Demo
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-xl border border-slate-300 text-slate-800 font-bold hover:bg-slate-50 transition"
                >
                  Enquire
                </Link>
              </div>
            </div>

            <PhoneMockup title="MCB">
              <MCBScreen />
            </PhoneMockup>
          </div>
        </div>
      </section>

      {/* Photos / highlights */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <span className="inline-block px-4 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm font-bold mb-4">
                CAMPUS HIGHLIGHTS
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">
                Photos that tell our story
              </h2>
              <p className="mt-3 text-slate-600 max-w-2xl">
                Take a quick look at our campus, activities, and learning
                environment.
              </p>
            </div>

            <Link
              to="/gallery"
              className="px-5 py-3 rounded-xl font-bold text-white bg-brand-dark hover:bg-brand-light transition shadow-lg"
            >
              View Full Gallery
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[imgCampus, imgSports, imgCbse, imgBoards].map((src, i) => (
              <div
                key={i}
                className="group rounded-2xl overflow-hidden border border-slate-200 bg-white/60 backdrop-blur-xl shadow-xl"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={src}
                    alt={`Highlight ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <Stats />

      {/* Upcoming events slot (manual admin via localStorage; not secure) */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <span className="inline-block px-4 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm font-bold mb-4">
                UPCOMING EVENTS
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">
                What's happening at Future Spark
              </h2>
              <p className="mt-3 text-slate-600 max-w-2xl">
                School events, orientations, and celebrations.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to="/contact"
                className="px-5 py-3 rounded-xl font-bold text-white bg-brand-dark hover:bg-brand-light transition shadow-lg"
              >
                Enquire / RSVP
              </Link>

              {IS_SHEET_MODE ? (
                <div className="flex gap-3 flex-wrap">
                  <a
                    href="https://docs.google.com/spreadsheets/d/e/2PACX-1vQJPW4q4RkH7JYqBaN3CY7oNlEPWhqiHDSzZl1lSOKJVyHp9VcHwE773L-XW4R72TC8e6x9L5lWzlnB/pubhtml?gid=479958431&single=true"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-3 rounded-xl bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg text-slate-700 font-bold hover:bg-white transition"
                    title="Edit events in Google Sheet"
                  >
                    Events Sheet
                  </a>

                  <button
                    type="button"
                    onClick={loadEventsFromSheet}
                    className="px-4 py-3 rounded-xl bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg text-slate-700 font-bold hover:bg-white transition"
                    title="Refresh events"
                  >
                    Refresh
                  </button>

                  {/* Admin controls removed from Home (use Footer admin links instead) */}
                </div>
              ) : (
                <>
                  {/* Admin controls removed from Home (use Footer admin links instead) */}
                </>
              )}
            </div>
          </div>

          <div className="mt-8">
            {events.length ? (
              <div className="grid md:grid-cols-3 gap-6">
                {events.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-2xl p-6 bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg"
                  >
                    {ev.posterUrl?.trim() ? (
                      <div className="-mt-1 mb-4 rounded-2xl overflow-hidden border border-slate-200 bg-white">
                        <img
                          src={normalizeDriveImageUrl(ev.posterUrl)}
                          alt={`${ev.title} poster`}
                          className="block w-full h-auto"
                          loading="lazy"
                        />
                      </div>
                    ) : null}

                    <div className="flex items-start justify-between gap-4">
                      <div className="text-xs font-bold text-brand-light">{ev.badge || ""}</div>
                      {/* Admin delete removed from Home (use Footer admin links instead) */}
                    </div>

                    <div className="mt-2 font-heading font-bold text-lg text-slate-900">{ev.title}</div>
                    <div className="mt-2 text-slate-600 text-sm">{formatEventMeta(ev) || ""}</div>
                    {ev.description ? <div className="mt-4 text-slate-600">{ev.description}</div> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl p-6 bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg text-slate-700">
                <div className="font-heading font-bold text-lg text-slate-900">No upcoming events</div>
                <div className="mt-2 text-slate-600">Update the Events Google Sheet and click Refresh.</div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Programs */}
      <Programs />

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="rounded-[2rem] p-10 bg-gradient-to-r from-brand-dark to-brand-light text-white shadow-2xl">
            <div className="max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold">
                Ready for 2026 Admissions?
              </h2>
              <p className="mt-3 text-white/90 text-lg">
                Enquire now and apply for admission into the new academic year.
              </p>
              <div className="mt-6 flex gap-4 flex-wrap">
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-xl bg-white text-brand-dark font-bold hover:opacity-90 transition"
                >
                  Apply Now
                </Link>
                <Link
                  to="/gallery"
                  className="px-6 py-3 rounded-xl border border-white/40 text-white font-bold hover:bg-white/10 transition"
                >
                  See Campus Photos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map (small block) */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <MapBlock title="Our Location" heightClassName="h-[260px]" />
        </div>
      </section>
    </main>
  );
};

export default Home;
