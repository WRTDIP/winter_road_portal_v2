import ObservationFirst from "../../assets/Winter_Road_Watch_page.png";

import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import SubSectionBanner from "../../components/SubSectionBanner/SubSectionBanner";
import "./styles.css";
function Observation() {
  const BannerContents = [
    {
      id: 1,
      image: ObservationFirst,
      title: "Winter Road Watch",
      content: "Click the link below to view the interactive web map.",
      bgColor: "white",
    },
  ];
  return (
    <div>
      <CoverBanner
        eyebrow="Winter Road Watch"
        title="Observation"
        subtitle="Road condition reports collected by citizen scientists across the Northwest Territories."
      />
      <SubSectionBanner props={BannerContents[0]} />
      <div className="observationIframeContainer">
        <a
          className="observationPreview"
          href="https://experience.arcgis.com/experience/53a7d50029164034802c870e8c7e72ae"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={ObservationFirst}
            alt="Preview of the Winter Road Watch map"
            className="mapImage"
          />
          <span className="observationPreview__cta ui-btn ui-btn--primary">
            Open the interactive web map ↗
          </span>
        </a>
      </div>
    </div>
  );
}

export default Observation;

// iframe won't work, so I use above code instead. Below is the code for iframe

// <div className="observationIframeContainer">
       // <iframe
          // className="observationIframe"
          // src="https://utoronto.maps.arcgis.com/apps/webappviewer/index.html?id=af09da1db14c49a79bd8bad1eb6abde5"
          // title="Winter Road Watch Map"
          // style={{ width: "100%", height: "600px", border: "none"}}
        // ></iframe>
      // </div>
    // <div>