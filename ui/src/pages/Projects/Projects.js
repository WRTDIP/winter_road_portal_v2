import { Container, Row, Col } from "react-bootstrap";
import ProjectFirst from "../../assets/smartphone_icon_colour.png";
import ProjectSecond from "../../assets/online_survey_icon.png";
import ProjectThird from "../../assets/ice_road_icon.png";
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import ProjectItem from "../../components/Projects/ProjectBanner/ProjectItem";

function Projects() {
  const BannerContents = [
    {
      id: 1,
      image: ProjectFirst,
      title: "Winter Road Watch",
      content:
        "The Winter Road Watch project is a citizen science research initiative for monitoring the impacts of climate change on winter roads in the Northwest Territories. We invite all the citizen scientists in the North to contribute to our real-time science research toward climate change adaptation.",
      bgColor: "white",
    },

    {
      id: 2,
      image: ProjectSecond,
      title: "Winter Road User Community Online Survey",
      content:
        "We will invite the Winter Road and Trail Watch observers to participate in an online survey focused on the impacts of climate change on the winter road networks in the Northwest Territories.",
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
