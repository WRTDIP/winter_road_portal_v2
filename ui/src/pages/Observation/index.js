import ObservationFirst from "../../assets/group_icon.png";

import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import SubSectionBanner from "../../components/SubSectionBanner/SubSectionBanner";
import "./styles.css";
function Observation() {
  const BannerContents = [
    {
      id: 1,
      image: ObservationFirst,
      title: "Winter Road Watch",
      content: "Feel free to export the data to Excel format ",
      bgColor: "white",
    },
  ];
  return (
    <div>
      <CoverBanner title="Observation" />
      <SubSectionBanner props={BannerContents[0]} />
      <div className="observationIframeContainer">
        <iframe
          className="observationIframe"
          src="https://utoronto.maps.arcgis.com/apps/webappviewer/index.html?id=af09da1db14c49a79bd8bad1eb6abde5"
        ></iframe>
      </div>
    </div>
  );
}

export default Observation;
