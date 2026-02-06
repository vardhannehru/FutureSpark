export type EnquiryPayload = {
  parentName: string;
  studentName?: string;
  classInterested?: string;
  phone: string;
  email?: string;
  message?: string;
  source?: string;
  pageUrl?: string;
};

export async function submitEnquiry(payload: EnquiryPayload) {
  const endpoint = import.meta.env.VITE_ENQUIRY_ENDPOINT as string | undefined;
  const token = import.meta.env.VITE_ENQUIRY_TOKEN as string | undefined;

  if (!endpoint) {
    throw new Error(
      "Enquiry form is not configured. Set VITE_ENQUIRY_ENDPOINT in .env.local.",
    );
  }

  // NOTE: Browser → Google Apps Script Web App often fails due to CORS preflight.
  // Workaround: send as text/plain (simple request) and avoid custom headers.
  // Token (optional) is passed via query string.
  const url = token
    ? `${endpoint}${endpoint.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
    : endpoint;

  const res = await fetch(url, {
    method: "POST",
    // no-cors avoids CORS blocking but returns an opaque response (cannot read status)
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  // In no-cors mode, we can't reliably read response. If fetch didn't throw, assume it sent.
  return { ok: true, opaque: res.type === "opaque" };
}
