import React from "react";
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";

function Api() {
  return (
    <div>
      <CoverBanner title="API" />
      <div style={{ padding: "2rem 1.5rem 4rem", color: "#0E2959" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#38507E" }}>
            What the API will provide
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.7", marginBottom: "2rem" }}>
            The API will provide access to winter road conditions, climate and weather observations,
            forecast information, and related geospatial data for researchers, developers, and
            public applications.
          </p>

          <div
            style={{
              border: "1px solid #d9e2f0",
              borderRadius: "8px",
              padding: "1.5rem",
              background: "#f7f9fc",
            }}
          >
            <h3 style={{ color: "#38507E", marginBottom: "0.5rem" }}>In development</h3>
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
