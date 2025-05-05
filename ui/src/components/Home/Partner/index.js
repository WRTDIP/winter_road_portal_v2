import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./styles.css";

const Partner = ({ props }) => {
  return (
    <Container class="row justify-content-center">
      <div className="partnerPageTitleText">Partners</div>
      <Row className="justify-content-md-center">
        {props.map((content) => (
          <Col xs lg="3" align="center" className="p-3" key={content.id}>
            <a href={content.url} target="_blank" rel="noopener noreferrer">
            <img src={content.image} className="img-fluid" width="150" alt={content.title} />
            </a>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Partner;
