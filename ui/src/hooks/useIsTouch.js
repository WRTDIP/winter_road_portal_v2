import { useState, useEffect } from "react";
import { isTouch } from "./useBreakpoint";

/* True on coarse-pointer devices. Use to swap an interaction, never to hide
   content -- a hybrid laptop with a touchscreen matches this too. */
export default function useIsTouch() {
  const [touch, setTouch] = useState(isTouch);

  useEffect(() => {
    const list = window.matchMedia("(pointer: coarse)");
    const onChange = (event) => setTouch(event.matches);
    list.addEventListener("change", onChange);
    setTouch(list.matches);
    return () => list.removeEventListener("change", onChange);
  }, []);

  return touch;
}
