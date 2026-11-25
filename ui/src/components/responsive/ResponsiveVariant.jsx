import { createContext, useContext } from "react";
import { useBreakpoint, BREAKPOINTS } from "../../hooks/useBreakpoint";

/* Two layouts for one component.

   Some components cannot be made to fit a phone by CSS alone -- a chart has to
   drop an axis label and re-thin its ticks, a control strip has to become a
   disclosure. Those need a second implementation, not a media query, and this
   module is how the two halves are paired so that every component does it the
   same way.

   See ./README.md for the recipe. */

/* Forced-variant channel. "auto" lets the viewport decide; the other two pin
   every descendant, which is what the dev harness uses to photograph both
   layouts at one width, and what a future "view desktop version" control would
   set. Default "auto" means a component outside any provider still works. */
const ForcedVariant = createContext("auto");

export function ResponsiveVariantProvider({ variant = "auto", children }) {
  return (
    <ForcedVariant.Provider value={variant}>{children}</ForcedVariant.Provider>
  );
}

/* "mobile" below `at`, "desktop" at or above it -- the same direction as
   Bootstrap's `col-md-*`, so a component's cutoff reads identically in JS and
   in the media query that styles it. `at` is a name from the breakpoint canon
   (sm md lg xl xxl); md (768px) is the phone/tablet line the app already uses. */
export function useVariant(at = "md") {
  const forced = useContext(ForcedVariant);
  const breakpoint = useBreakpoint();

  if (import.meta.env.DEV && !(at in BREAKPOINTS)) {
    throw new Error(
      `useVariant: "${at}" is not a breakpoint. Use one of ${Object.keys(
        BREAKPOINTS
      ).join(", ")} -- do not invent a new value.`
    );
  }

  if (forced !== "auto") return forced;
  return breakpoint[at] ? "desktop" : "mobile";
}

/* Pairs two implementations into one component.

   The two variants are separate React elements, so crossing the breakpoint
   unmounts one and mounts the other: anything the user has set -- a selected
   range, a scroll position, an open disclosure -- has to live in the parent or
   it is lost on rotate. Keep the variants presentational and lift the state. */
export function createResponsiveComponent({ desktop, mobile, at = "md", name }) {
  const label =
    name || desktop.displayName || desktop.name || "Component";

  function ResponsiveComponent(props) {
    const Variant = useVariant(at) === "mobile" ? mobile : desktop;
    return <Variant {...props} />;
  }

  ResponsiveComponent.displayName = `Responsive(${label})`;
  /* Both halves stay reachable by name so a test, a story or the dev harness
     can render one directly instead of resizing a browser to reach it. */
  ResponsiveComponent.Desktop = desktop;
  ResponsiveComponent.Mobile = mobile;
  ResponsiveComponent.at = at;
  return ResponsiveComponent;
}

/* Inline form, for a one-off switch not worth its own component pair. */
export function Responsive({ at = "md", mobile = null, desktop = null }) {
  return useVariant(at) === "mobile" ? mobile : desktop;
}

export default createResponsiveComponent;
