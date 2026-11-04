import React, { useEffect, useRef, useState } from "react";
import { Drawer } from "antd";
import { DownOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import NavbarLogo from "../../../assets/navbarLogo.png";
import { NAV_GROUPS } from "./navItems";
import "./styles.css";

const isActive = (item, pathname) =>
  item.items ? item.items.some((child) => child.link === pathname) : item.link === pathname;

/* One grouped entry in the desktop bar. Opens on click, hover or keyboard;
   Escape, an outside tap or leaving the group closes it. */
const NavMenu = ({ group, pathname }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const menuId = `nav-menu-${group.name.toLowerCase()}`;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      className="portal-nav-group"
      ref={wrapRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => {
        if (!wrapRef.current?.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        className="portal-nav-link"
        aria-expanded={open}
        aria-controls={menuId}
        data-active={isActive(group, pathname) || undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{group.name}</span>
        <DownOutlined className="portal-nav-caret" aria-hidden="true" />
      </button>
      <div id={menuId} className="portal-nav-menu" hidden={!open}>
        {group.items.map((item) => (
          <Link
            key={item.link}
            to={item.link}
            className="portal-nav-menu__item"
            aria-current={pathname === item.link ? "page" : undefined}
          >
            <span className="portal-nav-menu__name">{item.name}</span>
            <span className="portal-nav-menu__hint">{item.hint}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const NavigationBar = () => {
  const compact = !useBreakpoint().lg;
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname, compact]);

  return (
    <header className="portal-header" id="top">
      <Link to="/" className="portal-brand" aria-label="Climate Lab at UTSC home">
        <img src={NavbarLogo} alt="" />
        <span>Climate Lab @ UTSC</span>
      </Link>

      {compact ? (
        <button
          type="button"
          className="portal-menu-toggle"
          aria-label="Open navigation"
          aria-expanded={open}
          aria-controls={open ? "portal-mobile-navigation" : undefined}
          onClick={() => setOpen(true)}
        >
          <MenuOutlined aria-hidden="true" />
        </button>
      ) : (
        <>
          <nav className="portal-desktop-navigation" aria-label="Main navigation">
            {NAV_GROUPS.map((group) =>
              group.items ? (
                <NavMenu key={group.name} group={group} pathname={pathname} />
              ) : (
                <Link
                  key={group.link}
                  to={group.link}
                  className="portal-nav-link"
                  aria-current={pathname === group.link ? "page" : undefined}
                >
                  {group.name}
                </Link>
              )
            )}
          </nav>
          <Link
            to="/login"
            className="portal-account"
            aria-label="Account"
            aria-current={pathname === "/login" ? "page" : undefined}
          >
            <UserOutlined aria-hidden="true" />
          </Link>
        </>
      )}

      <Drawer
        className="portal-navigation-drawer"
        title="WRaMP"
        placement="right"
        width="min(340px, 100%)"
        visible={compact && open}
        onClose={() => setOpen(false)}
      >
        <nav id="portal-mobile-navigation" aria-label="Main navigation">
          {NAV_GROUPS.map((group) =>
            group.items ? (
              <div key={group.name} className="portal-drawer-group">
                <span className="portal-drawer-group__label">{group.name}</span>
                {group.items.map((item) => (
                  <Link
                    key={item.link}
                    to={item.link}
                    className="menuLink"
                    aria-current={pathname === item.link ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={group.link}
                to={group.link}
                className="menuLink"
                aria-current={pathname === group.link ? "page" : undefined}
              >
                {group.name}
              </Link>
            )
          )}
          <Link
            to="/login"
            className="menuLink menuLink--account"
            aria-current={pathname === "/login" ? "page" : undefined}
          >
            <UserOutlined aria-hidden="true" />
            <span>Account</span>
          </Link>
        </nav>
      </Drawer>
    </header>
  );
};

export default NavigationBar;
