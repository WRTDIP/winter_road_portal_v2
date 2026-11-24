import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadModules } from "esri-loader";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import { API, CONDITIONS, conditionOf, timeAgo } from "./citizensWatch.js";
import "./styles.css";

const REFRESH_MS = 60_000;
const WINDOWS = [
  { hours: 24, label: "24 h" },
  { hours: 72, label: "3 days" },
  { hours: 168, label: "7 days" },
];
// Northern Canada, where the winter roads are.
const DEFAULT_CENTER = [-115, 63];
const DEFAULT_ZOOM = 4;

// Popup content as a DOM element. ArcGIS sanitizes HTML-string content (it
// drops relative URLs, classes and some styles) but leaves elements alone, so
// we build it here and use textContent for anything user-supplied.
function popupContent(r) {
  const cond = conditionOf(r.condition);
  const when = new Date(r.createdAt);
  const src = `${API}/reports/${encodeURIComponent(r.id)}/image`;
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  const root = el("div", "cw-popup");
  const link = el("a");
  link.href = src;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  const img = el("img");
  img.src = src;
  img.alt = "Road conditions photo";
  link.append(img);

  const meta = el("div", "cw-popup-meta");
  const badge = el("span", "cw-popup-badge", cond.label);
  badge.style.background = cond.color;
  const time = el("time", null, timeAgo(r.createdAt));
  time.dateTime = when.toISOString();
  time.title = when.toLocaleString();
  meta.append(badge, time);

  root.append(link, meta);
  if (r.caption) root.append(el("p", "cw-popup-caption", r.caption));
  return root;
}

function LiveMap() {
  const navigate = useNavigate();
  const mapDiv = useRef(null);
  const esri = useRef(null); // { view, layer, Graphic }
  const fitted = useRef(false);
  const [hours, setHours] = useState(72);
  const [reports, setReports] = useState(null);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  // Build the map once.
  useEffect(() => {
    let destroyed = false;
    loadModules(["esri/Map", "esri/views/MapView", "esri/layers/GraphicsLayer", "esri/Graphic"], { css: true })
      .then(([EsriMap, MapView, GraphicsLayer, Graphic]) => {
        if (destroyed) return;
        const layer = new GraphicsLayer({ title: "Citizen reports" });
        const map = new EsriMap({ basemap: "osm", layers: [layer] });
        const view = new MapView({
          container: mapDiv.current,
          map,
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          constraints: { minZoom: 2 },
          popup: { dockEnabled: false, collapseEnabled: false },
        });
        esri.current = { view, layer, Graphic };
        // On phones the popup docks at the bottom; hide our overlays while it's open.
        view.watch("popup.visible", (v) => setPopupOpen(!!v));
        // Draw anything that arrived before the map was ready.
        setReports((r) => (r ? [...r] : r));
      })
      .catch((e) => setError(`Map failed to load: ${e.message}`));
    return () => {
      destroyed = true;
      esri.current?.view?.destroy();
      esri.current = null;
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/reports?hours=${hours}`, { credentials: "include" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);
      setReports(body.data);
      setUpdatedAt(new Date());
      setError(null);
    } catch (e) {
      setError(`Couldn't load reports: ${e.message}`);
    }
  }, [hours]);

  // Poll for new reports.
  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  // Redraw markers whenever the data changes.
  useEffect(() => {
    const e = esri.current;
    if (!e || !reports) return;
    const { view, layer, Graphic } = e;
    layer.removeAll();
    layer.addMany(
      reports.map(
        (r) =>
          new Graphic({
            geometry: { type: "point", longitude: r.longitude, latitude: r.latitude },
            symbol: {
              type: "simple-marker",
              style: "circle",
              size: 15,
              color: conditionOf(r.condition).color,
              outline: { color: "white", width: 2 },
            },
            attributes: { id: r.id },
            popupTemplate: { title: conditionOf(r.condition).label, content: () => popupContent(r) },
          })
      )
    );
    // Zoom to the reports the first time we have some.
    if (!fitted.current && reports.length) {
      fitted.current = true;
      // Step out one zoom level so edge markers aren't hidden under the overlays.
      view.when(() =>
        view
          .goTo(layer.graphics.toArray(), { animate: false })
          .then(() => (view.zoom = Math.min(view.zoom - 1, 11)))
          .catch(() => {})
      );
    }
  }, [reports]);

  const locateMe = () => {
    navigator.geolocation?.getCurrentPosition(
      (p) => esri.current?.view.goTo({ center: [p.coords.longitude, p.coords.latitude], zoom: 11 }),
      () => setError("Couldn't get your location."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <main className="cw-live">
      <div className="cw-live-bar">
        <div className="cw-live-title">
          <h1>Live conditions</h1>
          <span className="cw-live-count">
            {reports ? `${reports.length} report${reports.length === 1 ? "" : "s"}` : "Loading…"}
            {updatedAt && ` · updated ${updatedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
          </span>
        </div>
        <div className="cw-live-controls">
          <div className="cw-segmented" role="group" aria-label="Time window">
            {WINDOWS.map((w) => (
              <button key={w.hours} type="button" aria-pressed={hours === w.hours} onClick={() => setHours(w.hours)}>
                {w.label}
              </button>
            ))}
          </div>
          <button type="button" className="cw-icon-button" onClick={load} aria-label="Refresh">
            <RefreshIcon />
          </button>
        </div>
      </div>

      <div className={`cw-live-map-wrap${popupOpen ? " is-popup-open" : ""}`}>
        <div ref={mapDiv} className="cw-live-map" />
        {error && (
          <p className="cw-live-error" role="alert">
            {error}
          </p>
        )}
        {reports && reports.length === 0 && !error && (
          <p className="cw-live-empty">No reports in this time window yet. Be the first to post one.</p>
        )}
        <details className="cw-legend">
          <summary>Legend</summary>
          <ul>
            {CONDITIONS.map((c) => (
              <li key={c.value}>
                <span className="cw-legend-dot" style={{ background: c.color }} />
                {c.label}
              </li>
            ))}
            <li>
              <span className="cw-legend-dot" style={{ background: conditionOf(null).color }} />
              Not specified
            </li>
          </ul>
        </details>
        <button type="button" className="cw-locate" onClick={locateMe}>
          Near me
        </button>
        <label className="cw-fab">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="cw-visually-hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) navigate("/citizens-watch/upload", { state: { file, captureMethod: "camera" } });
            }}
          />
          <CameraAltIcon aria-hidden="true" />
          <span>Upload photo</span>
        </label>
      </div>
    </main>
  );
}

export default LiveMap;
