// import CarouselHome from "../../components/CarouselHome";

import WelcomeBanner from "../../components/Home/WelcomeBanner/WelcomeBanner"
import Explore from "../../components/Home/Explore"
import FeaturedTrend from "../../components/Home/FeaturedTrend"
import TemplateBanner from "../../components/Home/TemlateBanner"
// import bgImage from "../../assets/homebg_3.png"
import firstBanner from "../../assets/firstBanner.png"
import secondBanner from "../../assets/homebg_2.png"
import thirdBanner from "../../assets/northern_lights.png"

import firstpartners from "../../assets/Transport_Canada.png"
import secondPartners from "../../assets/UTSC.png"
import thirdPartners from "../../assets/UBC.png"
import fourthPartners from "../../assets/UofA.png"
import fifthPartners from "../../assets/GNWT.gif"
import sixthPartners from "../../assets/NRC.png"
import seventhPartners from "../../assets/CIRNAC.png"

import Partner from "../../components/Home/Partner"
import * as React from "react"

function Home() {
  const BannerContents = [
    {
      id: 1,
      image: firstBanner,
      title: "Climate Change Impacts on Winter Roads",
      content:
        "Winter road networks are critical land transportation for remote Northern communities who rely on these networks for receiving essential goods and services during winter season. The public and private transportation sectors also rely on winter road networks for their operations. A warming climate has created a shorter winter road season, unreliable road conditions, and safety concerns. ",
    },

    {
      id: 2,
      image: secondBanner,
      title: "Climate Change Impacts on Northern Transportation Networks",
      content:
        "In the North, winter roads provide relatively inexpensive overland connection to the all-season road network, which in turn connects from remote to larger communities and the rest of Canada, much passenger and freight movements for remote Northern communities and resource sites occur during the winter road season. Climate change is impacting the surface quality of the winter roads, seasonal lengths, and freight schedule such as the movements of goods and services. ",
    },
    {
      id: 3,
      image: thirdBanner,
      title: "Climate Change Impacts on Northern Communities",
      content:
        "A shorter winter road season with less reliable winter road conditions has a substantial socio-economic impact on Northern communities, particularly for remote Indigenous communities. The lack of winter road access for these remote communities has important consequences from a socio-economic perspective, for example, an increase in price of goods and services, which are already expensive in the North. ",
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

      <Explore />

      <FeaturedTrend />

      <section className="ui-section">
        <div className="ui-container">
          <div className="ui-section-head">
            <span className="ui-eyebrow">Research context</span>
            <h2>Why winter roads matter</h2>
            <p>Winter roads link remote Northern communities to the rest of Canada, and a warming climate is shortening the season they can be used.</p>
          </div>
          <div className="templateBannerGrid">
            {BannerContents.map((content) => (
              <TemplateBanner key={content.id} props={content} />
            ))}
          </div>
        </div>
      </section>

      <Partner props={PartnerContents} />
    </div>
  )
}

export default Home
