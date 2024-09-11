import React from "react";
import {Typography}  from "antd";
import {Container,Row,Col} from 'react-bootstrap';
import FeatureItem from "./FeatureItem";
import "./styles.css";

const Feature = ({ props }) => {
  return (
    <Container className="featureContainer" fluid>
      <Row className="d-flex justify-content-center featureRow">
        <Typography className="featurePageTitleText ">Features</Typography>
        {props.map((content) => (
          <Col xs lg="3" className="d-flex justify-content-center">
            <FeatureItem key={content.id} props={content} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Feature;
