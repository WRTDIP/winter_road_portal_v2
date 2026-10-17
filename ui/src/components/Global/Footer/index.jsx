import React from "react";
import { Link, useLocation } from "react-router-dom";
import NavbarLogo from "../../../assets/navbarLogo.png";
import facebook from "../../../assets/facebook.png";
import { NAV_GROUPS } from "../NavigationBar/navItems";
import "./styles.css";

// The map is a full-height workspace; it gets no footer.
const HIDDEN_ON = ["/map"];

const footerLinks = NAV_GROUPS.flatMap((group) => group.items || [group]).filter(
  (item) => item.link !== "/"
);

const Footer = () => {
  const { pathname } = useLocation();
  const year = new Date().getFullYear();

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <footer className="footerContainer">
      <div className="ui-container footerGrid">
        <div className="footerBrand">
          <div id="footer-brand-container">
            <img width={110} src={NavbarLogo} alt="University of Toronto Scarborough" />
            <span className="footerBrand__divider" aria-hidden="true" />
            <span id="footer-brand-text">WRaMP</span>
          </div>
          <p className="footerBrand__text">
            The Winter Road and Mobility Portal, built by the Climate Lab at UTSC (CL@UT) with
            partners across Canada.
          </p>
        </div>

        <nav className="footerColumn" aria-label="Footer">
          <h2 className="footerColumn__title">Explore</h2>
          <ul className="footerLinks">
            {footerLinks.map((item) => (
              <li key={item.link}>
                <Link to={item.link}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footerColumn">
          <h2 className="footerColumn__title">Contact</h2>
          <address className="footerAddress">
            Department of Physical and Environmental Sciences
            <br />
            University of Toronto Scarborough
            <br />
            1265 Military Trail, Toronto, ON M1C 1A4
          </address>
          <a className="footerEmail" href="mailto:climlabutsc@gmail.com">
            climlabutsc@gmail.com
          </a>
          <div className="mediaBox">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook (opens in new tab)"
            >
              <img width={22} height={22} src={facebook} alt="" />
            </a>
          </div>
        </div>
      </div>

      <div className="ui-container footer-copyright">
        <span className="copyRightText">© {year} Climate Lab at UTSC (CL@UT)</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
};

export default Footer;
