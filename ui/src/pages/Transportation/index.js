import TransportationFirst from "../../assets/big_data_icon.png";

import DataTable from "../../components/DataTable";
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import ProjectBanner from "../../components/Projects/ProjectBanner/ProjectItem";
import SubSectionBanner from "../../components/SubSectionBanner/SubSectionBanner";
function Transportation() {
  const BannerContents = [
    {
      id: 1,
      image: TransportationFirst,
      title: "Northern Transportation Network Study",
      content: "Learn more about studies and projects related to Northern transportation.",
      bgColor: "white",
    },
  ];
  return (
    <div>
      <CoverBanner title="Transportation" />
      <SubSectionBanner props={BannerContents[0]} />
      <DataTable />
    </div>
  );
}

export default Transportation;
