import React from "react";
import { Grid, Layout, Menu, Typography } from "antd";
import { Link } from "react-router-dom";
import CanadaMap from "../../../assets/canada_map.png";
import NavbarLogo from "../../../assets/navbarLogo.png";
import { MenuOutlined } from "@ant-design/icons";
import homebg_3 from "../../../assets/homebg_3.png";
import facebook from "../../../assets/facebook.png";
import twitter from "../../../assets/twitter.png";
import "./styles.css";

const UTSCLogo = () => {
  return (
    <div id={"navbar-item-elcano-container"} style = {{marginLeft: "2%"}}>
      <img width={110} src={NavbarLogo} alt="logo" />
      <div id="navbar-item-elcano-text">
        CL@UT
      </div>
    </div>
  );
};

const CopyRight = () => {
  const year = new Date().getFullYear(); // returns the current year
  return (
    <div style={{ margin: "auto", textAlign: "center" }}>
      <Typography className="copyRightText">
        Copyright © {year} CL@UT
      </Typography>
      <a href="#top"> Go to top</a>
    </div>
  );
};

const MediaBox = () => {
  return (
    <>
      <div className="mediaBox" style={{ marginRight: "1%" }}>
        <Typography className="mediaBoxText">Follow us</Typography>
        <a href="http://twitter.com" target="_blank">
          <img style={{ width: "30px" }} src={twitter}></img>
        </a>
        <a href="http://facebook.com" target="_blank">
          <img style={{ width: "30px" }} src={facebook}></img>
        </a>
      </div>
    </>
  );
};

const Footer = () => {
  const mobile = !Grid.useBreakpoint()["lg"];

  return (
    <div className="footerContainer">
      <UTSCLogo />
      <CopyRight />
      <MediaBox />
    </div>
  );
};

export default Footer;
