// Citizen's Watch: the public uploads photos of road conditions from their
// phones; the live map shows recent ones.
//
//   POST /api/citizens-watch/reports              multipart upload (photo + metadata)
//   GET  /api/citizens-watch/reports?hours=72     public feed for the map (no personal data)
//   GET  /api/citizens-watch/reports/:id/image    display copy (EXIF-free, ~1600px)
//   GET  /api/citizens-watch/reports/:id/thumb    small preview for map markers
//
// Everything the request reveals (IP, headers, device, EXIF, location) is stored
// with the photo so spam and fake pictures can be filtered later. None of it is
// returned by the public endpoints.

import express from "express";
import multer from "multer";
import crypto from "crypto";
import exifr from "exifr";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_THUMB_BYTES = 512 * 1024;
const MAX_DISPLAY_BYTES = 3 * 1024 * 1024;
const COPY_MIME = new Set(["image/jpeg", "image/webp"]);
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const CONDITIONS = new Set(["clear", "wet", "snow", "ice", "slush", "flooding", "washout", "closed", "other"]);

// Uploads per IP per hour before we refuse (in-memory; resets on restart).
const UPLOADS_PER_HOUR = 30;

// Thresholds for the spam/fake flags computed at upload time.
const EXIF_LOCATION_MISMATCH_KM = 5;
const STALE_PHOTO_HOURS = 48;
const EDITING_SOFTWARE = /photoshop|lightroom|gimp|snapseed|picsart|canva|facetune|pixelmator|affinity|midjourney|dall|stable diffusion|firefly/i;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 3, fields: 30 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "image" ? ALLOWED_MIME.has(file.mimetype) : COPY_MIME.has(file.mimetype)) return cb(null, true);
    cb(Object.assign(new Error("Only JPEG, PNG, WebP or HEIC photos are accepted."), { status: 415 }));
  },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "display", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

// --- helpers -----------------------------------------------------------------

const num = (v, min = -Infinity, max = Infinity) => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

const str = (v, max = 500) => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
};

