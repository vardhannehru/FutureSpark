// Google Apps Script (deploy as Web App)
// 1) Create a Google Sheet.
// 2) Extensions → Apps Script → paste this code.
// 3) Set SHEET_NAME + (optional) ENQUIRY_TOKEN.
// 4) Deploy → New deployment → Web app.
//    Execute as: Me
//    Who has access: Anyone (or Anyone with link)
// 5) Copy the Web App URL and set it as VITE_ENQUIRY_ENDPOINT.

const ENQUIRIES_SHEET_NAME = 'Enquiries';
const CAREERS_SHEET_NAME = 'Careers';
const EVENTS_SHEET_NAME = 'Events';

// Admin tokens
// - Leave ENQUIRY_TOKEN as-is to avoid breaking your existing enquiry form.
// - Set EVENTS_TOKEN to a secret so only admins can add events from the website.
const ENQUIRY_TOKEN = 'CHANGE_ME_TO_A_SECRET'; // optional; if blank, no token check
const EVENTS_TOKEN = 'fsis123';

// For Careers resume uploads (Option B):
// 1) Create a Drive folder for resumes
// 2) Put the folder ID here
// 3) Re-deploy the Web App after changes
const RESUME_FOLDER_ID = '1vmu5F9I7HwJto5wqCd4BYui1flTYJUGe';

function ensureSheet_(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  // Add headers if empty
  if (sheet.getLastRow() === 0) {
    if (sheetName === CAREERS_SHEET_NAME) {
      sheet.appendRow([
        'Timestamp',
        'Full Name',
        'Position',
        'Phone',
        'Email',
        'Experience',
        'Qualification',
        'Message',
        'Resume (Drive Link)',
        'Source',
        'Page URL',
        'IP (best-effort)',
        'User Agent (best-effort)'
      ]);
    } else {
      sheet.appendRow([
        'Timestamp',
        'Parent/Guardian Name',
        'Student Name',
        'Class Interested',
        'Phone',
        'Email',
        'Message',
        'Source',
        'Page URL',
        'IP (best-effort)',
        'User Agent (best-effort)'
      ]);
    }
  }

  return sheet;
}

function jsonResponse_(obj, code) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function requireToken_(e, expectedToken) {
  if (!expectedToken || expectedToken === 'CHANGE_ME_TO_A_SECRET') return;

  const headerToken = (e && e.headers && (e.headers['x-token'] || e.headers['X-Token'] || e.headers['X-TOKEN']))
    ? String(e.headers['x-token'] || e.headers['X-Token'] || e.headers['X-TOKEN'])
    : '';
  const queryToken = (e && e.parameter && e.parameter.token) ? String(e.parameter.token) : '';
  const token = headerToken || queryToken;

  if (!token || token !== expectedToken) throw new Error('Unauthorized');
}

function doGet(e) {
  // Health check + Events API
  try {
    const type = e && e.parameter && e.parameter.type ? String(e.parameter.type) : '';

    if (type === 'events') {
      requireToken_(e, EVENTS_TOKEN);

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(EVENTS_SHEET_NAME);
      if (!sheet) {
        return jsonResponse_({ ok: true, events: [] }, 200);
      }

      const values = sheet.getDataRange().getValues();
      if (!values || values.length < 2) {
        return jsonResponse_({ ok: true, events: [] }, 200);
      }

      const header = values[0].map((h) => String(h || '').trim());
      const rows = values.slice(1);

      // Read rows into objects using header keys
      const events = rows
        .map((r, idx) => {
          const obj = { sheetRow: idx + 2 }; // +2 because header row is 1 and rows start at index 0
          for (let i = 0; i < header.length; i++) {
            const key = header[i];
            if (!key) continue;
            obj[key] = r[i];
          }
          return obj;
        })
        .filter((o) => String(o.title || o.Title || '').trim() !== '')
        .slice(0, 20)
        .map((o) => {
          // Normalize date/time if they are actual Sheets Date values
          const dateVal = o.date || o.Date || o.dateISO || o.DateISO;
          const timeVal = o.time || o.Time || o.time24 || o.Time24;

          let dateISO = '';
          if (dateVal instanceof Date) {
            dateISO = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), 'yyyy-MM-dd');
          } else {
            dateISO = String(dateVal || '').trim();
          }

          let time24 = '';
          if (timeVal instanceof Date) {
            time24 = Utilities.formatDate(timeVal, Session.getScriptTimeZone(), 'HH:mm');
          } else {
            time24 = String(timeVal || '').trim();
          }

          return {
            title: String(o.title || o.Title || '').trim(),
            dateISO,
            time24,
            venue: String(o.venue || o.Venue || '').trim(),
            badge: String(o.badge || o.Badge || '').trim(),
            description: String(o.description || o.Description || '').trim(),
          };
        });

      return jsonResponse_({ ok: true, events }, 200);
    }

    return ContentService
      .createTextOutput('OK - Web App is live. Use ?type=events for events JSON.')
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err && err.message ? err.message : err) }, 401);
  }
}

