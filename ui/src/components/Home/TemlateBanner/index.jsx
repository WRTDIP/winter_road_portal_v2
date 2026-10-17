import React from "react";

import "./styles.css";

/* One "impact" story on the home page: a photo card with its title and text. */
const TemplateBanner = ({ props }) => {
  const { image, title, content, tag } = props;
  return (
    <article className="templateBannerContainer">
      <div className="templateBannerImageContainer">
        <img className="templateBannerImage" src={image} alt="" />
        {tag && <span className="templateBannerTag">{tag}</span>}
      </div>
      <div className="templateBannerBody">
        <h3 className="templateBannerTitle">{title}</h3>
        <p className="templateBannerText">{content}</p>
      </div>
    </article>
  );
};

export default TemplateBanner;
