import { Container, Row, Col } from "react-bootstrap";
import ProjectFirst from "../../assets/smartphone_icon_colour.png";
import ProjectSecond from "../../assets/online_survey_icon.png";
import ProjectThird from "../../assets/ice_road_icon.png";
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import ProjectItem from "../../components/Projects/ProjectBanner/ProjectItem";
import WRWatchInstruction from "../../assets/2025-06_Winter_Road_Watch_Instruction.pdf";
import WRWatchQR from "../../assets/2025-06_Winter_Road_Watch_QR_Code.pdf";
import WRWatchWorkflows from "../../assets/2025-06_Winter_Road_Watch_Data_Collection_Workflows.pdf";

function Projects() {
  const BannerContents = [
    {
      id: 1,
      image: ProjectFirst,
      title: "Winter Road Watch",
      content: (
        <>
          The Winter Road Watch project is a citizen science research initiative for monitoring the impacts of climate change on winter roads in the Northwest Territories. 
          We invite all the citizen scientists in the North to contribute to our real-time science research toward climate change adaptation.
          <br />
          <br />
          <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Getting Started</span>
          <br />
          To participate, please read the step-by-step instructions for the Winter Road Watch Survey123 App on how to set up and contribute your observations.
          <br />
          <a href={WRWatchInstruction} target="_blank" rel="noopener noreferrer">
            Download the Winter Road Watch Survey123 App Instruction
          </a>
          <br />
          <br />
          To view the workflows for the Winter Road Watch, please download the Winter Road Watch Data Collection Workflows document.
          <br />
          <a href={WRWatchWorkflows} target="_blank" rel="noopener noreferrer">
            Download the Winter Road Watch Data Collection Workflows
          </a>
          <br />
          <br />
          To download the Winter Road Watch survey on your mobile device, please scan the QR code. Also, scan the code to view observations from others on the mobile version of the interactive web map.
          <br />
          <span>
          <strong>Note: We recommend viewing the interactive web map on a larger screen (e.g., computer or tablet). 
            For a more user-friendly experience, please go to the 'Observation' tab on the web browser screen.
            </strong>
          </span>
          <br />
          <a href={WRWatchQR} target="_blank" rel="noopener noreferrer">
            Download the Winter Road Watch QR code
          </a>
        </>
      ),        
      bgColor: "white",
    },

    {
      id: 2,
      image: ProjectSecond,
      title: "Winter Road User Community Online Survey",
      content:
        "We invite Winter Road Watch observers to participate in an online survey focused on the impacts of climate change on the winter road networks in the Northwest Territories.",
      bgColor: "#F7FAEF",
    },
    {
      id: 3,
      image: ProjectThird,
      title: "Winter Road Profile",
      content:
        "All winter roads have a unique physical feature. Lean more about each winter road network and how climate change has been impacting them.",
      bgColor: "white",
    },
  ];
  return (
    <Container className="p-0" fluid>
      <CoverBanner title="Projects" />
      <div className="mt-2 mb-5">
        {BannerContents.map((content) => (
          // <TemplateBanner key={content.id} props={content} />
          <ProjectItem key={content.id} props={content} />
        ))}
      </div>
    </Container>
  );
}

export default Projects;
