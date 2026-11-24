// Shared helpers for Citizen's Watch: the API, condition labels, the device id,
// browser metadata, and the EXIF-free copies the phone makes before upload.

export const API = "/api/citizens-watch";

export const CONDITIONS = [
  { value: "clear", label: "Clear", color: "#2e7d32" },
  { value: "wet", label: "Wet", color: "#0288d1" },
  { value: "snow", label: "Snow", color: "#90a4ae" },
  { value: "slush", label: "Slush", color: "#8d6e63" },
  { value: "ice", label: "Ice", color: "#4fc3f7" },
  { value: "flooding", label: "Flooding", color: "#1565c0" },
  { value: "washout", label: "Washout", color: "#e65100" },
  { value: "closed", label: "Closed", color: "#c62828" },
  { value: "other", label: "Other", color: "#6a1b9a" },
];

export const conditionOf = (value) =>
  CONDITIONS.find((c) => c.value === value) || { value: null, label: "Not specified", color: "#546e7a" };

// A random id kept on this browser so repeat uploads from one phone can be
// grouped, whether or not anyone is logged in.
export function getDeviceId() {
  const KEY = "cw_device_id";
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null; // storage blocked (private mode)
  }
}

// What the browser can tell us about the device. Used only for spam review.
export async function collectClientInfo(extra = {}) {
  const n = navigator;
  const info = {
    screen: { w: window.screen?.width, h: window.screen?.height, dpr: window.devicePixelRatio },
    viewport: { w: window.innerWidth, h: window.innerHeight },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    tzOffsetMin: new Date().getTimezoneOffset(),
    language: n.language,
    languages: n.languages,
    platform: n.platform,
    hardwareConcurrency: n.hardwareConcurrency,
    deviceMemory: n.deviceMemory,
    maxTouchPoints: n.maxTouchPoints,
    cookieEnabled: n.cookieEnabled,
    standalone: window.matchMedia?.("(display-mode: standalone)").matches || n.standalone === true,
    connection: n.connection
      ? { type: n.connection.type, effectiveType: n.connection.effectiveType, downlink: n.connection.downlink, rtt: n.connection.rtt }
      : null,
    referrer: document.referrer || null,
    clientTime: new Date().toISOString(),
    ...extra,
  };
  try {
    if (n.userAgentData) {
      info.uaData = await n.userAgentData.getHighEntropyValues(["model", "platform", "platformVersion", "fullVersionList", "mobile"]);
    }
  } catch {
    /* not available */
  }
  try {
    const perm = await n.permissions?.query({ name: "geolocation" });
    info.geolocationPermission = perm?.state;
  } catch {
    /* not available */
  }
  return info;
}

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This photo format can't be previewed on this device."));
    };
    img.src = url;
  });

const toBlob = (canvas, quality) =>
  new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", quality));

// Redraws the photo on a canvas at two sizes. Canvas output carries no EXIF,
// so these copies are safe to show publicly. Browsers apply EXIF orientation
// when decoding, so the copies come out upright.
export async function makeCopies(file) {
  const { img, url } = await loadImage(file);
  const width = img.naturalWidth;
  const height = img.naturalHeight;
  const scaled = async (maxSide, quality) => {
    const s = Math.min(1, maxSide / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * s);
    canvas.height = Math.round(height * s);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    return toBlob(canvas, quality);
  };
  try {
    const [display, thumbnail] = await Promise.all([scaled(1600, 0.82), scaled(400, 0.72)]);
    return { display, thumbnail, width, height, previewUrl: url };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

// One-shot high-accuracy position. Resolves null instead of rejecting so the
// upload still works without location (the server flags it).
export function getPosition(timeout = 15000) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ error: "Location isn't supported on this device." });
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ position: p }),
      (e) =>
        resolve({
          error: e.code === 1 ? "Location permission was denied." : "Couldn't get your location.",
        }),
      { enableHighAccuracy: true, timeout, maximumAge: 60000 }
    );
  });
}

export function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
