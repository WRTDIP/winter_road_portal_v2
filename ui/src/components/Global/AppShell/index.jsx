import React from "react";
import { useLocation } from "react-router-dom";

/* Routes that own the whole phone screen. The map is an app surface, not a
   document: a footer under it is 132px of chrome that nobody scrolls down to
   read, and it is the sole reason /map overflowed a phone viewport by exactly
   that much. Listed here rather than checked inline so the next full-bleed
   route is a one-line change. */
const IMMERSIVE_ROUTES = ["/map"];

/* Routes that render with no site chrome at any width (header and footer both
   hidden), e.g. the full-screen QR code. */
const BARE_ROUTES = ["/qrcode"];

const normalise = (pathname) => pathname.replace(/\/+$/, "").toLowerCase() || "/";

/**
 * The app shell. Owns the sticky-footer column and, on the routes above, the
 * modifier that collapses it to a single non-scrolling phone screen.
 *
 * The route decides the class; the *width* decides what the class does, and
 * that half lives in CSS (base.css, --bp-sm). Keeping the breakpoint out of JS
 * is what lets the layout re-measure on zoom and rotation without a re-render.
 */
const AppShell = ({ children }) => {
  const { pathname } = useLocation();
  const route = normalise(pathname);
  const classes = ["app-shell"];
  if (IMMERSIVE_ROUTES.includes(route)) classes.push("app-shell--immersive");
  if (BARE_ROUTES.includes(route)) classes.push("app-shell--bare");

  return (
    <div className={classes.join(" ")}>
      {children}
    </div>
  );
};

export default AppShell;
