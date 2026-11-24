import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LocationOffIcon from "@mui/icons-material/LocationOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { API, CONDITIONS, collectClientInfo, getDeviceId, getPosition, makeCopies } from "./citizensWatch.js";
import "./styles.css";

// Upload with progress (fetch can't report upload progress).
function send(form, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}/reports`);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let body = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* not JSON */
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(body);
      else reject(new Error(body?.message || `Upload failed (${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("Network error. Check your connection and try again."));
    xhr.send(form);
  });
}

function Upload() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const openedAt = useRef(Date.now());

  const [file, setFile] = useState(state?.file || null);
  const [captureMethod, setCaptureMethod] = useState(state?.captureMethod || null);
  const [copies, setCopies] = useState(null);
  const [copyError, setCopyError] = useState(null);
  const [geo, setGeo] = useState({ loading: true });
  const [condition, setCondition] = useState(null);
  const [caption, setCaption] = useState("");
  const [phase, setPhase] = useState("form"); // form | sending | done
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // Ask for location as soon as the page opens, so it's ready by submit.
  const locate = () => {
    setGeo({ loading: true });
    getPosition().then((r) => setGeo({ loading: false, ...r }));
  };
  useEffect(locate, []);

  // Make the EXIF-free display copy and thumbnail whenever the photo changes.
  useEffect(() => {
    if (!file) return undefined;
    let cancelled = false;
    let url = null;
    setCopies(null);
    setCopyError(null);
    makeCopies(file)
      .then((c) => {
        url = c.previewUrl;
        if (cancelled) URL.revokeObjectURL(url);
        else setCopies(c);
      })
      .catch((e) => !cancelled && setCopyError(e.message));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  const onPick = (method) => (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) {
      setFile(f);
      setCaptureMethod(method);
      setError(null);
    }
  };

  const submit = async () => {
    setError(null);
    setPhase("sending");
    setProgress(0);
    try {
      const form = new FormData();
      form.append("image", file, file.name || "photo.jpg");
      if (copies?.display) form.append("display", copies.display, "display.jpg");
      if (copies?.thumbnail) form.append("thumbnail", copies.thumbnail, "thumb.jpg");

      const c = geo.position?.coords;
      if (c) {
        form.append("latitude", c.latitude);
        form.append("longitude", c.longitude);
        form.append("accuracyM", c.accuracy);
        if (c.altitude != null) form.append("altitudeM", c.altitude);
        if (c.heading != null && !Number.isNaN(c.heading)) form.append("headingDeg", c.heading);
        if (c.speed != null) form.append("speedMps", c.speed);
        form.append("locationAt", geo.position.timestamp);
      }
      if (condition) form.append("condition", condition);
      if (caption.trim()) form.append("caption", caption.trim());
      if (captureMethod) form.append("captureMethod", captureMethod);
      if (copies) {
        form.append("imageWidth", copies.width);
        form.append("imageHeight", copies.height);
      }
      if (file.lastModified) form.append("fileLastModified", file.lastModified);
      const deviceId = getDeviceId();
      if (deviceId) form.append("deviceId", deviceId);
      form.append(
        "client",
        JSON.stringify(
          await collectClientInfo({
            msOnPageBeforeSubmit: Date.now() - openedAt.current,
            fileType: file.type,
            fileSize: file.size,
            locationError: geo.error || null,
          })
        )
      );

      await send(form, setProgress);
      setPhase("done");
      window.scrollTo(0, 0);
    } catch (e) {
      setError(e.message);
      setPhase("form");
    }
  };

  if (phase === "done") {
    return (
      <main className="cw-page cw-done">
        <CheckCircleIcon className="cw-done-icon" aria-hidden="true" />
        <h1>Thanks for the report</h1>
        <p>Your photo is now on the live conditions map.</p>
        <div className="cw-big-buttons">
          <Link to="/citizens-watch/live" className="cw-big-button cw-big-button--primary cw-big-button--compact">
            <span className="cw-big-button-label">View live conditions</span>
          </Link>
          <button type="button" className="cw-big-button cw-big-button--secondary cw-big-button--compact" onClick={() => navigate("/citizens-watch")}>
            <span className="cw-big-button-label">Done</span>
          </button>
        </div>
      </main>
    );
  }

  if (!file) {
    return (
      <main className="cw-page cw-home">
        <header className="cw-home-header">
          <h1>Upload a photo</h1>
        </header>
        <div className="cw-big-buttons">
          <label className="cw-big-button cw-big-button--primary">
            <input type="file" accept="image/*" capture="environment" className="cw-visually-hidden" onChange={onPick("camera")} />
            <CameraAltIcon className="cw-big-button-icon" aria-hidden="true" />
            <span className="cw-big-button-label">Take photo</span>
          </label>
        </div>
        <label className="cw-text-button">
          <input type="file" accept="image/*" className="cw-visually-hidden" onChange={onPick("library")} />
          or choose a photo you already took
        </label>
      </main>
    );
  }

  const sending = phase === "sending";
  const c = geo.position?.coords;

  return (
    <main className="cw-page cw-upload">
      <div className="cw-preview">
        {copies ? (
          <img src={copies.previewUrl} alt="The photo you're about to upload" />
        ) : (
          <div className="cw-preview-placeholder">{copyError || "Preparing preview…"}</div>
        )}
        <label className="cw-retake">
          <input type="file" accept="image/*" capture="environment" className="cw-visually-hidden" onChange={onPick("camera")} disabled={sending} />
          Retake
        </label>
      </div>

      <div className={`cw-location ${c ? "is-ok" : geo.loading ? "" : "is-missing"}`}>
        {c ? <MyLocationIcon aria-hidden="true" /> : <LocationOffIcon aria-hidden="true" />}
        <span>
          {geo.loading
            ? "Finding your location…"
            : c
            ? `Location found (±${Math.round(c.accuracy)} m)`
            : `${geo.error} The photo can still be sent, but it may not appear on the map.`}
        </span>
        {!geo.loading && !c && (
          <button type="button" className="cw-link" onClick={locate}>
            Try again
          </button>
        )}
      </div>

      <fieldset className="cw-conditions" disabled={sending}>
        <legend>What are the conditions?</legend>
        <div className="cw-chips">
          {CONDITIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="cw-chip"
              aria-pressed={condition === opt.value}
              style={{ "--chip-color": opt.color }}
              onClick={() => setCondition(condition === opt.value ? null : opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="cw-caption">
        <span>Add a note (optional)</span>
        <textarea
          rows={2}
          maxLength={500}
          placeholder="e.g. Black ice past the km 40 marker"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={sending}
        />
      </label>

      {error && (
        <p className="cw-error" role="alert">
          {error}
        </p>
      )}

      <button type="button" className="cw-submit" onClick={submit} disabled={sending || geo.loading}>
        {sending ? `Uploading… ${Math.round(progress * 100)}%` : geo.loading ? "Waiting for location…" : "Send report"}
      </button>
    </main>
  );
}

export default Upload;