function doPost(e) {
  try {
    const headers = (e && e.parameter) ? e.parameter : {};
    const reqHeaders = (e && e.headers) ? e.headers : {};

    const body = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(body);

    const formType = data && data.formType ? String(data.formType) : '';

    // Events write API (admin-only via token)
    if (formType === 'events') {
      try {
        requireToken_(e, EVENTS_TOKEN);
      } catch {
        return jsonResponse_({ ok: false, error: 'Unauthorized' }, 401);
      }

      const sheet = ensureSheet_(EVENTS_SHEET_NAME);
      const action = String(data.action || '').trim();

      // Delete by absolute row number (1-based)
      if (action === 'delete') {
        const sheetRow = Number(data.sheetRow);
        if (!Number.isFinite(sheetRow) || sheetRow < 2) {
          return jsonResponse_({ ok: false, error: 'Invalid sheetRow' }, 400);
        }

        // Prevent deleting header row
        sheet.deleteRow(sheetRow);
        return jsonResponse_({ ok: true }, 200);
      }

      // Default action: append new event
      const title = String(data.title || '').trim();
      if (!title) return jsonResponse_({ ok: false, error: 'Missing title' }, 400);

      // Store exactly what the site sends; can be ISO or free text.
      const dateISO = String(data.dateISO || '').trim();
      const time24 = String(data.time24 || '').trim();
      const venue = String(data.venue || '').trim();
      const badge = String(data.badge || '').trim();
      const description = String(data.description || '').trim();

      // Ensure header exists for Events sheet
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['title', 'date', 'time', 'venue', 'badge', 'description']);
      }

      sheet.appendRow([title, dateISO, time24, venue, badge, description]);
      return jsonResponse_({ ok: true }, 200);
    }

    // Enquiry/Careers endpoints (optional token)
    try {
      requireToken_(e, ENQUIRY_TOKEN);
    } catch {
      return jsonResponse_({ ok: false, error: 'Unauthorized' }, 401);
    }

    const isCareers = !!(
      data && (formType === 'careers' || String(data.message || '').indexOf('[CAREERS]') === 0)
    );
    const sheet = ensureSheet_(isCareers ? CAREERS_SHEET_NAME : ENQUIRIES_SHEET_NAME);

    // Minimal validation
    if (!data.parentName || !data.phone) {
      return jsonResponse_({ ok: false, error: 'Missing name or phone' }, 400);
    }
    if (isCareers && !data.position) {
      return jsonResponse_({ ok: false, error: 'Missing position' }, 400);
    }

    const ts = new Date();

    // Apps Script doesn't always give IP/UA reliably in web apps; keep best-effort.
    const ip = (reqHeaders['X-Forwarded-For'] || reqHeaders['x-forwarded-for'] || '').toString();
    const ua = (reqHeaders['User-Agent'] || reqHeaders['user-agent'] || '').toString();

    // Optional resume upload (base64 data URL)
    // NOTE: If upload fails, we write the error into the Resume column to make debugging easy.
    let resumeLink = '';
    if (isCareers && !data.resumeDataUrl) {
      // Debug marker: Careers submission arrived without resume data
      resumeLink = 'NO_RESUME_SENT';
    }
    if (data.resumeDataUrl) {
      try {
        if (!RESUME_FOLDER_ID || RESUME_FOLDER_ID === 'PASTE_DRIVE_FOLDER_ID_HERE') {
          throw new Error('RESUME_FOLDER_ID not configured');
        }

        const m = String(data.resumeDataUrl).match(/^data:(.+?);base64,(.+)$/);
        if (!m) throw new Error('Invalid resumeDataUrl');

        const mimeType = m[1];
        const b64 = m[2];
        const bytes = Utilities.base64Decode(b64);
        const safeName = String(data.resumeFileName || 'resume')
          .replace(/[^a-zA-Z0-9._-]+/g, '_')
          .slice(0, 80);
        const fileName = `${Utilities.formatDate(ts, Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss')}_${safeName}`;

        const blob = Utilities.newBlob(bytes, mimeType, fileName);
        const folder = DriveApp.getFolderById(RESUME_FOLDER_ID);
        folder.createFile(blob);
        resumeLink = fileName;
      } catch (e2) {
        resumeLink = 'UPLOAD FAILED: ' + String(e2 && e2.message ? e2.message : e2);
      }
    }

    if (isCareers) {
      sheet.appendRow([
        ts,
        String(data.parentName || ''),
        String(data.position || ''),
        String(data.phone || ''),
        String(data.email || ''),
        String(data.experience || ''),
        String(data.qualification || ''),
        String(data.message || ''),
        String(resumeLink || ''),
        String(data.source || 'website'),
        String(data.pageUrl || ''),
        ip,
        ua,
      ]);
    } else {
      sheet.appendRow([
        ts,
        String(data.parentName || ''),
        String(data.studentName || ''),
        String(data.classInterested || ''),
        String(data.phone || ''),
        String(data.email || ''),
        String(data.message || ''),
        String(data.source || 'website'),
        String(data.pageUrl || ''),
        ip,
        ua,
      ]);
    }

    return jsonResponse_({ ok: true }, 200);
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) }, 500);
  }
}
