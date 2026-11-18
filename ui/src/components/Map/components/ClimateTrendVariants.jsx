// B1 — the season chart used by Climate Trend Statistics: every season drawn
// as a bar from opening to closing, both trends on top, so the season visibly
// narrows (or widens) down the years.
import { useState } from "react"
import {
  C,
  EvidenceMeter,
  SeasonLengthHero,
  days,
  dosToLabel,
  endColor,
  useWidth,
  verdictColor,
} from "./climateTrendShared.jsx"

// Join the opening and closing points into one record per season.
function pairSeasons(o, c) {
  const byYear = new Map()
  for (const p of o.pts) byYear.set(p.x, { year: p.x, open: p.y, close: null })
  for (const p of c.pts) {
    const r = byYear.get(p.x) || { year: p.x, open: null, close: null }
    r.close = p.y
    byYear.set(p.x, r)
  }
  return [...byYear.values()].sort((a, b) => a.year - b.year)
}

const moved = (e) => e.ev.real && Math.abs(e.shift) >= 1
const shiftText = (e) => (moved(e) ? `${days(e.shift)} ${e.shift > 0 ? "later" : "earlier"}` : "No clear change")
const seasonLabel = (yr) => `${yr}–${String(yr + 1).slice(2)}`

function Tooltip({ left, top, width, children }) {
  return (
    <div
      style={{
        position: "absolute",
        left: Math.min(Math.max(left, 80), width - 80),
        top,
        transform: "translate(-50%, -100%)",
        background: C.ink,
        color: "#fff",
        fontSize: 11,
        lineHeight: 1.35,
        padding: "5px 8px",
        borderRadius: 6,
        pointerEvents: "none",
        whiteSpace: "nowrap",
        boxShadow: "0 4px 12px rgba(15,23,42,.25)",
        zIndex: 2,
      }}
    >
      {children}
    </div>
  )
}

function LegendItem({ swatch, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <svg width="18" height="10" aria-hidden="true">
        {swatch}
      </svg>
      {children}
    </span>
  )
}

