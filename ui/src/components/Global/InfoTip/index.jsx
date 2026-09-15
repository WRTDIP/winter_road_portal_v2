import React, { useState, useRef, useEffect } from "react";
import "./styles.css";

let seq = 0;

/* A tooltip that works on touch and keyboard, unlike title=, which fires on
   neither. Tap or focus the trigger to reveal; Escape or an outside tap
   dismisses.

   Do NOT use this on a disabled control. A disabled element fires no pointer
   events at all, so no tooltip implementation can ever open there -- render a
   visible hint next to it and point at it with aria-describedby instead. */
function InfoTip({ label, children, placement = "top" }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const idRef = useRef(null);
  if (idRef.current === null) idRef.current = `infotip-${++seq}`;

  useEffect(() => {
    if (!open) return undefined;

    const onDocPointer = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span className="infotip" ref={wrapRef}>
      <button
        type="button"
        className="infotip__trigger u-tap-real"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? idRef.current : undefined}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span aria-hidden="true">i</span>
      </button>
      <span
        id={idRef.current}
        role="tooltip"
        className={`infotip__bubble infotip__bubble--${placement}`}
        hidden={!open}
      >
        {children}
      </span>
    </span>
  );
}

export default InfoTip;
