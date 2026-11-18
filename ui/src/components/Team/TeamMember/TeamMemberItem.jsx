import React from "react";
import { MailOutlined } from "@ant-design/icons";
import Person from "../../../assets/Person.png";
import "./styles.css";

const initialsOf = (name) =>
  name
    .replace(/^Dr\.\s*/, "")
    .split(/\s+/)
    .map((part) => part[0])
    .filter((ch) => ch && /[A-Z]/.test(ch))
    .slice(0, 2)
    .join("");

const TeamMember = ({ props }) => {
  const { image, name, title, email } = props;
  // The generic person outline reads as a missing photo; show initials instead.
  const hasPhoto = image && image !== Person;
  return (
    <div className="teamRow">
      {hasPhoto ? (
        <img className="teamAvatar" src={image} alt="" />
      ) : (
        <span className="teamAvatar teamAvatar--initials" aria-hidden="true">
          {initialsOf(name)}
        </span>
      )}
      <div className="teamMemberBody">
        <h4 className="teamMemberTitle">{name}</h4>
        <p className="teamMemberText">{title}</p>
        <a className="teamMemberEmail" href={`mailto:${email}`}>
          <MailOutlined aria-hidden="true" />
          <span>{email}</span>
        </a>
      </div>
    </div>
  );
};

export default TeamMember;
