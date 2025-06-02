// import CarouselHome from "../../components/CarouselHome";

import WelcomeBanner from "../../components/Home/WelcomeBanner/WelcomeBanner"
import Feature from "../../components/Home/Feature/Features"
import TemplateBanner from "../../components/Home/TemlateBanner"
// import bgImage from "../../assets/homebg_3.png"
import firstBanner from "../../assets/firstBanner.png"
import secondBanner from "../../assets/transportation.png"
import thirdBanner from "../../assets/northern_lights.png"

import firstfeatures from "../../assets/map_icon.png"
import secondFeatures from "../../assets/presentation_icon.png"
import thirdFeatures from "../../assets/smartphone_icon.png"
import fourthFeatures from "../../assets/ice_road_icon.png"

import firstpartners from "../../assets/Transport_Canada.png"
import secondPartners from "../../assets/UTSC.png"
import thirdPartners from "../../assets/UBC.png"
import fourthPartners from "../../assets/UofA.png"
import fifthPartners from "../../assets/GNWT.gif"
import sixthPartners from "../../assets/NRC.png"
import seventhPartners from "../../assets/CIRNAC.png"

import Partner from "../../components/Home/Partner"
import Footer from "../../components/Global/Footer"
import FDDChart from "../../components/Chart/FDDChart"
import * as React from "react"
import { LineChart } from "@mui/x-charts/LineChart"

function Home() {
  const BannerContents = [
    {
      id: 1,
      image: firstBanner,
      title: "Climate Change Impacts on Winter Roads",
      content:
        "Winter road networks are critical land transportation for remote Northern communities who rely on these networks for receiving essential goods and services during winter season. The public and private transportation sectors also rely on winter road networks for their operations. A warming climate has created a shorter winter road season, unreliable road conditions, and safety concerns. ",
      bgColor: "white",
    },

    {
      id: 2,
      image: secondBanner,
      title: "Climate Change Impacts on Northern Transportation Networks",
      content:
        "In the North, winter roads provide relatively inexpensive overland connection to the all-season road network, which in turn connects from remote to larger communities and the rest of Canada, much passenger and freight movements for remote Northern communities and resource sites occur during the winter road season. Climate change is impacting the surface quality of the winter roads, seasonal lengths, and freight schedule such as the movements of goods and services. ",
      bgColor: "rgb(244, 245, 250)",
    },
    {
      id: 3,
      image: thirdBanner,
      title: "Climate Change Impacts on Northern Communities",
      content:
        "A shorter winter road season with less reliable winter road conditions has a substantial socio-economic impact on Northern communities, particularly for remote Indigenous communities. The lack of winter road access for these remote communities has important consequences from a socio-economic perspective, for example, an increase in price of goods and services, which are already expensive in the North. ",
      bgColor: "white",
    },
  ]

  const FeatureContents = [
    {
      id: 1,
      image: firstfeatures,
      title: "Interactive Map",
      content:
        "Where can you find the winter roads? How is climate change affecting these winter roads? Our interactive map provides an opportunity to explore Northern transportation networks, climate change impacts, and socio-economic information. ",
      bgColor: "white",
      color: "#0E2959",
    },
    {
      id: 2,
      image: secondFeatures,
      title: "Northern Transportation Network Study",
      content:
        "We present studies and data related to Northern transportation.",
      bgColor: "white",
      color: "#0E2959",
    },
    {
      id: 3,
      image: thirdFeatures,
      title: "Winter Road Watch App",
      content:
        "Our portal is also linked to the Winter Road Watch app which is a monitoring tool for tracking changes on the winter road conditions.",
      bgColor: "white",
      color: "#0E2959",
    },
    {
      id: 4,
      image: fourthFeatures,
      title: "Winter Road Profile",
      content:
        "All winter roads have a unique physical feature. Learn more about each winter road network and how climate change has been impacting them.",
      bgColor: "white",
      color: "#0E2959",
    },
  ]

  const PartnerContents = [
    {
      id: 1,
      image: firstpartners,
      title: "Transport Canada",
      url: "https://tc.canada.ca/en",
    },
    {
      id: 2,
      image: secondPartners,
      title: "University of Toronto Scarborough",
      url: "https://www.utsc.utoronto.ca/",
    },

    {
      id: 3,
      image: thirdPartners,
      title: "University of British Columbia",
      url: "https://www.ubc.ca/",
    },
    {
      id: 4,
      image: fourthPartners,
      title: "University of Alberta",
      url: "https://www.ualberta.ca/",
    },
    {
      id: 5,
      image: fifthPartners,
      title: "GNWT/GTNO Infrastructure",
      url: "https://www.inf.gov.nt.ca/en",
    },
    {
      id: 6,
      image: sixthPartners,
      title: "National Research Council Canada",
      url: "https://nrc.canada.ca/en",
    },
    {
      id: 7,
      image: seventhPartners,
      title: "Crown-Indigenous Relations and Northern Affairs Canada",
      url: "https://www.canada.ca/en/crown-indigenous-relations-northern-affairs.html",
    },
  ]

  return (
    <div>
      <WelcomeBanner />
      {/* This is used to loop through all the content item in the contents, and generate banners */}
      {BannerContents.map((content) => (
        <TemplateBanner key={content.id} props={content} />
      ))}
      <Feature props={FeatureContents} />
      <Partner props={PartnerContents} />
    </div>
  )
}

export default Home
