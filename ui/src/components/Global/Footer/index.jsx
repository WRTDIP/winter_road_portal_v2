import React from "react";
import { Typography } from "antd";
import NavbarLogo from "../../../assets/navbarLogo.png";
import facebook from "../../../assets/facebook.png";
// import twitter from "../../../assets/twitter.png";
import "./styles.css";

const UTSCLogo = () => {
  return (
    <div id={"footer-brand-container"}>
      <img width={110} src={NavbarLogo} alt="Climate Lab at UTSC" />
      <div id="footer-brand-text">
        CL@UT
      </div>
    </div>
  );
};

const CopyRight = () => {
  const year = new Date().getFullYear(); // returns the current year
  return (
    <div className="footer-copyright">
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
      <div className="mediaBox">
        <Typography className="mediaBoxText">Follow us</Typography>
        {/*<a href="http://twitter.com" target="_blank">
          <img style={{ width: "30px" }} src={twitter}></img>
        </a>*/}
        <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook (opens in new tab)">
          <img width={30} height={30} src={facebook} alt="" />
        </a>
      </div>
    </>
  );
};

const Footer = () => {
  return (
    <footer className="footerContainer">
      <UTSCLogo />
      <CopyRight />
      <MediaBox />
    </footer>
  );
};

export default Footer;
