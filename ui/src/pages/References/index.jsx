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
              border: "1px solid #d9e2f0",
              borderRadius: "8px",
              padding: "1.5rem",
              background: "#f7f9fc",
            }}
          >
            <h3 style={{ color: "#38507E", marginBottom: "0.5rem" }}>Under construction</h3>
            <p style={{ margin: 0 }}>
              This page is currently under construction and will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default References;
