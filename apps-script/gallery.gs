/**
 * Gallery API for Future Spark site (separate from enquiry/events).
 *
 * Deploy as Web App:
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * Security:
 * - For admin actions (upload): pass ?token=<ADMIN_TOKEN>
 * - Store ADMIN_TOKEN in Script Properties.
 *
 * Storage:
 * - Create a Google Drive folder for gallery uploads.
 * - Store GALLERY_ROOT_FOLDER_ID in Script Properties.
 */

const PROPS = PropertiesService.getScriptProperties();

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getAdminToken_() {
  return (PROPS.getProperty("ADMIN_TOKEN") || "").trim();
}

function requireAdmin_(e) {
  const expected = getAdminToken_();
  const got = String(e && e.parameter && e.parameter.token ? e.parameter.token : "").trim();
  if (!expected) throw new Error("ADMIN_TOKEN not set in Script Properties");
  if (!got || got !== expected) throw new Error("Unauthorized");
}

function getRootFolder_() {
  const id = (PROPS.getProperty("GALLERY_ROOT_FOLDER_ID") || "").trim();
  if (!id) throw new Error("GALLERY_ROOT_FOLDER_ID not set in Script Properties");
  return DriveApp.getFolderById(id);
}

function driveThumbUrl_(fileId, width) {
  // More reliable hotlink for <img> than drive.google.com/thumbnail
  // Works when file is shared as Anyone with link.
  const w = width || 1200;
  return "https://lh3.googleusercontent.com/d/" + encodeURIComponent(fileId) + "=w" + w;
}

function albumFolder_(root, albumKey, albumTitle) {
  const key = String(albumKey || "").trim();
  if (!key) throw new Error("Missing albumKey");

  const existing = root.getFoldersByName(key);
  if (existing.hasNext()) return existing.next();

  const f = root.createFolder(key);
  f.setDescription(String(albumTitle || key));
  return f;
}

function listGallery_() {
  const root = getRootFolder_();
  const out = [];

  const folders = root.getFolders();
  while (folders.hasNext()) {
    const f = folders.next();
    const title = f.getDescription() || f.getName();

    const images = [];
    const files = f.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      const mt = (file.getMimeType() || "").toLowerCase();
      if (mt.indexOf("image/") !== 0) continue;

      const id = file.getId();
      const src = driveThumbUrl_(id, 1200);
      images.push({ id: id, src: src, alt: title });
    }

    if (images.length) {
      out.push({ key: f.getName(), title: title, images: images });
    }
  }

  out.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  return out;
}

function deleteFromGallery_(body) {
  const id = String(body.fileId || body.id || "").trim();
  if (!id) throw new Error("Missing fileId");

  const file = DriveApp.getFileById(id);
  file.setTrashed(true);

  return { id };
}

function deleteAllInAlbum_(body) {
  const albumKey = String(body.albumKey || "").trim();
  if (!albumKey) throw new Error("Missing albumKey");

  const root = getRootFolder_();
  const folders = root.getFoldersByName(albumKey);
  if (!folders.hasNext()) return { albumKey, deleted: 0 };

  const folder = folders.next();
  let deleted = 0;

  const files = folder.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    const mt = (f.getMimeType() || "").toLowerCase();
    if (mt.indexOf("image/") !== 0) continue;
    f.setTrashed(true);
    deleted++;
  }

  return { albumKey, deleted };
}

function uploadToGallery_(body) {
  const root = getRootFolder_();

  const albumKey = String(body.albumKey || "").trim();
  const albumTitle = String(body.albumTitle || "").trim();
  const filename = String(body.filename || "").trim() || new Date().getTime() + ".webp";
  const contentType = String(body.contentType || "image/webp").trim();
  const base64 = String(body.base64 || "").trim();

  if (!albumKey) throw new Error("Missing albumKey");
  if (!base64) throw new Error("Missing base64");

  const folder = albumFolder_(root, albumKey, albumTitle);

  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, contentType, filename);

  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const id = file.getId();
  return {
    id: id,
    name: file.getName(),
    url: driveThumbUrl_(id, 1200),
  };
}

function doGet(e) {
  try {
    const type = String(e && e.parameter && e.parameter.type ? e.parameter.type : "").trim();
    if (type === "gallery") {
      return jsonOut({ ok: true, albums: listGallery_() });
    }
    return jsonOut({ ok: true, message: "OK" });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doPost(e) {
  try {
    requireAdmin_(e);

    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "";
    const body = raw ? JSON.parse(raw) : {};

    if (body.formType === "gallery" && body.action === "upload") {
      const r = uploadToGallery_(body);
      return jsonOut({ ok: true, result: r });
    }

    if (body.formType === "gallery" && body.action === "delete") {
      const r = deleteFromGallery_(body);
      return jsonOut({ ok: true, result: r });
    }

    if (body.formType === "gallery" && body.action === "deleteAll") {
      const r = deleteAllInAlbum_(body);
      return jsonOut({ ok: true, result: r });
    }

    return jsonOut({ ok: false, error: "Unknown action" });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}
