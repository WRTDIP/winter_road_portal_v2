import { useRef, useState, useEffect } from "react";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

/* Wraps a chart that is kept at a legible minimum width and scrolls sideways
   when its container is narrower than that. The swipe hint only appears when
   the chart actually overflows, so it stays quiet on a wide screen.

   Use this only where compressing really is worse than scrolling — ninety
   daily bars cannot be squeezed into a phone, but twelve monthly ones fit and
   should not be put behind a scroller. */
export default function ChartScroller({ minWidth, hint, children }) {
  const scrollerRef = useRef(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 2);
    check();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [minWidth]);

  return (
    <>
      <div className="wrtdip-popup-chart" ref={scrollerRef}>
        <div className="wrtdip-popup-chart__inner" style={{ minWidth }}>
          {children}
        </div>
      </div>
      {overflows && hint && (
        <div className="wrtdip-popup-chart__hint">
          <SwapHorizIcon sx={{ fontSize: 15 }} aria-hidden="true" />
          {hint}
        </div>
      )}
    </>
  );
}
