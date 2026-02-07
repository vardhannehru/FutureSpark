import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ADMIN_TOKEN_STORAGE_KEY = "future_spark_admin_token_v1";

const EVENTS_ENDPOINT = (import.meta as any).env?.VITE_EVENTS_ENDPOINT as string | undefined;

function withQuery(url: string, params: Record<string, string>) {
  const u = new URL(url);
  Object.entries(params).forEach(([k, v]) => {
    if (v && v.trim()) u.searchParams.set(k, v.trim());
  });
  return u.toString();
}

function ensureEventsType(url: string) {
  // VITE_EVENTS_ENDPOINT can be either:
  // - .../exec?type=events (recommended), OR
  // - .../exec (we will add type=events automatically for GETs)
  try {
    const u = new URL(url);
    if (!u.searchParams.get("type")) u.searchParams.set("type", "events");
    return u.toString();
  } catch {
    return url;
  }
}

function getStoredToken() {
  try {
    return (localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

function setStoredToken(token: string) {
  try {
    const t = (token || "").trim();
    if (t) localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, t);
    else localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

const EventsAdmin: React.FC = () => {
  const nav = useNavigate();
  const loc = useLocation();

  const nextUrl = useMemo(() => {
    const sp = new URLSearchParams(loc.search);
    const next = (sp.get("next") || "").trim();
    if (next === "add-event-page") return "/events-admin/add";
    if (next === "gallery-admin") return "/gallery-admin";
    return "/";
  }, [loc.search]);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const existing = useMemo(() => getStoredToken(), []);

  const login = async () => {
    setErr(null);

    const token = pw.trim();
    if (!token) {
      setErr("Please enter the admin password.");
      return;
    }

    if (!EVENTS_ENDPOINT) {
      setErr("Events endpoint not configured. Ask developer to set VITE_EVENTS_ENDPOINT.");
      return;
    }

    setBusy(true);
    try {
      // Try to validate token against the Events endpoint.
      // If the browser blocks the request (CORS/network), still allow login so admin can proceed.
      const baseGetUrl = ensureEventsType(EVENTS_ENDPOINT);
      const url = withQuery(
        `${baseGetUrl}${baseGetUrl.includes("?") ? "&" : "?"}_ts=${Date.now()}`,
        { token },
      );

      try {
        const res = await fetch(url, { cache: "no-store" });
        const j = await res.json().catch(() => null);

        if (!res.ok || !j || j.ok !== true) {
          setErr("Wrong password.");
          return;
        }
      } catch {
        // Best-effort: proceed without validation.
      }

      setStoredToken(token);
      nav(nextUrl);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    setStoredToken("");
    // Go back to where user came from (fallback to home)
    if (window.history.length > 1) nav(-1);
    else nav("/");
  };

  return (
    <section className="container mx-auto px-6">
      <div className="text-center mb-10">
        <span className="inline-block px-4 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm font-bold mb-6 tracking-widest">
          EVENTS ADMIN
        </span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-brand-dark">Admin Login</h1>
        <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">
          Login to add and delete events for everyone.
        </p>
      </div>

      <div className="max-w-md mx-auto rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl p-6">
        {existing ? (
          <div className="mb-4 text-sm text-slate-700">
            You are currently logged in on this device.
          </div>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy) login();
          }}
        >
          <div className="text-sm font-bold text-slate-800">Enter admin password</div>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="mt-3 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3"
            placeholder="Password"
            autoFocus
          />

          {err ? <div className="mt-3 text-sm font-bold text-rose-700">{err}</div> : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-4 w-full px-5 py-3 rounded-xl font-bold text-white bg-brand-dark hover:bg-brand-light disabled:opacity-60 transition"
          >
            {busy ? "Checking..." : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => nav("/")}
          className="mt-3 w-full px-5 py-3 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
        >
          Back to Home
        </button>

        {existing ? (
          <button
            type="button"
            onClick={logout}
            className="mt-3 w-full px-5 py-3 rounded-xl font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition"
          >
            Logout
          </button>
        ) : null}
      </div>
    </section>
  );
};

export default EventsAdmin;
