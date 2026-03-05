import React from "react";
import {Row,Col, Card, Button} from 'react-bootstrap';
import "./styles.css"
const ProjectItem = ({ props }) => {
  const { image, title, content, bgColor } = props;
  return (
    <Row className="projectRow">
      <Col xs lg="2">
        <Card.Img variant="top" src={image}></Card.Img>
      </Col>
      <Col xs lg="10">
        <Card.Body>
          <Card.Title className="projectItemTitle p-1 ">{title}</Card.Title>
          <div className="projectLineBreak"></div>
          <Card.Text className="projectItemText p-1">{content}</Card.Text>
          {/*<Button className="projectItemButton">See more</Button>*/}
        </Card.Body>
      </Col>
    </Row>
  ); // The "See more" button is commented out because it may not have a defined action or link at this time. It can be added back in once there is a clear purpose for the button, such as linking to a detailed project page or opening a modal with more information about the project.
};

export default ProjectItem;
