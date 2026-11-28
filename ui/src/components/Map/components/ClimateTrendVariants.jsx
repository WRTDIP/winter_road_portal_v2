// Three follow-ups to Version B of the Climate Trend Statistics section, each
// trying a different way to make "the season is getting shorter/longer" land.
//
//   B1 — One chart: every season drawn as a bar from opening to closing, both
//        trends on top, so the season visibly narrows (or widens) down the years.
//   B2 — By decade: each decade's typical season as one bar, compared against
//        the first decade. Fewer marks, readable at a glance.
//   B3 — Refined B: a then/now timeline in the summary, the end that moved
//        shown first and large, a steady end collapsed to a slim strip, and the
//        most recent season called out.
import { useState } from "react"
import {
  C,
  DateAxis,
  EndChart,
  EvidenceMeter,
  MonthGrid,
  SeasonLengthHero,
  days,
  dosToLabel,
  endColor,
  median,
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

// ---------------------------------------------------------------------------
// B2 — By decade

// B2's summary compares decade medians, so it agrees with the bars below it
// rather than with the straight-line trend the other layouts extrapolate.
function DecadeHero({ base, latest, sum }) {
  const delta = latest.len - base.len
  const color = Math.abs(delta) < 3 ? C.steady : delta < 0 ? C.lost : C.gained
  const ends = [sum.o, sum.c].filter(moved)
  return (
    <div style={{ padding: "12px 14px", borderRadius: 10, background: C.surface, border: `1px solid ${C.line}` }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.2, color: C.muted }}>
        Typical season, {base.dec}s → {latest.dec}s
      </div>
      <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "0 10px", marginTop: 2 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: -0.5 }}>
          <span style={{ color: C.faint }}>{Math.round(base.len)}</span>
          <span style={{ color: C.faint, fontWeight: 400, margin: "0 6px" }}>→</span>
          {Math.round(latest.len)} days
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>
          {Math.abs(delta) < 3 ? "about the same" : `${delta < 0 ? "−" : "+"}${days(delta)}`}
        </span>
      </div>
      <div style={{ fontSize: 12.5, color: C.body, marginTop: 6, lineHeight: 1.45 }}>
        {ends.length === 0
          ? "Neither end of the season shows a clear long-term trend."
          : `Fitted trend over all seasons: ${ends
              .map(
                (e) =>
                  `${e.kind === "open" ? "opening" : "closing"} ${days(e.shift)} ${
                    e.shift > 0 ? "later" : "earlier"
                  } over ${sum.firstYear}–${sum.lastYear}`
              )
              .join(", ")}.`}
      </div>
    </div>
  )
}

