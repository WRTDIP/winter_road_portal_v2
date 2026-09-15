import React from "react";
import {Row,Col, Card} from 'react-bootstrap';
import "./styles.css"
const ProjectItem = ({ props }) => {
  const { id, image, title, content } = props;
  return (
    <Row as="article" className="projectRow" aria-labelledby={`project-title-${id}`}>
      <Col xs={12} lg={2} className="projectImageColumn">
        <img className="projectImage" src={image} alt="" />
      </Col>
      <Col xs={12} lg={10} className="projectContentColumn">
        <Card.Body className="projectItemBody">
          <Card.Title as="h2" id={`project-title-${id}`} className="projectItemTitle">{title}</Card.Title>
          <div className="projectLineBreak" aria-hidden="true"></div>
          <div className="projectItemText">{content}</div>
        </Card.Body>
      </Col>
    </Row>
  );
};

export default ProjectItem;
