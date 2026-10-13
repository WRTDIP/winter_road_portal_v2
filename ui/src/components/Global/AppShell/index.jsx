import React from "react";
import { useLocation } from "react-router-dom";

/* Routes that own the whole phone screen. The map is an app surface, not a
   document: a footer under it is 132px of chrome that nobody scrolls down to
   read, and it is the sole reason /map overflowed a phone viewport by exactly
   that much. Listed here rather than checked inline so the next full-bleed
   route is a one-line change. */
const IMMERSIVE_ROUTES = ["/map"];

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
  const immersive = IMMERSIVE_ROUTES.includes(normalise(pathname));

  return (
    <div className={immersive ? "app-shell app-shell--immersive" : "app-shell"}>
      {children}
    </div>
  );
};

export default AppShell;
