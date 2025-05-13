import React from "react";
import { Grid, Layout, Menu, Typography } from "antd";
import { Link } from "react-router-dom";
import CanadaMap from "../../assets/canada_map.png";
import { MenuOutlined } from "@ant-design/icons";
import titleImage from "../../assets/homebg_3.png";
import "./styles.css";

const SubSectionBanner = ({ props }) => {
  const { image, title, content, bgColor } = props;
  return (
    <div
      className="subSectionBannerContainer"
      style={{ backgroundColor: bgColor }}
    >
      <div className="subSectionBannerTextContainer">
      <div className="subSectionBannerTitle">{title}</div>
      <div className="subSectionBannerContent">{content}</div>
      </div>
    </div>
  );
};

export default SubSectionBanner;
