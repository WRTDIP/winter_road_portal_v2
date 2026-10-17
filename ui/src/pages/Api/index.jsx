import React from "react";
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";

function Api() {
  return (
    <div>
      <CoverBanner
        eyebrow="Data"
        title="API"
        subtitle="Programmatic access to winter road conditions, climate observations and forecasts."
      />
      <div style={{ padding: "2rem 1.5rem 4rem", color: "var(--c-ink)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem", color: "var(--c-navy-700)" }}>
            What the API will provide
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.7", marginBottom: "2rem" }}>
            The API will provide access to winter road conditions, climate and weather observations,
            forecast information, and related geospatial data for researchers, developers, and
            public applications.
          </p>

          <div
            style={{
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              padding: "1.5rem",
              background: "var(--c-bg)",
            }}
          >
            <h3 style={{ color: "var(--c-navy-700)", marginBottom: "0.5rem" }}>In development</h3>
            <p style={{ margin: 0 }}>
              This API experience is currently being built and will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Api;
