// "Climate Trend Statistics" — bottom section of the road-closure popup.
//
// The section answers one question: is this road's usable season changing over
// the years, and by how much? The B1 layout draws every season as a bar from
// opening to closing with both trends on top. Everything else (p-values,
// Pearson's r, SD) is supporting evidence and lives behind "Show the numbers".
import { useState } from "react"
import { VersionB1 } from "./ClimateTrendVariants.jsx"
import { C, endSentence, summarizeSeason } from "./climateTrendShared.jsx"

function NumbersTable({ open, close, fmtP }) {
  const rows = [
    ["Seasons on record", (s) => `${s.n} (${s.first_year}–${s.last_year})`],
    ["Average date", (s) => s.avg_date],
    ["Earliest / latest", (s) => `${s.earliest_date} / ${s.latest_date}`],
    ["Year-to-year spread (SD)", (s) => `± ${s.sd_days} days`],
    ["Sen's slope", (s) => `${s.sens_slope > 0 ? "+" : ""}${(s.sens_slope * 10).toFixed(1)} days/decade`],
    ["95% range of slope", (s) => `${(s.sens_slope_lo * 10).toFixed(1)} to ${(s.sens_slope_hi * 10).toFixed(1)}`],
    ["Mann-Kendall", (s) => `${s.mk_trend} (${fmtP(s.mk_p)})`],
    ["Pearson's r vs year", (s) => `${s.pearson_r.toFixed(2)} (${fmtP(s.pearson_p)})`],
  ]
  const cell = {
    padding: "4px 8px",
    borderBottom: `1px solid ${C.line}`,
    fontSize: 12,
  }
  return (
    <div style={{ overflowX: "auto", marginTop: 6 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...cell, textAlign: "left", color: C.muted }}>Statistic</th>
            <th style={{ ...cell, textAlign: "right", color: C.muted }}>Opening</th>
            <th style={{ ...cell, textAlign: "right", color: C.muted }}>Closing</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, fmt]) => (
            <tr key={label}>
              <td style={{ ...cell, color: C.muted }}>{label}</td>
              <td style={{ ...cell, textAlign: "right", fontWeight: 600 }}>{open ? fmt(open) : "—"}</td>
              <td style={{ ...cell, textAlign: "right", fontWeight: 600 }}>{close ? fmt(close) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
        Shifts are Sen's slope × years on record, counted only where the Mann-Kendall test gives p &lt; 0.05.
      </div>
    </div>
  )
}

export default function ClimateTrendStats({ open, close, openPoints, closePoints, fmtP }) {
  const [showNumbers, setShowNumbers] = useState(false)

  const sum = summarizeSeason(open, close, openPoints, closePoints)
  // One end missing: no season length, so fall back to the per-end sentences.
  const body =
    !sum.o || !sum.c ? (
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.body, lineHeight: 1.55 }}>
        {sum.o && <li>{endSentence(sum.o)}</li>}
        {sum.c && <li>{endSentence(sum.c)}</li>}
      </ul>
    ) : (
      <VersionB1 sum={sum} />
    )

  return (
    <div style={{ width: "100%" }}>
      {body}
      <button
        type="button"
        className="wrtdip-numbers-toggle"
        onClick={() => setShowNumbers((d) => !d)}
        aria-expanded={showNumbers}
      >
        {showNumbers ? "Hide the numbers ▴" : "Show the numbers ▾"}
      </button>
      {showNumbers && <NumbersTable open={open} close={close} fmtP={fmtP} />}
    </div>
  )
}
