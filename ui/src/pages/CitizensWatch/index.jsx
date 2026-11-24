import { Link, useNavigate } from "react-router-dom";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import MapIcon from "@mui/icons-material/Map";
import "./styles.css";

// Citizen's Watch home: two big buttons, sized for a thumb on a phone.
// "Upload photo" opens the camera straight away (it is a label for a hidden
// file input), then hands the photo to the upload page.
function CitizensWatch() {
  const navigate = useNavigate();

  const onPick = (captureMethod) => (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) navigate("/citizens-watch/upload", { state: { file, captureMethod } });
  };

  return (
    <main className="cw-page cw-home">
      <header className="cw-home-header">
        <h1>Citizen&rsquo;s Watch</h1>
        <p>Share what the road looks like right now, or see what other travellers are reporting.</p>
      </header>

      <div className="cw-big-buttons">
        <label className="cw-big-button cw-big-button--primary">
          <input type="file" accept="image/*" capture="environment" className="cw-visually-hidden" onChange={onPick("camera")} />
          <CameraAltIcon className="cw-big-button-icon" aria-hidden="true" />
          <span className="cw-big-button-label">Upload photo</span>
          <span className="cw-big-button-hint">Snap the road conditions where you are</span>
        </label>
        <Link to="/citizens-watch/live" className="cw-big-button cw-big-button--secondary">
          <MapIcon className="cw-big-button-icon" aria-hidden="true" />
          <span className="cw-big-button-label">View live conditions</span>
          <span className="cw-big-button-hint">Recent photos from other travellers on a map</span>
        </Link>
      </div>

      <label className="cw-text-button">
        <input type="file" accept="image/*" className="cw-visually-hidden" onChange={onPick("library")} />
        or choose a photo you already took
      </label>

      <p className="cw-fineprint">
        Please don&rsquo;t take photos while driving. Uploads record your location, device and network details so we can
        filter out spam and fake reports. Photos shown publicly have their camera data removed.
      </p>
    </main>
  );
}

export default CitizensWatch;
