import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_TOKEN_STORAGE_KEY = "future_spark_admin_token_v1";
const EVENTS_ENDPOINT = (import.meta as any).env?.VITE_EVENTS_ENDPOINT as string | undefined;
// NOTE: We do NOT use VITE_EVENTS_TOKEN for client-side auth.
// Admin login is based on the token stored in localStorage.

function withQuery(url: string, params: Record<string, string>) {
  const u = new URL(url);
  Object.entries(params).forEach(([k, v]) => {
    if (v && v.trim()) u.searchParams.set(k, v.trim());
  });
  return u.toString();
}

function getStoredToken() {
  try {
    return (localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "").trim();
  } catch {
    return "";
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

function formatEventMeta(ev: { dateISO?: string; time24?: string; venue?: string }) {
  // Keep this lightweight; Home has a more full-featured formatter.
  const parts: string[] = [];
  if (ev.dateISO?.trim()) parts.push(ev.dateISO.trim());
  if (ev.time24?.trim()) parts.push(ev.time24.trim());
  if (ev.venue?.trim()) parts.push(ev.venue.trim());
  return parts.join(" • ");
}

type Draft = {
  badge: string;
  title: string;
  dateISO: string;
  time24: string;
  venue: string;
  description: string;
};

type EventItem = Draft & {
  sheetRow: number;
};

const EventsAdd: React.FC = () => {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [deletingRow, setDeletingRow] = useState<number | null>(null);

  const logout = () => {
    try {
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
    setToken("");
    nav("/events-admin?next=add-event-page", { replace: true });
  };

  const [draft, setDraft] = useState<Draft>({
    badge: "",
    title: "",
    dateISO: "",
    time24: "",
    venue: "",
    description: "",
  });

  const [token, setToken] = useState(() => getStoredToken());

  useEffect(() => {
    const sync = () => setToken(getStoredToken());
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // Route protection: require login to view this page
  useEffect(() => {
    if (!token) {
      nav("/events-admin?next=add-event-page", { replace: true });
    }
  }, [token, nav]);

  const loadEvents = async () => {
    if (!token || !EVENTS_ENDPOINT) return;
    setLoadingEvents(true);
    try {
      const url = withQuery(
        `${EVENTS_ENDPOINT}${EVENTS_ENDPOINT.includes("?") ? "&" : "?"}_ts=${Date.now()}`,
        { token },
      );
      const res = await fetch(url, { cache: "no-store" });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j || j.ok !== true || !Array.isArray(j.events)) return;

      const mapped: EventItem[] = j.events
        .map((e: any) => ({
          sheetRow: Number(e.sheetRow || 0),
          title: String(e.title || ""),
          dateISO: String(e.dateISO || ""),
          time24: String(e.time24 || ""),
          venue: String(e.venue || ""),
          badge: String(e.badge || ""),
          description: String(e.description || ""),
        }))
        .filter((e: any) => Number.isFinite(e.sheetRow) && e.sheetRow >= 2 && e.title.trim());

      setEvents(mapped);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [token]);

  const save = async () => {
    setErr(null);
    setOkMsg(null);

    if (!token) {
      nav("/events-admin?next=add-event-page");
      return;
    }

    if (!draft.title.trim()) {
      setErr("Please add a Title.");
      return;
    }
    if (!draft.dateISO.trim() || !draft.time24.trim() || !draft.venue.trim()) {
      setErr("Please add Date, Time and Venue.");
      return;
    }

    if (!EVENTS_ENDPOINT) {
      setErr("Events endpoint not configured. Ask developer to set VITE_EVENTS_ENDPOINT.");
      return;
    }

    setBusy(true);
    try {
      const base = getEventsEndpointBase(EVENTS_ENDPOINT);
      const postUrl = withQuery(base, token ? { token } : {});

      const res = await fetch(postUrl, {
        method: "POST",
        headers: {
          // Avoid CORS preflight by using a simple content-type
          "content-type": "text/plain;charset=UTF-8",
        },
        body: JSON.stringify({
          formType: "events",
          action: editingRow ? "update" : "",
          sheetRow: editingRow || undefined,
          title: draft.title.trim(),
          dateISO: draft.dateISO.trim(),
          time24: draft.time24.trim(),
          venue: draft.venue.trim(),
          badge: draft.badge.trim(),
          description: draft.description.trim(),
        }),
      });

      const j = await res.json().catch(() => null);
      if (!res.ok || !j || j.ok !== true) throw new Error("Failed");

      setOkMsg(editingRow ? "Updated event successfully." : "Added event successfully.");
      setEditingRow(null);
      setDraft({ badge: "", title: "", dateISO: "", time24: "", venue: "", description: "" });
      await loadEvents();
    } catch {
      setErr("Could not save event (check admin token / Apps Script / internet).");
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
          EVENTS ADMIN
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-brand-dark">Add Event</h1>
        <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">Add a new event for everyone.</p>

        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? nav(-1) : nav("/"))}
            className="px-5 py-3 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            Back
          </button>
          {token ? (
            <button
              type="button"
              onClick={logout}
              className="px-5 py-3 rounded-xl font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>

      <div className="max-w-lg mx-auto rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl p-6">
        <div className="grid gap-3">
          <label className="text-sm font-bold text-slate-700">
            Badge (optional)
            <input
              value={draft.badge}
              onChange={(e) => setDraft((d) => ({ ...d, badge: e.target.value }))}
              className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2"
              placeholder="e.g., Feb 2026"
            />
          </label>

          <label className="text-sm font-bold text-slate-700">
            Title*
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2"
              placeholder="e.g., Parent Orientation"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm font-bold text-slate-700">
              Date*
              <input
                type="date"
                value={draft.dateISO}
                onChange={(e) => setDraft((d) => ({ ...d, dateISO: e.target.value }))}
                className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Time*
              <input
                type="time"
                value={draft.time24}
                onChange={(e) => setDraft((d) => ({ ...d, time24: e.target.value }))}
                className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2"
              />
            </label>
          </div>

          <label className="text-sm font-bold text-slate-700">
            Venue*
            <input
              value={draft.venue}
              onChange={(e) => setDraft((d) => ({ ...d, venue: e.target.value }))}
              className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2"
              placeholder="e.g., School Auditorium"
            />
          </label>

          <div className="text-xs text-slate-500">
            Preview: <span className="font-semibold">{formatEventMeta(draft) || ""}</span>
          </div>

          <label className="text-sm font-bold text-slate-700">
            Description
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 min-h-[90px]"
              placeholder="1–2 lines about the event"
            />
          </label>

          {err ? <div className="mt-2 text-sm font-bold text-rose-700">{err}</div> : null}
          {okMsg ? <div className="mt-2 text-sm font-bold text-emerald-700">{okMsg}</div> : null}

          <div className="mt-2 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => nav("/")}
              disabled={busy}
              className="px-5 py-3 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="px-5 py-3 rounded-xl font-bold text-white bg-brand-dark hover:bg-brand-light disabled:opacity-60 transition"
            >
              {busy ? "Saving..." : editingRow ? "Update Event" : "Save Event"}
            </button>
          </div>

          {editingRow ? (
            <div className="mt-3 text-xs text-slate-500">
              Editing existing event (Sheet row #{editingRow}).{" "}
              <button
                type="button"
                className="underline font-bold"
                onClick={() => {
                  setEditingRow(null);
                  setDraft({ badge: "", title: "", dateISO: "", time24: "", venue: "", description: "" });
                }}
              >
                Cancel edit
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-lg font-extrabold text-brand-dark">Manage events</div>
          <button
            type="button"
            onClick={loadEvents}
            disabled={loadingEvents}
            className="px-4 py-2 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 transition"
          >
            {loadingEvents ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {events.length ? (
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div key={ev.sheetRow} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-brand-light">Row #{ev.sheetRow}</div>
                    <div className="mt-1 font-extrabold text-slate-900">{ev.title}</div>
                    <div className="mt-1 text-sm text-slate-600">{formatEventMeta(ev) || ""}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOkMsg(null);
                        setErr(null);
                        setEditingRow(ev.sheetRow);
                        setDraft({
                          badge: ev.badge || "",
                          title: ev.title || "",
                          dateISO: ev.dateISO || "",
                          time24: ev.time24 || "",
                          venue: ev.venue || "",
                          description: ev.description || "",
                        });
                      }}
                      className="px-3 py-2 rounded-xl font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingRow === ev.sheetRow}
                      onClick={async () => {
                        if (!EVENTS_ENDPOINT) return;
                        const ok = window.confirm(`Delete event "${ev.title}"?`);
                        if (!ok) return;

                        setDeletingRow(ev.sheetRow);
                        setErr(null);
                        setOkMsg(null);
                        try {
                          const base = getEventsEndpointBase(EVENTS_ENDPOINT);
                          const postUrl = withQuery(base, token ? { token } : {});
                          const res = await fetch(postUrl, {
                            method: "POST",
                            headers: {
                              "content-type": "text/plain;charset=UTF-8",
                            },
                            body: JSON.stringify({
                              formType: "events",
                              action: "delete",
                              sheetRow: ev.sheetRow,
                            }),
                          });
                          const j = await res.json().catch(() => null);
                          if (!res.ok || !j || j.ok !== true) throw new Error(j?.error || "Failed");
                          setOkMsg("Deleted event.");
                          await loadEvents();
                        } catch {
                          setErr("Could not delete event.");
                        } finally {
                          setDeletingRow(null);
                        }
                      }}
                      className="px-3 py-2 rounded-xl font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition disabled:opacity-60"
                    >
                      {deletingRow === ev.sheetRow ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                {ev.description ? <div className="mt-3 text-sm text-slate-700">{ev.description}</div> : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 text-sm text-slate-600">No events found.</div>
        )}
      </div>
    </section>
  );
};

export default EventsAdd;
