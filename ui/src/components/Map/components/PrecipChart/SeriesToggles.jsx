import { PRECIP_SERIES } from "./model.js";

/* Max / Avg / Min switches. Shared by both variants so the two layouts cannot
   drift into offering different series. `className` lets the phone layout give
   the same controls real 44px targets without restyling the desktop row. */
export default function SeriesToggles({ visible, onVisibleChange, className = "" }) {
  return (
    <div className={`wrtdip-series-toggles ${className}`.trim()}>
      {PRECIP_SERIES.map((series) => (
        <label
          key={series.key}
          className={`wrtdip-series-toggle${visible[series.key] ? " wrtdip-series-toggle--on" : ""}`}
        >
          <input
            type="checkbox"
            className="wrtdip-series-toggle__input"
            checked={!!visible[series.key]}
            onChange={(event) => onVisibleChange(series.key, event.target.checked)}
          />
          <span className="wrtdip-series-toggle__dot" style={{ background: series.color }} />
          {series.label}
        </label>
      ))}
    </div>
  );
}
