import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
  // Back-compat (older storage)
  meta?: string; // e.g., "10 Feb • 10:00 AM • Auditorium"
  description: string;

  // For admin delete: absolute row number in the Google Sheet (1-based)
  sheetRow?: number;
};

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
// Optional:
//   VITE_EVENTS_TOKEN="<same token as in Apps Script>"
const EVENTS_ENDPOINT = (import.meta as any).env?.VITE_EVENTS_ENDPOINT as string | undefined;
const EVENTS_TOKEN = (import.meta as any).env?.VITE_EVENTS_TOKEN as string | undefined;

const ADMIN_TOKEN_STORAGE_KEY = "future_spark_admin_token_v1";

function getAdminToken() {
  try {
    return (localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

function setAdminToken(token: string) {
  try {
    const t = (token || "").trim();
    if (t) localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, t);
    else localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function getEventsEndpointBase(url: string) {
  // If user configured VITE_EVENTS_ENDPOINT with ?type=events, strip query for POST writes.
  try {
    const u = new URL(url);
    u.searchParams.delete("type");
    u.searchParams.delete("_ts");
    return u.toString();
  } catch {
    return url;
  }
}

function withQuery(url: string, params: Record<string, string>) {
  const u = new URL(url);
  Object.entries(params).forEach(([k, v]) => {
    if (v && v.trim()) u.searchParams.set(k, v.trim());
  });
  return u.toString();
}

const IS_SHEET_MODE = false;

const Home: React.FC = () => {
  const nav = useNavigate();
  const loc = useLocation();
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
  const [isAdmin, setIsAdmin] = useState(() => !!getAdminToken());

  // Keep admin state in sync (e.g., after logging in on /events-admin)
  useEffect(() => {
    setIsAdmin(!!getAdminToken());
  }, [loc.pathname, loc.search]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<HomeEvent | null>(null);
  const [draft, setDraft] = useState<Omit<HomeEvent, "id">>({
    badge: "",
    title: "",
    dateISO: "",
    time24: "",
    venue: "",
    meta: "",
    description: "",
  });

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
        const token = getAdminToken() || EVENTS_TOKEN || "";
        const url = withQuery(
          `${EVENTS_ENDPOINT}${EVENTS_ENDPOINT.includes("?") ? "&" : "?"}_ts=${Date.now()}`,
          token ? { token } : {},
        );
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { ok?: boolean; events?: any[] };
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
            const sheetRowRaw = (r.sheetRow ?? r.rowNumber ?? r.row ?? "") as any;
            const sheetRow = Number(sheetRowRaw);

            const ev: HomeEvent = {
              id: `sheet-${idx}-${title.replace(/\s+/g, "-")}`,
              title,
              badge,
              dateISO,
              time24,
              venue,
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

          const ev: HomeEvent = {
            id: `sheet-${idx}-${title.replace(/\s+/g, "-")}`,
            title,
            badge,
            dateISO,
            time24,
            venue,
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

  const saveEvents = (next: HomeEvent[]) => {
    // In Sheet mode we don't write back from the website.
    // You edit the Google Sheet to update events for all devices.
    setEvents(next);
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const unlockAdmin = async () => {
    // Route to a proper login page, then redirect back to add-event page.
    nav("/events-admin?next=add-event-page");
  };

  const logoutAdmin = () => {
    setAdminToken("");
    setIsAdmin(false);
  };

  const openAddEvent = () => {
    if (!isAdmin) {
      unlockAdmin();
      return;
    }

    // Move add-event to its own page (no popup/modal)
    nav("/events-admin/add");
  };

  // (Previously: auto-open Add Event modal via ?addEvent=1)

  const addEvent = () => {
    if (isSavingEvent) return;

    if (!draft.title.trim()) {
      window.alert("Please add a Title.");
      return;
    }
    if (!draft.dateISO?.trim() || !draft.time24?.trim() || !draft.venue?.trim()) {
      window.alert("Please add Date, Time and Venue.");
      return;
    }

    const newEvent: HomeEvent = {
      id: String(Date.now()),
      badge: draft.badge?.trim() || "",
      title: draft.title.trim(),
      dateISO: draft.dateISO?.trim() || "",
      time24: draft.time24?.trim() || "",
      venue: draft.venue?.trim() || "",
      // keep meta for readability/back-compat
      meta: "",
      description: draft.description.trim() || "",
    };

    // Compute & store a meta string for older UI/back-compat
    newEvent.meta = formatEventMeta(newEvent);

    // If Apps Script endpoint is configured, write to Google Sheet so it updates everywhere.
    if (EVENTS_ENDPOINT) {
      const token = getAdminToken() || EVENTS_TOKEN || "";
      const base = getEventsEndpointBase(EVENTS_ENDPOINT);

      const postUrl = withQuery(base, token ? { token } : {});
      setIsSavingEvent(true);

      fetch(postUrl, {
        method: "POST",
        // Avoid CORS preflight by using a simple content-type
        headers: {
          "content-type": "text/plain;charset=UTF-8",
        },
        body: JSON.stringify({
          formType: "events",
          title: newEvent.title,
          dateISO: newEvent.dateISO,
          time24: newEvent.time24,
          venue: newEvent.venue,
          badge: newEvent.badge,
          description: newEvent.description,
        }),
      })
        .then(async (r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const j = await r.json();
          if (!j || j.ok !== true) throw new Error("Failed to save event");
          setIsEventModalOpen(false);
          loadEventsFromSheet();
        })
        .catch(() => {
          window.alert(
            "Could not save to Google Sheet (check admin token / Apps Script). Falling back to local-only save.",
          );
          const next: HomeEvent[] = [newEvent, ...events].slice(0, 6);
          saveEvents(next);
          setIsEventModalOpen(false);
        })
        .finally(() => {
          setIsSavingEvent(false);
        });

      return;
    }

    const next: HomeEvent[] = [newEvent, ...events].slice(0, 6); // keep max 6 events
    saveEvents(next);
    setIsEventModalOpen(false);
  };

  const performDeleteEverywhere = (ev: HomeEvent) => {
    if (!EVENTS_ENDPOINT || !ev?.sheetRow || !isAdmin) return;
    if (deletingEventId) return;

    const token = getAdminToken() || EVENTS_TOKEN || "";
    const base = getEventsEndpointBase(EVENTS_ENDPOINT);
    const postUrl = withQuery(base, token ? { token } : {});

    setDeletingEventId(ev.id);

    fetch(postUrl, {
      method: "POST",
      headers: {
        "content-type": "text/plain;charset=UTF-8",
      },
      body: JSON.stringify({
        formType: "events",
        action: "delete",
        sheetRow: ev.sheetRow,
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (!j || j.ok !== true) throw new Error("Failed to delete event");
        loadEventsFromSheet();
      })
      .catch(() => {
        window.alert(
          "Could not delete from Google Sheet (check admin token / Apps Script). Falling back to local-only delete.",
        );
        const next = events.filter((e) => e.id !== ev.id);
        saveEvents(next.length ? next : defaultEvents);
      })
      .finally(() => {
        setDeletingEventId(null);
      });
  };

  const deleteEvent = (id: string) => {
    const ev = events.find((e) => e.id === id);
    if (!ev) return;

    // If we can delete from Google Sheet, show custom confirm modal.
    if (EVENTS_ENDPOINT && ev.sheetRow && isAdmin) {
      setConfirmDelete(ev);
      return;
    }

    // Local-only delete (will come back if sheet sync is enabled)
    const next = events.filter((e) => e.id !== id);
    saveEvents(next.length ? next : defaultEvents);
  };

  const resetEvents = () => {
    if (!window.confirm("Reset events to defaults?")) return;
    saveEvents(defaultEvents);
  };

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

          {/* Delete confirm modal */}
          {confirmDelete && (
            <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => (deletingEventId ? null : setConfirmDelete(null))}
              />
              <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 p-6">
                <div className="text-sm font-bold text-brand-dark">Delete Event</div>
                <div className="mt-2 text-slate-700">
                  Are you sure you want to delete <span className="font-extrabold">{confirmDelete.title}</span>?
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  This will remove it from Google Sheet and it will disappear for everyone.
                </div>

                <div className="mt-5 flex gap-3 justify-end">
                  <button
                    type="button"
                    disabled={!!deletingEventId}
                    onClick={() => setConfirmDelete(null)}
                    className="px-5 py-3 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!!deletingEventId}
                    onClick={() => {
                      const ev = confirmDelete;
                      setConfirmDelete(null);
                      performDeleteEverywhere(ev);
                    }}
                    className="px-5 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 transition"
                  >
                    {deletingEventId ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal */}
          {isEventModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setIsEventModalOpen(false)}
              />

              <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-brand-dark">
                      Add Event
                    </div>
                    <div className="text-xs text-slate-500">
                      Saved in this browser (localStorage).
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-5 grid gap-3">
                  <label className="text-sm font-bold text-slate-700">
                    Badge (optional)
                    <input
                      value={draft.badge || ""}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, badge: e.target.value }))
                      }
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2"
                      placeholder="e.g., Feb 2026"
                    />
                  </label>

                  <label className="text-sm font-bold text-slate-700">
                    Title*
                    <input
                      value={draft.title}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, title: e.target.value }))
                      }
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2"
                      placeholder="e.g., Parent Orientation"
                    />
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="text-sm font-bold text-slate-700">
                      Date*
                      <input
                        type="date"
                        value={draft.dateISO || ""}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, dateISO: e.target.value }))
                        }
                        className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2"
                      />
                    </label>

                    <label className="text-sm font-bold text-slate-700">
                      Time*
                      <input
                        type="time"
                        value={draft.time24 || ""}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, time24: e.target.value }))
                        }
                        className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2"
                      />
                    </label>
                  </div>

                  <label className="text-sm font-bold text-slate-700">
                    Venue*
                    <input
                      value={draft.venue || ""}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, venue: e.target.value }))
                      }
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2"
                      placeholder="e.g., School Auditorium"
                    />
                  </label>

                  <div className="text-xs text-slate-500">
                    Preview: <span className="font-semibold">{formatEventMeta(draft as any) || ""}</span>
                  </div>

                  <label className="text-sm font-bold text-slate-700">
                    Description
                    <textarea
                      value={draft.description}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, description: e.target.value }))
                      }
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 min-h-[90px]"
                      placeholder="1–2 lines about the event"
                    />
                  </label>

                  <div className="mt-2 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEventModalOpen(false)}
                      disabled={isSavingEvent}
                      className="px-5 py-3 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addEvent}
                      disabled={isSavingEvent}
                      className="px-5 py-3 rounded-xl font-bold text-white bg-brand-dark hover:bg-brand-light disabled:opacity-60 transition"
                    >
                      {isSavingEvent ? "Saving event..." : "Save Event"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
