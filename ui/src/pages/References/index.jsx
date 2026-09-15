import React from "react";
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";

function References() {
  return (
    <div>
      <CoverBanner title="References" />
      <div style={{ padding: "2rem 1.5rem 4rem", color: "#0E2959" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              border: "1px solid #d9e2f0",
              borderRadius: "8px",
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <iframe
              title="Winter Road Travel Data Integration Portal story map collection"
              src="https://storymaps.arcgis.com/collections/6f533a8170a84785a48d5d6810115c58"
              style={{
                display: "block",
                width: "100%",
                height: "clamp(500px, 70vh, 780px)",
                border: 0,
              }}
              allowFullScreen
              allow="geolocation"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default References;