const date = (v) => {
  if (v === undefined || v === null || v === "") return null;
  const d = new Date(/^\d+$/.test(String(v)) ? Number(v) : v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const json = (v) => {
  if (typeof v !== "string" || v.length > 20000) return null;
  try {
    const parsed = JSON.parse(v);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

// The real client IP. Traffic arrives Cloudflare -> Apache -> Express, so the
// socket address is Apache's; Cloudflare's header is the most trustworthy,
// then the first hop of X-Forwarded-For.
const clientIp = (req) =>
  req.get("cf-connecting-ip") ||
  (req.get("x-forwarded-for") || "").split(",")[0].trim() ||
  req.socket?.remoteAddress ||
  null;

// Headers worth keeping for forensics. Cookies and auth are never stored.
const KEPT_HEADERS = [
  "user-agent", "accept-language", "referer", "origin", "x-forwarded-for", "x-real-ip",
  "cf-connecting-ip", "cf-ipcountry", "cf-ray", "cf-visitor", "true-client-ip",
  "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform", "sec-ch-ua-model",
  "sec-ch-ua-platform-version", "sec-fetch-site", "sec-fetch-mode", "dnt", "save-data", "via",
];
const pickHeaders = (req) =>
  Object.fromEntries(KEPT_HEADERS.filter((h) => req.get(h)).map((h) => [h, req.get(h).slice(0, 500)]));

// Haversine distance in km.
const distanceKm = (aLat, aLon, bLat, bLon) => {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLon = rad(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

// JSON-safe copy of EXIF: drops binary blobs (thumbnails, maker notes) and
// turns Dates into strings so it fits a jsonb column.
const cleanExif = (exif) => {
  if (!exif) return null;
  const out = {};
  for (const [k, v] of Object.entries(exif)) {
    if (v instanceof Date) out[k] = Number.isNaN(v.getTime()) ? null : v.toISOString();
    else if (v instanceof Uint8Array || ArrayBuffer.isView(v) || v instanceof ArrayBuffer) continue;
    else if (Array.isArray(v) && v.length > 64) continue;
    else if (typeof v === "string") out[k] = v.slice(0, 500);
    else if (typeof v === "number" ? Number.isFinite(v) : true) out[k] = v;
  }
  return out;
};

// In-memory per-IP rate limit.
const recentUploads = new Map();
const rateLimited = (ip) => {
  if (!ip) return false;
  const now = Date.now();
  const hits = (recentUploads.get(ip) || []).filter((t) => now - t < 3600_000);
  if (hits.length >= UPLOADS_PER_HOUR) {
    recentUploads.set(ip, hits);
    return true;
  }
  hits.push(now);
  recentUploads.set(ip, hits);
  if (recentUploads.size > 10000) recentUploads.clear();
  return false;
};

// --- upload ------------------------------------------------------------------

router.post("/reports", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      const status = err.code === "LIMIT_FILE_SIZE" ? 413 : err.status || 400;
      return res.status(status).json({ status: "error", message: err.message });
    }

    const image = req.files?.image?.[0];
    if (!image) return res.status(400).json({ status: "error", message: "A photo is required." });

    const ip = clientIp(req);
    if (rateLimited(ip)) {
      return res.status(429).json({ status: "error", message: "Too many uploads. Please try again later." });
    }

    const b = req.body || {};
    const fit = (f, max) => (f && f.size <= max ? f : null);
    const thumb = fit(req.files?.thumbnail?.[0], MAX_THUMB_BYTES);
    const display = fit(req.files?.display?.[0], MAX_DISPLAY_BYTES);

    let exif = null;
    try {
      exif = await exifr.parse(image.buffer, { tiff: true, exif: true, gps: true, ifd1: false, xmp: false, icc: false, mergeOutput: true });
    } catch {
      exif = null; // unreadable or absent EXIF is itself a signal, recorded below
    }

    const latitude = num(b.latitude, -90, 90);
    const longitude = num(b.longitude, -180, 180);
    const exifLatitude = num(exif?.latitude, -90, 90);
    const exifLongitude = num(exif?.longitude, -180, 180);
    const exifTakenAt = date(exif?.DateTimeOriginal || exif?.CreateDate);
    const exifSoftware = str(exif?.Software, 200);

    const hasDevice = latitude !== null && longitude !== null;
    const hasExifGps = exifLatitude !== null && exifLongitude !== null;
    const sha256 = crypto.createHash("sha256").update(image.buffer).digest("hex");
    const deviceId = str(b.deviceId, 100);

    // Signals for later spam/fake review. They do not hide anything yet.
    const flags = [];
    if (!hasDevice && !hasExifGps) flags.push("no_location");
    if (!exif) flags.push("no_exif");
    if (hasDevice && hasExifGps && distanceKm(latitude, longitude, exifLatitude, exifLongitude) > EXIF_LOCATION_MISMATCH_KM) {
      flags.push("exif_location_mismatch");
    }
    if (exifTakenAt && Date.now() - exifTakenAt.getTime() > STALE_PHOTO_HOURS * 3600_000) flags.push("stale_photo");
    if (exifSoftware && EDITING_SOFTWARE.test(exifSoftware)) flags.push("edited_software");
    if (b.captureMethod === "library") flags.push("from_library");
    if (!display && !thumb) flags.push("no_preview");
    const accuracy = num(b.accuracyM, 0);
    if (accuracy !== null && accuracy > 1000) flags.push("low_location_accuracy");

    try {
      const [dupes, deviceRecent] = await Promise.all([
        prisma.citizenReport.count({ where: { imageSha256: sha256 } }),
        deviceId
          ? prisma.citizenReport.count({ where: { deviceId, createdAt: { gte: new Date(Date.now() - 3600_000) } } })
          : 0,
      ]);
      if (dupes > 0) flags.push("duplicate_image");
      if (deviceRecent >= 10) flags.push("burst_from_device");

      const condition = CONDITIONS.has(b.condition) ? b.condition : null;

      const report = await prisma.citizenReport.create({
        data: {
          condition,
          caption: str(b.caption, 500),

          image: image.buffer,
          imageMime: image.mimetype,
          imageSize: image.size,
          imageSha256: sha256,
          imageWidth: num(b.imageWidth, 1, 100000) ?? num(exif?.ExifImageWidth, 1, 100000),
          imageHeight: num(b.imageHeight, 1, 100000) ?? num(exif?.ExifImageHeight, 1, 100000),
          displayImage: display?.buffer ?? null,
          displayMime: display?.mimetype ?? null,
          thumbnail: thumb?.buffer ?? null,
          thumbnailMime: thumb?.mimetype ?? null,
          originalFilename: str(image.originalname, 255),
          fileLastModified: date(b.fileLastModified),
          captureMethod: b.captureMethod === "camera" || b.captureMethod === "library" ? b.captureMethod : null,

          latitude: hasDevice ? latitude : hasExifGps ? exifLatitude : null,
          longitude: hasDevice ? longitude : hasExifGps ? exifLongitude : null,
          accuracyM: hasDevice ? accuracy : null,
          altitudeM: num(b.altitudeM),
          headingDeg: num(b.headingDeg, 0, 360),
          speedMps: num(b.speedMps, 0),
          locationAt: date(b.locationAt),
          locationSource: hasDevice ? "device" : hasExifGps ? "exif" : "none",

          exifLatitude,
          exifLongitude,
          exifTakenAt,
          cameraMake: str(exif?.Make, 100),
          cameraModel: str(exif?.Model, 100),
          exifSoftware,
          exif: cleanExif(exif),

          userId: req.session?.userId || null,
          deviceId,
          sessionId: req.sessionID || null,

          ip,
          forwardedFor: str(req.get("x-forwarded-for"), 500),
          ipCountry: str(req.get("cf-ipcountry"), 8),
          userAgent: str(req.get("user-agent"), 1000),
          acceptLanguage: str(req.get("accept-language"), 200),
          headers: pickHeaders(req),
          client: json(b.client),

          flags,
        },
        select: { id: true, createdAt: true, latitude: true, longitude: true },
      });

      return res.status(201).json({ status: "success", data: report });
    } catch (e) {
      console.error("citizens-watch upload failed:", e);
      return res.status(500).json({ status: "error", message: "Could not save the photo." });
    }
  });
});

// --- public feed -------------------------------------------------------------

router.get("/reports", async (req, res) => {
  const hours = num(req.query.hours, 1, 24 * 30) ?? 72;
  try {
    const rows = await prisma.citizenReport.findMany({
      where: {
        status: "visible",
        latitude: { not: null },
        longitude: { not: null },
        createdAt: { gte: new Date(Date.now() - hours * 3600_000) },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
      select: { id: true, createdAt: true, condition: true, caption: true, latitude: true, longitude: true },
    });
    res.set("Cache-Control", "no-store");
    return res.json({ status: "success", data: rows });
  } catch (e) {
    console.error("citizens-watch list failed:", e);
    return res.status(500).json({ status: "error", message: "Could not load reports." });
  }
});

// Only the browser-made copies are served. They are redrawn on a canvas, so
// they carry no EXIF; the original (with the uploader's GPS, camera serial and
// so on) never leaves the database.
const sendImage = (kind) => async (req, res) => {
  try {
    const row = await prisma.citizenReport.findFirst({
      where: { id: req.params.id, status: "visible" },
      select: { displayImage: true, displayMime: true, thumbnail: true, thumbnailMime: true },
    });
    const [bytes, mime] =
      kind === "thumb"
        ? [row?.thumbnail || row?.displayImage, row?.thumbnail ? row.thumbnailMime : row?.displayMime]
        : [row?.displayImage || row?.thumbnail, row?.displayImage ? row.displayMime : row?.thumbnailMime];
    if (!bytes) return res.status(404).end();
    res.set("Content-Type", mime || "image/jpeg");
    res.set("Cache-Control", "public, max-age=86400, immutable");
    res.set("X-Content-Type-Options", "nosniff");
    return res.send(Buffer.from(bytes));
  } catch (e) {
    console.error("citizens-watch image failed:", e);
    return res.status(500).end();
  }
};

router.get("/reports/:id/image", sendImage("image"));
router.get("/reports/:id/thumb", sendImage("thumb"));

export default router;
