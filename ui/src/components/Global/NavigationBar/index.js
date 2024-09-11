import React from "react";
import { Grid, Layout, Menu } from "antd";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import NavbarLogo from "../../../assets/navbarLogo.png";
import "./styles.css";

const leftItems = [];
const rightItems = [
  { name: "Home", link: "/" },
  //{ name: "Map", link: "https://climatechange.utsc.utoronto.ca/esri_leaflet/map.html", newTab: true },
  { name: "Map", link: "/map" },
  { name: "Projects", link: "/projects" },
  { name: "Observation", link: "/observation" },
  { name: "Transportation", link: "/transportation" },
  { name: "About", link: "/about" },

  { name: "", link: "/login", icon: <UserOutlined style={{ fontSize: 20 }} /> },
];

const menuItem = (i) => (
  <Menu.Item key={i.name}>
    {i.newTab ? (
      <a
        href={i.link}
        target={"_blank"}
        rel={"noreferrer"}
        className="menuLink"
      >
        {i.name}
      </a>
    ) : (
      <Link to={i.link} className="menuLink">
        {i.icon} {i.name}
      </Link>
    )}
  </Menu.Item>
);

const NavigationBar = () => {
  const mobile = !Grid.useBreakpoint()["lg"];
  const menuItems = (
    <>
      {leftItems.map(menuItem)}
      <Menu.SubMenu
        key={"navbar-divider"}
        style={{ flexGrow: 1, visibility: "hidden"}}
      />
      {rightItems.map(menuItem)}
    </>
  );

  return (
    <Layout style={{ background: "rgb(54, 76, 119)" }}>
      <Layout.Header style={{ background: "rgb(54, 76, 119)" }}>
        <Menu
          mode={"horizontal"}
          theme={"dark"}
          disabledOverflow={true}
          style={{ display: "flex", background: "rgb(54, 76, 119)" }}
        >
          <Menu.Item
            style={{ flexGrow: mobile && 1, background: "rgb(54, 76, 119)" }}
            key={"Home"}
          >
            <Link to={"/"}>
              <div id={"navbar-item-elcano-container"}>
                <img width={110} src={NavbarLogo} alt="logo" />
                <div id="navbar-item-elcano-text">Climate Lab @ UTSC</div>
              </div>
            </Link>
          </Menu.Item>
          {mobile ? (
            <Menu.SubMenu
              key={"MobileMenu"}
              title={""}
              icon={<MenuOutlined />}
              children={menuItems}
            />
          ) : (
            menuItems
          )}
        </Menu>
      </Layout.Header>
      <Layout.Content></Layout.Content>
    </Layout>
  );
};

export default NavigationBar;
