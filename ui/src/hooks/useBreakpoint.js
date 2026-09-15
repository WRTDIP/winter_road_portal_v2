import { useState, useEffect } from "react";

/* The single breakpoint source of truth. Bootstrap 5's grid values, which are
   load-bearing in seven components and which antd 4's responsiveObserve
   already matches below xxl. Do not add a value to this map. */
export const BREAKPOINTS = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

const NAMES = Object.keys(BREAKPOINTS);

/* A max-width query sits just below the next step up so `isDown("md")` and
   `isUp("md")` can never both match at a fractional viewport width. */
const ceilingOf = (name) => BREAKPOINTS[name] - 0.02;

const upQuery = (name) => `(min-width: ${BREAKPOINTS[name]}px)`;
const downQuery = (name) => `(max-width: ${ceilingOf(name)}px)`;
const TOUCH_QUERY = "(pointer: coarse)";

/* Imperative reads, for code that runs outside React's render cycle -- the
   esri-loader callbacks in Map.jsx, event handlers, module init. */
export const isUp = (name) => window.matchMedia(upQuery(name)).matches;
export const isDown = (name) => window.matchMedia(downQuery(name)).matches;
export const isTouch = () => window.matchMedia(TOUCH_QUERY).matches;

const read = () => {
  const state = { isTouch: isTouch() };
  NAMES.forEach((name) => {
    state[name] = isUp(name);
  });
  return state;
};

/* Reactive form. Returns { sm, md, lg, xl, xxl, isTouch } where each
   breakpoint key is true when the viewport is at or above it -- so the checks
   read the same way as Bootstrap's own `col-md-*` semantics. Updates on
   rotate, because rotating changes width and therefore re-evaluates the
   min-width queries. */
export function useBreakpoint() {
  const [state, setState] = useState(read);

  useEffect(() => {
    const lists = [...NAMES.map(upQuery), TOUCH_QUERY].map((q) =>
      window.matchMedia(q)
    );
    const onChange = () => setState(read());
    lists.forEach((list) => list.addEventListener("change", onChange));
    // A width change between mount and effect would otherwise be missed.
    onChange();
    return () =>
      lists.forEach((list) => list.removeEventListener("change", onChange));
  }, []);

  return state;
}

export default useBreakpoint;
