import React, { useEffect, useState } from "react";
import { Button, Drawer } from "antd";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import NavbarLogo from "../../../assets/navbarLogo.png";
import "./styles.css";

const rightItems = [
  { name: "Home", link: "/" },
  //{ name: "Map", link: "https://climatechange.utsc.utoronto.ca/esri_leaflet/map.html", newTab: true },
  { name: "Map", link: "/map" },
  { name: "Projects", link: "/projects" },
  { name: "Observation", link: "/observation" },
  { name: "Transportation", link: "/transportation" },
  { name: "Download", link: "/download" },
  { name: "API", link: "/api" },
  { name: "References", link: "/references" },
  { name: "Blog", link: "/blog" },
  { name: "About", link: "/about" },

  { name: "Account", link: "/login", icon: <UserOutlined /> },
];

const NavigationBar = () => {
  const compact = !useBreakpoint().xxl;
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname, compact]);

  const links = rightItems.map((item) => (
    <Link
      key={item.link}
      to={item.link}
      className="menuLink"
      aria-current={pathname === item.link ? "page" : undefined}
      onClick={() => setOpen(false)}
    >
      {item.icon}
      <span>{item.name}</span>
    </Link>
  ));

  return (
    <header className="portal-header" id="top">
      <Link to="/" className="portal-brand" aria-label="Climate Lab at UTSC home">
        <img width={110} src={NavbarLogo} alt="" />
        <span>Climate Lab @ UTSC</span>
      </Link>
      {compact ? (
        <Button
          className="portal-menu-toggle"
          icon={<MenuOutlined />}
          aria-label="Open navigation"
          aria-expanded={open}
          aria-controls={open ? "portal-mobile-navigation" : undefined}
          onClick={() => setOpen(true)}
        />
      ) : (
        <nav className="portal-desktop-navigation" aria-label="Main navigation">{links}</nav>
      )}
      <Drawer
        className="portal-navigation-drawer"
        title="Navigation"
        placement="right"
        width="min(340px, 100%)"
        visible={compact && open}
        onClose={() => setOpen(false)}
      >
        <nav id="portal-mobile-navigation" aria-label="Main navigation">{links}</nav>
      </Drawer>
    </header>
  );
};

export default NavigationBar;
