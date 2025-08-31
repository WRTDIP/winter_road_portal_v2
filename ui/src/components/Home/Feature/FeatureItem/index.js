import React from "react";
import { Link } from "react-router-dom";
import {Button,Card,Col} from "react-bootstrap";

import "./styles.css";

const FeatureItem = ({ props }) => {
  const { image, title, content, color } = props;
  return (
    <Card
      className="text-center border-0"
      style={{ width: "15rem", flex: "1" , backgroundColor: "rgb(244, 245, 250)"}}
    >
      <Card.Img className="cardImage" variant="top" src={image} />
      <Card.Body>
        <Card.Title className="featureBannerTitle" style={{ color: color }}>
          {title}</Card.Title>
        <Card.Text className="featureBannerText" style={{ color: color }}
        >{content}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default FeatureItem;
