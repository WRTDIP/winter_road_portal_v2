import React from "react";
import { Grid, Layout, Menu, Typography, Card } from "antd";
import { Link } from "react-router-dom";

import { MenuOutlined } from "@ant-design/icons";
import titleImage from "../../../../assets/homebg_3.png";
import "./styles.css";

const PartnerItem = ({ props }) => {
  const { image, title, url } = props;
  return (
    <Card
      style={{
        width: 300,
      }}
    >
      <div className="partnerItemContainer">
        <div className="partnerImageContainer">
          <a href={url} target="_blank" rel="noreferrer">
            <img className="partnerImage" src={image} alt="partner" />
          </a>
        </div>
        <div className="partnerTitle">
          <a href={url} target="_blank" rel="noreferrer">
            <Typography style={{ color: "#0E2959" }}>{title}</Typography>
          </a>
        </div>
      </div>
    </Card>
  );
};

export default PartnerItem;
