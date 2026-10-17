import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";

import "./styles.css";

/* A feature card. The whole card is the link to the page it describes. */
const FeatureItem = ({ props }) => {
  const { image, title, content, link, cta = "Learn more" } = props;
  return (
    <Link to={link} className="featureCard u-nohover-move">
      <span className="featureCard__icon">
        <img className="cardImage" src={image} alt="" />
      </span>
      <h3 className="featureBannerTitle">{title}</h3>
      <p className="featureBannerText">{content}</p>
      <span className="featureCard__cta">
        {cta}
        <ArrowRightOutlined aria-hidden="true" />
      </span>
    </Link>
  );
};

export default FeatureItem;