export function VersionB2({ sum }) {
  const [hover, setHover] = useState(null)
  const { o, c } = sum
  const seasons = pairSeasons(o, c).filter((s) => s.open != null && s.close != null)
  const groups = new Map()
  for (const s of seasons) {
    const d = Math.floor(s.year / 10) * 10
    if (!groups.has(d)) groups.set(d, [])
    groups.get(d).push(s)
  }
  const rows = [...groups.entries()]
    .filter(([, list]) => list.length >= 3)
    .sort(([a], [b]) => a - b)
    .map(([dec, list]) => {
      const open = median(list.map((s) => s.open))
      const close = median(list.map((s) => s.close))
      return { dec, list, open, close, len: close - open }
    })

  if (rows.length < 2) {
    return (
      <div>
        <SeasonLengthHero sum={sum} />
        <EndResults sum={sum} />
      </div>
    )
  }

  const base = rows[0]
  const all = seasons.flatMap((s) => [s.open, s.close])
  const lo = Math.min(...all) - 6
  const hi = Math.max(...all) + 6
  const pct = (v) => ((v - lo) / (hi - lo)) * 100
  const seg = (a, b, style) =>
    Math.abs(b - a) >= 1 ? (
      <div
        style={{
          position: "absolute",
          top: 5,
          bottom: 5,
          left: `${pct(Math.min(a, b))}%`,
          width: `${pct(Math.max(a, b)) - pct(Math.min(a, b))}%`,
          borderRadius: 3,
          ...style,
        }}
      />
    ) : null
  const lostStyle = {
    background: `repeating-linear-gradient(135deg, ${C.lostSoft} 0 4px, #fecaca 4px 8px)`,
    border: `1px dashed ${C.lost}`,
  }
  const gainedStyle = {
    background: C.gainedSoft,
    border: `1px dashed ${C.gained}`,
  }

  return (
    <div>
      <DecadeHero base={base} latest={rows[rows.length - 1]} sum={sum} />
      <div style={{ fontSize: 12, color: C.muted, margin: "14px 0 6px" }}>
        The typical season in each decade, compared with the {base.dec}s (dashed outline).
      </div>
      <div style={{ display: "grid", gap: 4 }}>
        {rows.map((r) => {
          const delta = r.len - base.len
          const isBase = r === base
          return (
            <div
              key={r.dec}
              onPointerEnter={() => setHover(r.dec)}
              onPointerLeave={() => setHover(null)}
              onPointerDown={() => setHover(r.dec)}
              style={{
                display: "grid",
                gridTemplateColumns: "44px 1fr 58px",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{r.dec}s</span>
              <div style={{ position: "relative", height: 30 }}>
                <MonthGrid pct={pct} lo={lo} hi={hi} />
                {/* Each season's opening and closing, as faint ticks. */}
                {r.list.flatMap((s) => [
                  <span
                    key={`o${s.year}`}
                    style={{
                      position: "absolute",
                      top: 2,
                      bottom: 2,
                      left: `${pct(s.open)}%`,
                      borderLeft: "1.5px solid #cbd5e1",
                    }}
                  />,
                  <span
                    key={`c${s.year}`}
                    style={{
                      position: "absolute",
                      top: 2,
                      bottom: 2,
                      left: `${pct(s.close)}%`,
                      borderLeft: "1.5px solid #cbd5e1",
                    }}
                  />,
                ])}
                {/* The first decade's season, for reference. */}
                {!isBase && (
                  <div
                    style={{
                      position: "absolute",
                      top: 5,
                      bottom: 5,
                      left: `${pct(base.open)}%`,
                      width: `${pct(base.close) - pct(base.open)}%`,
                      border: `1.5px dashed ${C.faint}`,
                      borderRadius: 4,
                    }}
                  />
                )}
                {!isBase && seg(base.open, r.open, r.open > base.open ? lostStyle : gainedStyle)}
                {!isBase && seg(base.close, r.close, r.close < base.close ? lostStyle : gainedStyle)}
                <div
                  style={{
                    position: "absolute",
                    top: 5,
                    bottom: 5,
                    left: `${pct(r.open)}%`,
                    width: `${pct(r.close) - pct(r.open)}%`,
                    background: hover === r.dec ? C.openDeep : C.open,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 10.5,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {hover === r.dec ? `${dosToLabel(r.open)} – ${dosToLabel(r.close)}` : ""}
                </div>
              </div>
              <span style={{ textAlign: "right", lineHeight: 1.15 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: C.ink,
                  }}
                >
                  {Math.round(r.len)} d
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: isBase ? C.faint : delta < -0.5 ? C.lost : delta > 0.5 ? C.gained : C.steady,
                  }}
                >
                  {isBase ? `${r.list.length} seasons` : `${delta < 0 ? "−" : "+"}${Math.round(Math.abs(delta))} d`}
                </span>
              </span>
            </div>
          )
        })}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "44px 1fr 58px",
            gap: 8,
          }}
        >
          <span />
          <DateAxis pct={pct} lo={lo} hi={hi} />
          <span />
        </div>
      </div>
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
        <LegendItem swatch={<rect x="1" y="1" width="16" height="8" rx="2" fill={C.open} />}>
          Typical season (median dates)
        </LegendItem>
        <LegendItem
          swatch={
            <rect x="1" y="1" width="16" height="8" rx="2" fill={C.lostSoft} stroke={C.lost} strokeDasharray="2 2" />
          }
        >
          Lost vs {base.dec}s
        </LegendItem>
        <LegendItem swatch={<line x1="9" y1="0" x2="9" y2="10" stroke="#cbd5e1" strokeWidth="1.5" />}>
          One season&apos;s date
        </LegendItem>
      </div>
      <EndResults sum={sum} />
      <div style={{ fontSize: 11, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>
        Decade bars use median dates; the evidence ratings come from the trend test over all {seasons.length} seasons.
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// B3 — Refined B

function ThenNowHero({ sum }) {
  const { o, c } = sum
  const color = verdictColor(sum.verdict)
  const drivers = [o, c].filter(moved)
  const lo = Math.min(o.then, o.now) - 12
  const hi = Math.max(c.then, c.now) + 12
  const pct = (v) => ((v - lo) / (hi - lo)) * 100
  const why =
    drivers.length === 0
      ? "Neither the opening nor the closing date shows a clear long-term trend."
      : `${drivers
          .map(
            (e) =>
              `${e.kind === "open" ? "Freeze-up" : "Thaw"} now comes ${days(e.shift)} ${
                e.shift > 0 ? "later" : "earlier"
              }`
          )
          .join("; ")}${
          drivers.length === 1
            ? `; ${drivers[0].kind === "open" ? "closing" : "opening"} dates haven't clearly changed.`
            : "."
        }`

  const Row = ({ year, a, b, children, strong }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "34px 1fr",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: strong ? C.ink : C.muted,
        }}
      >
        {year}
      </span>
      <div style={{ position: "relative", height: 16 }}>
        <MonthGrid pct={pct} lo={lo} hi={hi} />
        {children}
        <div
          style={{
            position: "absolute",
            top: 3,
            bottom: 3,
            left: `${pct(a)}%`,
            width: `${pct(b) - pct(a)}%`,
            background: strong ? C.open : "#bae6fd",
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  )
  const diff = (a, b, lost) =>
    Math.abs(b - a) >= 1 ? (
      <div
        style={{
          position: "absolute",
          top: 3,
          bottom: 3,
          left: `${pct(Math.min(a, b))}%`,
          width: `${pct(Math.max(a, b)) - pct(Math.min(a, b))}%`,
          background: lost ? `repeating-linear-gradient(135deg, ${C.lostSoft} 0 3px, #fecaca 3px 6px)` : C.gainedSoft,
          border: `1px dashed ${lost ? C.lost : C.gained}`,
          borderRadius: 3,
        }}
      />
    ) : null

  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 10,
        background: C.surface,
        border: `1px solid ${C.line}`,
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: C.muted,
        }}
      >
        Road season, {sum.firstYear} → {sum.lastYear}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "0 10px",
          marginTop: 2,
        }}
      >
        <span
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: C.ink,
            letterSpacing: -0.5,
          }}
        >
          {sum.verdict === "stable" ? (
            <>≈ {Math.round(sum.lenNow)} days</>
          ) : (
            <>
              <span style={{ color: C.faint }}>{Math.round(sum.lenThen)}</span>
              <span style={{ color: C.faint, fontWeight: 400, margin: "0 6px" }}>→</span>
              {Math.round(sum.lenNow)} days
            </>
          )}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>
          {sum.verdict === "stable" ? "no clear change" : `${sum.change < 0 ? "−" : "+"}${days(sum.change)}`}
        </span>
      </div>
      {sum.verdict !== "stable" && (
        <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
          <Row year={sum.firstYear} a={o.then} b={c.then} />
          <Row year={sum.lastYear} a={o.now} b={c.now} strong>
            {diff(o.then, o.now, o.now > o.then)}
            {diff(c.then, c.now, c.now < c.then)}
          </Row>
          <div style={{ display: "grid", gridTemplateColumns: "34px 1fr", gap: 8 }}>
            <span />
            <DateAxis pct={pct} lo={lo} hi={hi} />
          </div>
        </div>
      )}
      <div
        style={{
          fontSize: 12.5,
          color: C.body,
          marginTop: 8,
          lineHeight: 1.45,
        }}
      >
        {why}
      </div>
    </div>
  )
}

