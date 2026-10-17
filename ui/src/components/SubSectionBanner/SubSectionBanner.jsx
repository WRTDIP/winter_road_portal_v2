import React from "react";
import "./styles.css";

const SubSectionBanner = ({ props }) => {
  const { title, content } = props;
  return (
    <div className="subSectionBannerContainer">
      <div className="subSectionBannerTextContainer">
        <h2 className="subSectionBannerTitle">{title}</h2>
        <p className="subSectionBannerContent">{content}</p>
      </div>
    </div>
  );
};

export default SubSectionBanner;
