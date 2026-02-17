import TransportationFirst from "../../assets/big_data_icon.png";

import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
//import ProjectBanner from "../../components/Projects/ProjectBanner/ProjectItem";
import SubSectionBanner from "../../components/SubSectionBanner/SubSectionBanner";
function Transportation() {
  const BannerContents = [
    {
      id: 1,
      image: TransportationFirst,
      title: "Winter Road Transportation Network Study",
      content: "Explore comprehensive research and insights into Northern winter transportation systems and infrastructure.",
      bgColor: "white",
    },
  ];
  return (
    <div>
      <CoverBanner title="Transportation" />
      <SubSectionBanner props={BannerContents[0]} />
      <p style={{ textAlign: 'center', fontSize: '18px', color: '#333' }}>
        For more details, visit{" "}
        <a
          href="https://storymaps.arcgis.com/collections/6f533a8170a84785a48d5d6810115c58"
          target="_blank"
          rel="noopener noreferrer"
        >
          this ArcGIS StoryMap Collection
        </a>
        .
      </p>
    </div>
  );
}

export default Transportation;
