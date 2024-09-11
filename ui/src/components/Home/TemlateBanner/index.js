import React from "react";
import {Typography } from "antd";

import "./styles.css";

const TemplateBanner = ({ props }) => {
  const { image, title, content, bgColor } = props;
  return (
    <div
      className="templateBannerContainer"
      style={{ backgroundColor: bgColor }}
    >
      <div className="templateBannerImageContainer">
        <img className="templateBannerImage" src={image} alt="templateBanner" />
      </div>
      <div className="templateBannerTitle">
        <Typography style={{ color: "#0E2959" }}>{title}</Typography>
      </div>

      <div className="templateBannerText">
        <Typography style={{ color: "#0E2959" }}>{content}</Typography>
      </div>
    </div>
  );
};

export default TemplateBanner;
