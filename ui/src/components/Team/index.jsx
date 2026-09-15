import { Container,Row,Col } from "react-bootstrap";
import TeamMember from "./TeamMember/TeamMemberItem";
import "./styles.css";
function Team({teamName, description, teamMemberInfo}) {
  
  return (
    <Container className="teamContainer">
      <div className="teamTitle">{teamName}</div>
      {description}
      <div className="teamLineBreak"></div>
      <Row className="">
        {teamMemberInfo.map((content) => (
          <Col xs={12} lg={6} key={content.id}>
            <TeamMember props={content} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Team;
