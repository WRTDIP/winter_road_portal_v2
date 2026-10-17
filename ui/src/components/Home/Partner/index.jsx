import React from "react";
import "./styles.css";

const Partner = ({ props }) => {
  return (
    <section className="ui-section">
      <div className="ui-container">
        <div className="ui-section-head">
          <span className="ui-eyebrow">Partners</span>
          <h2>Built together</h2>
          <p>
            We gratefully acknowledge the support and collaboration of our partner organizations to
            develop the WRaMP - Winter Road and Mobility Portal.
          </p>
        </div>
        <ul className="partnerGrid">
          {props.map((content) => (
            <li key={content.id}>
              <a
                className="partnerTile"
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={content.image} alt={content.title} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Partner;