export function VersionB3({ sum }) {
  const [ref, width] = useWidth()
  // The end that moved goes first; a steady end needs far less room.
  const ends = [sum.o, sum.c].sort((a, b) => Number(moved(b)) - Number(moved(a)))
  const extent = (e) => {
    const xs = [e.then, e.now, ...e.pts.map((p) => p.y)]
    if (e.ev.real)
      xs.push(
        e.at(sum.firstYear, e.s.sens_slope_lo),
        e.at(sum.firstYear, e.s.sens_slope_hi),
        e.at(sum.lastYear, e.s.sens_slope_lo),
        e.at(sum.lastYear, e.s.sens_slope_hi)
      )
    if (!e.pts.length) xs.push(e.s.earliest_dos, e.s.latest_dos)
    return [Math.min(...xs), Math.max(...xs)]
  }
  const spanDays = Math.max(45, ...ends.map(extent).map(([a, b]) => b - a)) + 14

  const latestLine = (e) => {
    if (!e.pts.length) return null
    const p = e.pts.reduce((m, q) => (q.x > m.x ? q : m))
    const ref = e.ev.real ? e.at(p.x, e.s.sens_slope) : e.s.avg_dos
    const diff = Math.round(p.y - ref)
    const vs = e.ev.real ? "the trend" : "usual"
    return (
      <span>
        <b style={{ color: C.ink }}>Latest ({seasonLabel(p.x)}):</b> {e.kind === "open" ? "opened" : "closed"}{" "}
        {dosToLabel(p.y)}
        {Math.abs(diff) >= 1 ? ` · ${days(diff)} ${diff > 0 ? "later" : "earlier"} than ${vs}` : ` · right on ${vs}`}
      </span>
    )
  }

  return (
    <div ref={ref}>
      <ThenNowHero sum={sum} />
      {width > 0 &&
        ends.map((e) => {
          const big = moved(e) || e.ev.tier === "hint"
          const [a, b] = extent(e)
          return (
            <div key={e.kind} style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "2px 10px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>
                  {e.kind === "open" ? "Opening date" : "Closing date"}
                  <span style={{ fontWeight: 400, color: C.muted }}> · {e.kind === "open" ? "freeze-up" : "thaw"}</span>
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: endColor(e) }}>{shiftText(e)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "2px 10px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 11, color: C.muted }}>
                  {e.ev.real
                    ? `${dosToLabel(e.then)} → ${dosToLabel(e.now)} · likely ${Math.round(
                        Math.min(Math.abs(e.lo), Math.abs(e.hi))
                      )}–${days(Math.max(Math.abs(e.lo), Math.abs(e.hi)))}`
                    : `usually ${e.s.avg_date}, ranging ${e.s.earliest_date} – ${e.s.latest_date}`}
                </span>
                {e.ev.tier !== "none" && <EvidenceMeter ev={e.ev} />}
              </div>
              <EndChart
                e={e}
                sum={sum}
                width={width}
                spanDays={spanDays}
                center={(a + b) / 2}
                plot={big ? 104 : 40}
                showDecades={big}
                highlightLatest
              />
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{latestLine(e)}</div>
            </div>
          )
        })}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px 14px",
          marginTop: 10,
          fontSize: 11,
          color: C.muted,
        }}
      >
        <LegendItem swatch={<circle cx="9" cy="5" r="3" fill="#94a3b8" />}>One season (tap)</LegendItem>
        <LegendItem swatch={<circle cx="9" cy="5" r="4" fill="none" stroke={C.ink} strokeWidth="1.5" />}>
          Latest season
        </LegendItem>
        <LegendItem
          swatch={<line x1="1" y1="5" x2="17" y2="5" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />}
        >
          Trend
        </LegendItem>
        {ends.some((e) => e.ev.real) && (
          <LegendItem swatch={<polygon points="1,1 17,1 17,9 1,9" fill={C.ink} fillOpacity="0.12" />}>
            Likely range
          </LegendItem>
        )}
      </div>
    </div>
  )
}
