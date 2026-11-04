import TransportationFirst from "../../assets/big_data_icon.png";

import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
// import ProjectBanner from "../../components/Projects/ProjectBanner/ProjectItem";
import SubSectionBanner from "../../components/SubSectionBanner/SubSectionBanner";
function Transportation() {
  const BannerContents = [
    {
      id: 1,
      image: TransportationFirst,
      title: "Northern Transportation Network Study",
      content: "Explore comprehensive research and insights into Northern transportation systems and infrastructure.",
      bgColor: "white",
    },
  ];
  return (
    <div>
      <CoverBanner
        eyebrow="Research"
        title="Transportation"
        subtitle="How northern transportation networks move people and freight, and how climate change is affecting them."
      />
      <SubSectionBanner props={BannerContents[0]} />
      <div className="subSectionAction">
        <a
          className="ui-btn ui-btn--primary"
          href="https://storymaps.arcgis.com/collections/6f533a8170a84785a48d5d6810115c58"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open our ArcGIS StoryMap Collection ↗
        </a>
      </div>
    </div>
  );
}

export default Transportation;
