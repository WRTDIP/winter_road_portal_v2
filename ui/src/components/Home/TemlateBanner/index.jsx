import React from "react";

import "./styles.css";

/* One "impact" story on the home page: a field photograph with its text. */
const TemplateBanner = ({ props }) => {
  const { image, title, content } = props;
  return (
    <article className="templateBannerContainer">
      <img className="templateBannerImage" src={image} alt="" />
      <h3 className="templateBannerTitle">{title}</h3>
      <p className="templateBannerText">{content}</p>
    </article>
  );
};

export default TemplateBanner;
