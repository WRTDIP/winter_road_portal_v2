import { Container,Row,Col } from "react-bootstrap";
import TeamMember from "./TeamMember/TeamMemberItem";
import "./styles.css";
function Team({teamName, teamMemberInfo}) {
  
  return (
    <Container className="teamContainer">
      <div className="teamTitle">{teamName}</div>
      <div className="teamLineBreak"></div>
      <Row className="">
        {teamMemberInfo.map((content) => (
          <Col xs lg="6">
            <TeamMember key={content.id} props={content} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Team;
