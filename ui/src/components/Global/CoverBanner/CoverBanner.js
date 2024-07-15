import React from "react";
import { Grid, Typography } from "antd";
import coverBannerBg from "../../../assets/winterBanner.jpg";
import Card from "react-bootstrap/Card";
import "./styles.css";

const CoverBanner = ({title}) => {
  return (
    <Card className="text-white coverBanner">
      <div className="coverImageBanner"></div>
      {/* <Card.Img src={coverBannerBg} alt="Card image" className="coverImage"/> */}
      <Card.ImgOverlay className="coverDiv">
        <div>
          <h1 className="coverTitle">{title}</h1>
        </div>
      </Card.ImgOverlay>
    </Card>
  );
};

export default CoverBanner;