// Per-end result line used under B1 and B2.
function EndResults({ sum }) {
  return (
    <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
      {[sum.o, sum.c].map((e) => (
        <div
          key={e.kind}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "2px 10px",
          }}
        >
          <span style={{ fontSize: 12.5, color: C.body }}>
            <b style={{ color: C.ink }}>{e.kind === "open" ? "Opening" : "Closing"}</b>{" "}
            <span style={{ color: endColor(e), fontWeight: 700 }}>{shiftText(e)}</span>
            {moved(e) ? ` (${dosToLabel(e.then)} → ${dosToLabel(e.now)})` : ` · usually ${e.s.avg_date}`}
          </span>
          {e.ev.tier !== "none" && <EvidenceMeter ev={e.ev} />}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// B1 — One chart

function SeasonBarsChart({ sum, width }) {
  const [hover, setHover] = useState(null)
  const { o, c } = sum
  const first = sum.firstYear
  const last = sum.lastYear
  const seasons = pairSeasons(o, c)
  const xs = [o.then, o.now, c.then, c.now]
  for (const s of seasons) {
    if (s.open != null) xs.push(s.open)
    if (s.close != null) xs.push(s.close)
  }
  const lo = Math.min(...xs) - 10
  const hi = Math.max(...xs) + 10
  const M = { left: 38, right: 12, top: 26, bottom: 22 }
  const plot = Math.min(Math.max((last - first + 1) * 5, 150), 230)
  const H = M.top + plot + M.bottom
  const innerW = Math.max(width - M.left - M.right, 10)
  const x = (d) => M.left + ((d - lo) / (hi - lo)) * innerW
  const y = (yr) => M.top + ((yr - first) / Math.max(last - first, 1)) * plot
  const rowH = plot / Math.max(last - first, 1)
  const barW = Math.max(2, Math.min(rowH * 0.62, 5))
  const halo = {
    paintOrder: "stroke",
    stroke: "#fff",
    strokeWidth: 3,
    strokeLinejoin: "round",
  }

  const decades = []
  for (let d = Math.ceil((first + 4) / 10) * 10; d < last - 5; d += 10) decades.push(d)

  const onMove = (ev) => {
    const box = ev.currentTarget.getBoundingClientRect()
    const yr = Math.round(first + ((ev.clientY - box.top - M.top) / plot) * (last - first))
    setHover(seasons.find((s) => s.year === yr) || null)
  }

  // The days lost (or gained) at one end: the wedge between where that end
  // sat at the start of the record and where its trend has carried it.
  const wedge = (e) =>
    moved(e) ? (
      <polygon
        points={`${x(e.then)},${y(first)} ${x(e.then)},${y(last)} ${x(e.now)},${y(last)}`}
        fill={endColor(e)}
        fillOpacity="0.16"
      />
    ) : null

  const trend = (e) =>
    moved(e) ? (
      <line
        x1={x(e.then)}
        y1={y(first)}
        x2={x(e.now)}
        y2={y(last)}
        stroke={endColor(e)}
        strokeWidth="2.75"
        strokeLinecap="round"
        markerEnd={`url(#b1-arrow-${e.kind})`}
      />
    ) : (
      <line
        x1={x(e.s.avg_dos)}
        x2={x(e.s.avg_dos)}
        y1={y(first)}
        y2={y(last)}
        stroke={C.steady}
        strokeWidth="2"
        strokeDasharray="5 4"
      />
    )

  // Start-of-record labels sit above the plot; end-of-record labels sit
  // outside the season (left of the opening, right of the closing).
  const topLabel = (e) => {
    const d = moved(e) ? e.then : e.s.avg_dos
    return (
      <text
        x={x(d)}
        y={M.top - 10}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill={moved(e) ? C.ink : C.steady}
        style={halo}
      >
        {moved(e) ? dosToLabel(d) : `usually ${e.s.avg_date}`}
      </text>
    )
  }
  const endLabel = (e) =>
    moved(e) ? (
      <text
        x={x(e.now) + (e.kind === "open" ? -9 : 9)}
        y={y(last) + 4}
        textAnchor={e.kind === "open" ? "end" : "start"}
        fontSize="11"
        fontWeight="700"
        fill={endColor(e)}
        style={halo}
      >
        {dosToLabel(e.now)}
      </text>
    ) : null

  return (
    <div style={{ position: "relative" }}>
      <svg
        width={width}
        height={H}
        role="img"
        aria-label={`Each season from ${first} to ${last} as a bar from opening to closing date.`}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
        style={{ display: "block", touchAction: "pan-y", overflow: "visible" }}
      >
        <defs>
          {[o, c].map((e) => (
            <marker
              key={e.kind}
              id={`b1-arrow-${e.kind}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill={endColor(e)} />
            </marker>
          ))}
        </defs>
        {decades.map((d) => (
          <text key={d} x={M.left - 6} y={y(d) + 3} textAnchor="end" fontSize="9.5" fill={C.faint}>
            {d}
          </text>
        ))}
        {[first, last].map((yr) => (
          <text key={yr} x={M.left - 6} y={y(yr) + 3.5} textAnchor="end" fontSize="10.5" fontWeight="700" fill={C.ink}>
            {yr}
          </text>
        ))}
        {/* Month columns. */}
        {monthTicks({ lo, hi }).map((t) => (
          <g key={t.dos}>
            <line x1={x(t.dos)} x2={x(t.dos)} y1={M.top - 4} y2={M.top + plot + 4} stroke={C.line} />
            <text x={x(t.dos)} y={H - 6} textAnchor="middle" fontSize="10" fill={C.muted}>
              {t.label} 1
            </text>
          </g>
        ))}
        {wedge(o)}
        {wedge(c)}
        {/* One bar per season. */}
        {seasons.map((s) =>
          s.open != null && s.close != null ? (
            <line
              key={s.year}
              x1={x(s.open)}
              x2={x(s.close)}
              y1={y(s.year)}
              y2={y(s.year)}
              stroke={hover === s ? C.openDeep : "#7dd3fc"}
              strokeOpacity={hover === s ? 1 : 0.75}
              strokeWidth={hover === s ? barW + 1.5 : barW}
              strokeLinecap="round"
            />
          ) : (
            <circle key={s.year} cx={x(s.open ?? s.close)} cy={y(s.year)} r={barW / 2 + 0.5} fill="#7dd3fc" />
          )
        )}
        {trend(o)}
        {trend(c)}
        {topLabel(o)}
        {topLabel(c)}
        {endLabel(o)}
        {endLabel(c)}
      </svg>
      {hover && (
        <Tooltip
          left={x(((hover.open ?? hover.close) + (hover.close ?? hover.open)) / 2)}
          top={y(hover.year) - 8}
          width={width}
        >
          <div style={{ fontWeight: 700 }}>{seasonLabel(hover.year)} season</div>
          <div style={{ opacity: 0.8 }}>
            {hover.open != null ? dosToLabel(hover.open) : "?"} → {hover.close != null ? dosToLabel(hover.close) : "?"}
            {hover.open != null && hover.close != null && ` · ${days(hover.close - hover.open)}`}
          </div>
        </Tooltip>
      )}
    </div>
  )
}

// Month starts inside a day-of-season range.
function monthTicks({ lo, hi }) {
  const out = []
  for (let i = 0; i < 12; i++) {
    const ms = Date.UTC(i < 5 ? 2001 : 2002, (7 + i) % 12, 1)
    const dos = (ms - Date.UTC(2001, 7, 1)) / 86400000
    if (dos > lo + 2 && dos < hi - 2)
      out.push({
        dos,
        label: new Date(ms).toLocaleDateString("en-CA", {
          month: "short",
          timeZone: "UTC",
        }),
      })
  }
  return out
}

export function VersionB1({ sum }) {
  const [ref, width] = useWidth()
  const anyMoved = moved(sum.o) || moved(sum.c)
  const lostColor = [sum.o, sum.c].find(moved) ? endColor([sum.o, sum.c].find(moved)) : C.lost
  return (
    <div ref={ref}>
      <SeasonLengthHero sum={sum} />
      <div style={{ fontSize: 12, color: C.muted, margin: "14px 0 2px" }}>
        Every season on record, from the day the road opened to the day it closed.
      </div>
      {width > 0 && <SeasonBarsChart sum={sum} width={width} />}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px 14px",
          marginTop: 8,
          fontSize: 11,
          color: C.muted,
        }}
      >
        <LegendItem
          swatch={<line x1="2" y1="5" x2="16" y2="5" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" />}
        >
          One season (tap for dates)
        </LegendItem>
        <LegendItem
          swatch={<line x1="1" y1="5" x2="17" y2="5" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />}
        >
          Long-term trend
        </LegendItem>
        {anyMoved && (
          <LegendItem swatch={<polygon points="1,1 17,1 17,9 1,9" fill={lostColor} fillOpacity="0.2" />}>
            {verdictColor(sum.verdict) === C.gained ? "Days gained since" : "Days lost since"} {sum.firstYear}
          </LegendItem>
        )}
      </div>
      <EndResults sum={sum} />
    </div>
  )
}
