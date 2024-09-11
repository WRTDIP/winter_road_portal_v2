import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import "./styles.css";

const TeamMember = ({ props }) => {
  const { image, name, title, email } = props;
  return (
    <Row className="teamRow">
      <Col xs lg="5">
        <Card.Img variant="top" src={image}></Card.Img>
      </Col>
      <Col xs lg="7">
        <Card.Body>
          <Card.Title className="teamMemberTitle p-1 ">{name}</Card.Title>
          <Card.Text className="teamMemberText p-1">{title}</Card.Text>
          <Card.Text className="teamMemberText p-1">
            <a href={email}>{email}</a>
          </Card.Text>
        </Card.Body>
      </Col>
    </Row>
  );
};

export default TeamMember;
