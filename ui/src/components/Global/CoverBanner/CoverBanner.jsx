import React from "react";
import "./styles.css";

/* The page header used by every inner page: a photo band under a navy wash,
   with an optional eyebrow and one-line summary under the title. */
const CoverBanner = ({ title, subtitle, eyebrow }) => {
  return (
    <header className="coverBanner">
      <div className="ui-container coverBanner__inner">
        {eyebrow && <span className="coverBanner__eyebrow">{eyebrow}</span>}
        <h1 className="coverTitle">{title}</h1>
        {subtitle && <p className="coverBanner__subtitle">{subtitle}</p>}
      </div>
    </header>
  );
};

export default CoverBanner;
