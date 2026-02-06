import React, { useMemo, useState } from "react";
import { submitEnquiry } from "../services/enquiryApi";
import { COUNTRY_CODES } from "../constants";

type FormState = {
  fullName: string;
  countryCode: string;
  phone: string; // 10-digit (numbers only)
  email: string;
  positions: string[];
  experience: string;
  qualification: string;
  qualificationOther: string;
  resumeFile: File | null;
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

const CareerForm: React.FC = () => {
  const [state, setState] = useState<FormState>({
    fullName: "",
    countryCode: "+91",
    phone: "",
    email: "",
    positions: [],
    experience: "",
    qualification: "",
    qualificationOther: "",
    resumeFile: null,
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
    if (!state.fullName.trim()) return "Please enter your full name.";

    const submissionKey = `careers:${normalizeName(state.fullName)}:${state.countryCode}${state.phone}`;
    if (wasSubmitted(submissionKey)) return "Already submitted.";

    if (!state.phone.trim()) return "Please enter phone number.";

    // Phone is stored as digits-only (max 10) from onChange.
    if (state.phone.length !== 10) return "Please enter a valid phone number (10 digits).";

    // Indian mobile validation when +91 is selected.
    if (state.countryCode === "+91" && !/^[6-9]\d{9}$/.test(state.phone)) {
      return "Please enter a valid phone number.";
    }

    if (!state.positions.length) return "Please select at least one job role.";

    if (!state.experience.trim()) return "Please select experience.";

    if (!state.qualification.trim()) return "Please select qualification.";
    if (state.qualification === "Other" && !state.qualificationOther.trim()) return "Please enter qualification.";

    if (state.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
      return "Please enter a valid email address.";
    }

    // Resume upload limits (keep small to avoid Apps Script limits / slow networks)
    if (state.resumeFile) {
      const maxMb = 5;
      if (state.resumeFile.size > maxMb * 1024 * 1024) {
        return `Resume file is too large. Please upload under ${maxMb}MB.`;
      }
      const okTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (state.resumeFile.type && !okTypes.includes(state.resumeFile.type)) {
        return "Please upload resume as PDF or Word document.";
      }
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

      const qualText =
        state.qualification === "Other"
          ? state.qualificationOther.trim()
          : state.qualification.trim();

      const details = [
        `Roles: ${state.positions.join(", ")}`,
        state.experience.trim() ? `Experience: ${state.experience.trim()}` : null,
        qualText ? `Qualification: ${qualText}` : null,
        state.message.trim() ? `Message: ${state.message.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const resumeDataUrl: string | undefined = state.resumeFile
        ? await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Failed to read resume file."));
            reader.onload = () => resolve(String(reader.result || ""));
            reader.readAsDataURL(state.resumeFile as File);
          })
        : undefined;

      const submissionKey = `careers:${normalizeName(state.fullName)}:${state.countryCode}${state.phone}`;
      if (wasSubmitted(submissionKey)) {
        setStatus("error");
        setStatusMsg("Already submitted.");
        return;
      }

      await submitEnquiry({
        formType: "careers",
        parentName: state.fullName.trim(),
        position: state.positions.join(", "),
        experience: state.experience.trim(),
        qualification: (state.qualification === "Other" ? state.qualificationOther : state.qualification).trim(),
        phone: `${state.countryCode}${state.phone}`,
        email: state.email.trim(),
        message: details ? details : "[CAREERS]",
        // Option B: send resume as base64 data URL
        resumeDataUrl,
        resumeFileName: state.resumeFile?.name,
        source: "website",
        pageUrl: window.location.href,
      } as any);

      markSubmitted(submissionKey);
      setStatus("success");
      setStatusMsg("Thanks! Your application has been submitted. We will contact you soon.");
      setState({
        fullName: "",
        countryCode: "+91",
        phone: "",
        email: "",
        positions: [],
        experience: "",
        qualification: "",
        qualificationOther: "",
        resumeFile: null,
        message: "",
      });
    } catch (e: any) {
      setStatus("error");
      setStatusMsg(String(e?.message || "Failed to submit application."));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <label className="text-sm font-bold text-slate-700">
          Full Name*
          <input
            value={state.fullName}
            onChange={(e) => setState((s) => ({ ...s, fullName: toTitleCase(e.target.value) }))}
            className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-light"
            placeholder="Your name"
            required
          />
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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="text-sm font-bold text-slate-700">
          Job Roles*
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Pre-Primary Teacher",
              "Primary Teacher",
              "TGT Teacher",
              "PGT Teacher",
              "English Teacher (High School)",
              "Special Educator",
              "Physical Education (PET)",
              "Art / Craft Teacher",
              "Music / Dance Teacher",
              "Admin / Office",
              "Other",
            ].map((role) => {
              const checked = state.positions.includes(role);
              return (
                <label
                  key={role}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 bg-slate-50 ring-1 ring-slate-200/70 cursor-pointer select-none ${
                    checked ? "ring-brand-light/70" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...state.positions, role]
                        : state.positions.filter((r) => r !== role);
                      setState((s) => ({ ...s, positions: next }));
                    }}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-semibold text-slate-700">{role}</span>
                </label>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            You can select multiple roles.
          </div>
        </div>

        <label className="text-sm font-bold text-slate-700">
          Experience*
          <select
            value={state.experience}
            onChange={(e) => setState((s) => ({ ...s, experience: e.target.value }))}
            className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-light"
            required
          >
            <option value="">Select</option>
            <option value="1 Year">1 Year</option>
            <option value="2 Years">2 Years</option>
            <option value="3 Years">3 Years</option>
            <option value="4 Years">4 Years</option>
            <option value="5 Years">5 Years</option>
            <option value="6+ Years">6+ Years</option>
          </select>
        </label>
      </div>

      <label className="text-sm font-bold text-slate-700">
        Qualification*
        <select
          value={state.qualification}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              qualification: e.target.value,
              qualificationOther: e.target.value === "Other" ? s.qualificationOther : "",
            }))
          }
          className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-light"
          required
        >
          <option value="">Select</option>
          <option value="D.Ed">D.Ed</option>
          <option value="B.Ed">B.Ed</option>
          <option value="M.Ed">M.Ed</option>
          <option value="BA">BA</option>
          <option value="BSc">BSc</option>
          <option value="BCom">BCom</option>
          <option value="MA">MA</option>
          <option value="MSc">MSc</option>
          <option value="MCom">MCom</option>
          <option value="PhD">PhD</option>
          <option value="Other">Other</option>
        </select>

        {state.qualification === "Other" ? (
          <input
            value={state.qualificationOther}
            onChange={(e) => setState((s) => ({ ...s, qualificationOther: e.target.value }))}
            className="mt-2 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-light"
            placeholder="Enter your qualification"
            required
          />
        ) : null}
      </label>

      <label className="text-sm font-bold text-slate-700">
        Resume (PDF/DOC/DOCX, max 5MB)
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setState((s) => ({ ...s, resumeFile: e.target.files?.[0] || null }))}
          className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-light"
        />
      </label>

      <label className="text-sm font-bold text-slate-700">
        Message (optional)
        <textarea
          value={state.message}
          onChange={(e) => setState((s) => ({ ...s, message: e.target.value }))}
          className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 min-h-[120px] outline-none focus:ring-2 focus:ring-brand-light"
          placeholder="Tell us about yourself, subject, achievements, notice period, etc."
        />
      </label>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-xs text-slate-500">
          Tip: You can also WhatsApp your resume to <strong>+91-8977653606</strong>
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
          {status === "submitting" ? "Submitting..." : "Submit Application"}
        </button>
      </div>

      {status === "success" ? (
        <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          {statusMsg}
        </div>
      ) : null}

      {status === "error" && statusMsg ? (
        <div className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-3">{statusMsg}</div>
      ) : null}
    </form>
  );
};

export default CareerForm;
