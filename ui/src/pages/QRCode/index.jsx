import React, { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./styles.css";

/**
 * /qrcode — a full-screen QR code pointing at the site's home page, for
 * putting on a projector or a phone screen at events. The URL comes from the
 * current origin, so dev and prod each encode their own address.
 * AppShell lists this route as "bare": no header or footer.
 */
function QRCodePage() {
  const url = `${window.location.origin}/`;

  useEffect(() => {
    const previous = document.title;
    document.title = "Scan to visit";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="qr-page">
      <div className="qr-page__card">
        <QRCodeSVG
          className="qr-page__code"
          value={url}
          level="M"
          marginSize={2}
          fgColor="#001529"
          bgColor="#ffffff"
          title={`QR code for ${url}`}
        />
      </div>
      <p className="qr-page__hint">Scan to visit</p>
      <p className="qr-page__url">{url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</p>
    </div>
  );
}

export default QRCodePage;
