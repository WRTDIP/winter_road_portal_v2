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
      title: "Northern Transportation Network Database",
      content: "Feel free to export the data to Excel format ",
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
