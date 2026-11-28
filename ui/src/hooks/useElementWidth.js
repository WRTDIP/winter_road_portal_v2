import { useState, useRef, useCallback, useEffect } from "react";

/* Content width of a node, tracked with ResizeObserver.

   Charts have to size themselves from their container, not from the viewport:
   the FDD plot lives inside a dialog that is narrower than the screen and gets
   narrower again when a scrollbar appears, and tick density has to follow the
   box it is actually drawn in. Returns [ref, width]; width is 0 until the node
   mounts, so callers fall back to a sensible default on the first paint. */
export default function useElementWidth() {
  const [width, setWidth] = useState(0);
  const observer = useRef(null);

  const ref = useCallback((node) => {
    if (observer.current) {
      observer.current.disconnect();
      observer.current = null;
    }
    if (!node) return;
    setWidth(node.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") return;
    observer.current = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect?.width;
      if (measured != null) setWidth(measured);
    });
    observer.current.observe(node);
  }, []);

  useEffect(() => () => observer.current?.disconnect(), []);

  return [ref, width];
}
