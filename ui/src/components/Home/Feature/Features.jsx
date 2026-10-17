import React from "react";
import FeatureItem from "./FeatureItem";
import "./styles.css";

const Feature = ({ props }) => {
  return (
    <section className="featureContainer ui-section ui-section--tint">
      <div className="ui-container">
        <div className="ui-section-head">
          <span className="ui-eyebrow">What you can do here</span>
          <h2>Portal features</h2>
          <p>Maps, studies and field observations for the people who plan, build and travel northern winter roads.</p>
        </div>
        <div className="featureRow">
          {props.map((content) => (
            <FeatureItem key={content.id} props={content} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Feature;
