import TeamMember from "./TeamMember/TeamMemberItem";
import "./styles.css";

function Team({ teamName, institution, description, teamMemberInfo }) {
  return (
    <article className="teamContainer">
      <header className="teamHeader">
        <h3 className="teamTitle">{teamName}</h3>
        {institution && <p className="teamInstitution">{institution}</p>}
        <p className="teamDescription">{description}</p>
      </header>
      <ul className="teamGrid">
        {teamMemberInfo.map((content) => (
          <li key={content.id}>
            <TeamMember props={content} />
          </li>
        ))}
      </ul>
    </article>
  );
}

export default Team;
