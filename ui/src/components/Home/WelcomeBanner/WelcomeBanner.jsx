import React from "react";
import { Link } from "react-router-dom";
import iceRoad from "../../../assets/homebg_3.1.png";
import clearIce from "../../../assets/homebg_4.png";
import plowedRoad from "../../../assets/homebg_1.png";

import "./styles.css";

const WelcomeBanner = () => {
  return (
    <section className="welcomeContainer">
      <div className="ui-container welcomeGrid">
        <div className="welcomeCopy">
          <span className="ui-eyebrow">Climate Lab at UTSC · University of Toronto Scarborough</span>
          <h1 className="welcomeTitle">Winter Road and Mobility Portal</h1>
          <p className="welcomeText">
            The Winter Road and Mobility Portal (WRaMP) offers an interactive map that showcases
            northern climate data, transportation systems, and social factors associated with winter
            road networks in Canada's Territorial North. The portal is designed to aid in
            decision-making and prioritize policies for managing winter roads impacted by climate
            change.
          </p>
          <div className="welcomeActions">
            <Link to="/map" className="ui-btn ui-btn--primary">
              Explore the map
            </Link>
            <Link to="/download" className="ui-btn ui-btn--secondary">
              Download climate data
            </Link>
          </div>
        </div>

        <div className="welcomePhotos">
          <img
            className="welcomePhotos__main"
            src={iceRoad}
            alt="A wide ice road through boreal forest under a blue sky"
          />
          <img
            className="welcomePhotos__side"
            src={clearIce}
            alt="Cleared lanes of clear blue ice on a winter road"
          />
          <img
            className="welcomePhotos__side"
            src={plowedRoad}
            alt="A plowed winter road crossing snow-covered ground"
          />
        </div>
      </div>
    </section>
  );
};

export default WelcomeBanner;
