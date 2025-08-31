import React from "react";
//import {Typography } from "antd";
//import CanadaMap from "../../../assets/canada_map.png";
import { Container, Row, Col } from "react-bootstrap";
import CarouselHome from "../../../components/Carousel/Carousel";

import "./styles.css";

const WelcomeBanner = () => {
  return (
    <Container className="welcomeContainer" fluid>
      <Row>
        <Col xs lg="4" className="text-center my-auto">
          <h2 className="welcomeTitle">
            Welcome to WRaMP <br />
            Winter Road and Mobility Portal
          </h2>
          <p className="welcomeText">
            The Winter Road and Mobility Portal (WRaMP)
            offers an interactive map that showcases northern climate data,
            transportation systems, and social factors associated with winter road
            networks in Canada's Territorial North. The portal is designed to
            aid in decision-making and prioritize policies for managing
            winter roads impacted by climate change.
          </p>
        </Col>
        <Col xs lg="8" className="vertical-center welcomeCarousel">
          <CarouselHome />
        </Col>
      </Row>
    </Container>
  );

}

// const WelcomeBanner = () => {
//   const mobile = !Grid.useBreakpoint()["lg"];

//   return (
//     <div
//       className="welcomeBannerContainer"
//       style={{ backgroundImage: `url(${CanadaMap})` }}
//     >
//       <div className="welcomeBannerTitle">
//         <Typography style={{ color: "#0E2959" }}>
//           Welcome to the <br /> Winter Road and Trail Data Information Portal
//           (WRTDIP)
//         </Typography>
//       </div>
//       <div className="welcomeBannerText">
//         <Typography style={{ color: "#0E2959" }}>
//           The Winter Road and Trail Data Information Portal (WRTDIP) provides an
//           interactive map with northern climate data, transportation networks,
//           and social aspects of the winter road and trail networks in Canada's
//           Territorial North. The aim of this portal is to support
//           decision-making and policy prioritization on the management of winter
//           roads and trails that are impacted by climate change.
//         </Typography>
//       </div>
//     </div>
//   );
// };

export default WelcomeBanner;
