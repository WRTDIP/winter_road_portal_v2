import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightOutlined, DownloadOutlined } from "@ant-design/icons";
import CarouselHome from "../../Carousel/Carousel";

import "./styles.css";

const WelcomeBanner = () => {
  return (
    <section className="welcomeContainer">
      <div className="ui-container welcomeGrid">
        <div className="welcomeCopy">
          <span className="welcomeEyebrow">WRaMP · Canada's Territorial North</span>
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
              <ArrowRightOutlined aria-hidden="true" />
            </Link>
            <Link to="/download" className="ui-btn ui-btn--ghost">
              <DownloadOutlined aria-hidden="true" />
              Download climate data
            </Link>
          </div>
        </div>
        <div className="welcomeCarousel">
          <CarouselHome />
        </div>
      </div>
    </section>
  );
};

export default WelcomeBanner;
