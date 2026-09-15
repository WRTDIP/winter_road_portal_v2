import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import "./styles.css";

const TeamMember = ({ props }) => {
  const { image, name, title, email } = props;
  return (
    <Row className="teamRow">
      <Col xs={12} sm={5}>
        <Card.Img variant="top" src={image} alt={name}></Card.Img>
      </Col>
      <Col xs={12} sm={7}>
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
