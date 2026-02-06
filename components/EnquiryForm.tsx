import React, { useMemo, useState } from "react";
import { submitEnquiry } from "../services/enquiryApi";
import { COUNTRY_CODES } from "../constants";

type FormState = {
  parentName: string;
  studentName: string;
  classInterested: string;
  countryCode: string;
  phone: string; // 10-digit (numbers only)
  email: string;
  message: string;
};

const toTitleCase = (value: string) =>
  value.replace(/\b([A-Za-z])/g, (m) => m.toUpperCase());

const normalizeName = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();
const SUBMITTED_KEY = "future_spark_submissions_v1";

const wasSubmitted = (key: string) => {
  try {
    const raw = localStorage.getItem(SUBMITTED_KEY);
    if (!raw) return false;
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) && arr.includes(key);
  } catch {
    return false;
  }
};

const markSubmitted = (key: string) => {
  try {
    const raw = localStorage.getItem(SUBMITTED_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    const next = Array.isArray(arr) ? Array.from(new Set([...arr, key])) : [key];
    localStorage.setItem(SUBMITTED_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
};

const EnquiryForm: React.FC = () => {
  const [state, setState] = useState<FormState>({
    parentName: "",
    studentName: "",
    classInterested: "",
    countryCode: "+91",
    phone: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState<string>("");

  const [ccOpen, setCcOpen] = useState(false);
  const selectedCC = useMemo(
    () => COUNTRY_CODES.find((c) => c.code === state.countryCode) || COUNTRY_CODES[0],
    [state.countryCode],
  );

  const validate = () => {
    if (!state.parentName.trim()) return "Please enter parent/guardian name.";

    const submissionKey = `enquiry:${normalizeName(state.parentName)}:${state.countryCode}${state.phone}`;
    if (wasSubmitted(submissionKey)) return "Already submitted.";

    if (!state.phone.trim()) return "Please enter phone number.";

    // Phone is stored as digits-only (max 10) from onChange.
    if (state.phone.length !== 10) return "Please enter a valid phone number (10 digits).";

    // Indian mobile validation when +91 is selected.
    if (state.countryCode === "+91" && !/^[6-9]\d{9}$/.test(state.phone)) {
      return "Please enter a valid phone number.";
    }

    if (state.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
      return "Please enter a valid email address.";
    }
    return null;
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setStatus("error");
      setStatusMsg(err);
      return;
    }

    try {
      setStatus("submitting");
      setStatusMsg("");

      const submissionKey = `enquiry:${normalizeName(state.parentName)}:${state.countryCode}${state.phone}`;
      if (wasSubmitted(submissionKey)) {
        setStatus("error");
        setStatusMsg("Already submitted.");
        return;
      }

      await submitEnquiry({
        parentName: state.parentName.trim(),
        studentName: state.studentName.trim(),
        classInterested: state.classInterested.trim(),
        phone: `${state.countryCode}${state.phone}`,
        email: state.email.trim(),
        message: state.message.trim(),
        source: "website",
        pageUrl: window.location.href,
      });

      markSubmitted(submissionKey);
      setStatus("success");
      setStatusMsg("Thanks! Your enquiry has been submitted.");
      setState({ parentName: "", studentName: "", classInterested: "", countryCode: "+91", phone: "", email: "", message: "" });
    } catch (e: any) {
      setStatus("error");
      setStatusMsg(String(e?.message || "Failed to submit enquiry."));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <label className="text-sm font-bold text-slate-700">
          Parent / Guardian Name*
          <input
            value={state.parentName}
            onChange={(e) => setState((s) => ({ ...s, parentName: toTitleCase(e.target.value) }))}
            className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-light"
            placeholder="Your name"
            required
          />
        </label>

        <label className="text-sm font-bold text-slate-700">
          Student Name
          <input
            value={state.studentName}
            onChange={(e) => setState((s) => ({ ...s, studentName: toTitleCase(e.target.value) }))}
            className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-light"
            placeholder="Child name"
          />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="text-sm font-bold text-slate-700">
          Class Interested
          <select
            value={state.classInterested}
            onChange={(e) => setState((s) => ({ ...s, classInterested: e.target.value }))}
            className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-light"
          >
            <option value="">Select class</option>
            <option value="Playgroup">Playgroup</option>
            <option value="Nursery">Nursery</option>
            <option value="Pre-Primary 1">Pre-Primary 1</option>
            <option value="Pre-Primary 2">Pre-Primary 2</option>
            <option value="Class 1">Class 1</option>
            <option value="Class 2">Class 2</option>
            <option value="Class 3">Class 3</option>
            <option value="Class 4">Class 4</option>
            <option value="Class 5">Class 5</option>
            <option value="Class 6">Class 6</option>
            <option value="Class 7">Class 7</option>
            <option value="Class 8">Class 8</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 10">Class 10</option>
          </select>
        </label>

        <label className="text-sm font-bold text-slate-700">
          Phone*
          <div className="mt-1 flex gap-3">
            <div
              className="relative w-[92px]"
              tabIndex={0}
              onBlur={() => setCcOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCcOpen((v) => !v)}
                className="w-full rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200/70 px-3 py-3 outline-none focus:ring-2 focus:ring-brand-light text-left"
                aria-label="Country code"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="text-base leading-none">{selectedCC?.flag}</span>
                  <span className="text-sm font-bold text-slate-700">{state.countryCode}</span>
                </span>
              </button>

              {ccOpen ? (
                <div className="absolute left-0 top-full mt-2 z-50 w-[220px] max-h-64 overflow-auto rounded-2xl bg-white shadow-2xl border border-slate-200 p-1">
                  {COUNTRY_CODES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setState((s) => ({ ...s, countryCode: c.code }));
                        setCcOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-50 transition ${
                        c.code === state.countryCode ? "bg-slate-50" : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="text-sm font-semibold text-slate-700">{c.code}</span>
                        <span className="text-xs text-slate-500">{c.label}</span>
                      </span>
                      {c.code === state.countryCode ? (
                        <span className="text-xs font-bold text-brand-light">Selected</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <input
              value={state.phone}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                setState((s) => ({ ...s, phone: digitsOnly }));
              }}
              className="flex-1 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200/70 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-light"
              placeholder={state.countryCode === "+91" ? "10-digit Indian mobile" : "10-digit number"}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              required
            />
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">
            We will contact you on {state.countryCode} {state.phone || "XXXXXXXXXX"}
          </div>
        </label>
      </div>

      <label className="text-sm font-bold text-slate-700">
        Email (optional)
        <input
          value={state.email}
          onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
          className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-light"
          placeholder="you@example.com"
          inputMode="email"
        />
      </label>

      <label className="text-sm font-bold text-slate-700">
        Message
        <textarea
          value={state.message}
          onChange={(e) => setState((s) => ({ ...s, message: e.target.value }))}
          className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 min-h-[120px] outline-none focus:ring-2 focus:ring-brand-light"
          placeholder="Any questions (transport, timings, admissions)…"
        />
      </label>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-xs text-slate-500">
          Your enquiry will be saved to our Google Sheet
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className={`px-6 py-3 rounded-xl font-bold transition ${
            status === "submitting"
              ? "bg-slate-300 text-slate-600 cursor-not-allowed"
              : "bg-brand-dark text-white hover:bg-brand-light"
          }`}
        >
          {status === "submitting" ? "Submitting..." : "Submit Enquiry"}
        </button>
      </div>

      {status === "success" ? (
        <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          {statusMsg}
        </div>
      ) : null}

      {status === "error" && statusMsg ? (
        <div className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-3">
          {statusMsg}
        </div>
      ) : null}
    </form>
  );
};

export default EnquiryForm;
