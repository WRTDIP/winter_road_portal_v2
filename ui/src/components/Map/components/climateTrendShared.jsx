// Shared pieces for the Climate Trend Statistics prototypes: the season
// summary every layout reads from, palette, axis helpers and the per-end
// date x year chart (EndChart) used by Version B and its variants.
import { useEffect, useRef, useState } from "react"

export const C = {
  ink: "#1e293b",
  body: "#334155",
  muted: "#64748b",
  faint: "#94a3b8",
  line: "#e2e8f0",
  surface: "#f8fafc",
  open: "#0ea5e9", // road open / ice
  openDeep: "#0369a1",
  lost: "#dc2626", // days lost to warming
  lostSoft: "#fee2e2",
  gained: "#0284c7", // days gained
  gainedSoft: "#e0f2fe",
  steady: "#64748b",
  steadySoft: "#f1f5f9",
}

export const SEASON_BASE_MS = Date.UTC(2001, 7, 1) // day-of-season 0 = Aug 1
export const dosToLabel = (dos) =>
  new Date(SEASON_BASE_MS + Math.round(dos) * 86400000).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
// Day-of-season of the 1st of each month, for axis ticks.
export const MONTH_TICKS = Array.from({ length: 12 }, (_, i) => {
  const ms = Date.UTC(i < 5 ? 2001 : 2002, (7 + i) % 12, 1)
  return {
    dos: (ms - SEASON_BASE_MS) / 86400000,
    label: new Date(ms).toLocaleDateString("en-CA", {
      month: "short",
      timeZone: "UTC",
    }),
  }
})

export const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

// Evidence tiers from the Mann-Kendall p-value. Only "strong" and "moderate"
// count as a real shift; "hint" is shown but never added into the totals.
export function evidence(p) {
  if (p == null) return { tier: "none", label: "No data", real: false }
  if (p < 0.01) return { tier: "strong", label: "Strong evidence", real: true }
  if (p < 0.05) return { tier: "moderate", label: "Moderate evidence", real: true }
  if (p < 0.1) return { tier: "hint", label: "Weak hint only", real: false }
  return { tier: "none", label: "No clear change", real: false }
}

// Turn one end's stats into "then vs now" dates over the record.
// With the yearly points, the trend is the Theil-Sen line itself (through the
// medians, as scipy fits it); without them it is centred on the mean date.
export function summarizeEnd(s, kind, scatter) {
  if (!s) return null
  const span = s.last_year - s.first_year
  const ev = evidence(s.mk_p)
  const pts = (scatter || []).filter((p) => p && p.y != null)
  const pivotX = pts.length ? median(pts.map((p) => p.x)) : (s.first_year + s.last_year) / 2
  const pivotY = pts.length ? median(pts.map((p) => p.y)) : s.avg_dos
  const at = (year, slope) => pivotY + slope * (year - pivotX)
  const then = ev.real ? at(s.first_year, s.sens_slope) : s.avg_dos
  const now = ev.real ? at(s.last_year, s.sens_slope) : s.avg_dos
  const shift = now - then // + = later
  // Season-length effect: a later opening or an earlier closing shortens it.
  const seasonEffect = kind === "open" ? -shift : shift
  return {
    kind,
    s,
    ev,
    span,
    shift,
    rawShift: s.sens_slope * span,
    lo: s.sens_slope_lo * span,
    hi: s.sens_slope_hi * span,
    then,
    now,
    seasonEffect,
    pts,
    at,
  }
}

export function summarizeSeason(open, close, openPts, closePts) {
  const o = summarizeEnd(open, "open", openPts)
  const c = summarizeEnd(close, "close", closePts)
  const firstYear = Math.min(open?.first_year ?? Infinity, close?.first_year ?? Infinity)
  const lastYear = Math.max(open?.last_year ?? -Infinity, close?.last_year ?? -Infinity)
  const change = (o?.seasonEffect || 0) + (c?.seasonEffect || 0) // + = longer
  const lenThen = o && c ? c.then - o.then : null
  const lenNow = o && c ? c.now - o.now : null
  const ends = [o, c].filter(Boolean)
  const realEnds = ends.filter((e) => e.ev.real)
  const verdict = Math.abs(change) < 3 ? "stable" : change < 0 ? "shorter" : "longer"
  const tierRank = { strong: 3, moderate: 2, hint: 1, none: 0 }
  const best = ends.reduce((a, e) => (tierRank[e.ev.tier] > tierRank[a] ? e.ev.tier : a), "none")
  return {
    o,
    c,
    firstYear,
    lastYear,
    change,
    lenThen,
    lenNow,
    verdict,
    realEnds,
    best,
  }
}

export const days = (n) => `${Math.round(Math.abs(n))} day${Math.round(Math.abs(n)) === 1 ? "" : "s"}`

// One plain sentence per end.
export function endSentence(e) {
  const what = e.kind === "open" ? "Opens" : "Closes"
  if (!e.ev.real) {
    if (e.ev.tier === "hint")
      return `${what} around ${e.s.avg_date} — maybe drifting ${
        e.rawShift > 0 ? "later" : "earlier"
      }, but not enough evidence to say.`
    return `${what} around ${e.s.avg_date}, with no clear long-term change.`
  }
  return `${what} about ${days(e.shift)} ${e.shift > 0 ? "later" : "earlier"} than in ${e.s.first_year} (${dosToLabel(
    e.then
  )} → ${dosToLabel(e.now)}).`
}

export function headline(sum) {
  if (sum.verdict === "stable")
    return {
      big: "No clear change",
      small: "in the length of the road season",
    }
  return {
    big: `≈ ${days(sum.change)} ${sum.verdict}`,
    small: `road season than in ${sum.firstYear}`,
  }
}

export const verdictColor = (v) => (v === "shorter" ? C.lost : v === "longer" ? C.gained : C.steady)

// ---------------------------------------------------------------------------
// Shared bits

export function DateAxis({ pct, lo, hi }) {
  return (
    <div style={{ position: "relative", height: 14, fontSize: 10, color: C.faint }}>
      {MONTH_TICKS.filter((t) => t.dos > lo + 3 && t.dos < hi - 3).map((t) => (
        <span
          key={t.dos}
          style={{
            position: "absolute",
            left: `${pct(t.dos)}%`,
            transform: "translateX(-50%)",
          }}
        >
          {t.label}
        </span>
      ))}
    </div>
  )
}

export function MonthGrid({ pct, lo, hi }) {
  return MONTH_TICKS.filter((t) => t.dos > lo && t.dos < hi).map((t) => (
    <span
      key={t.dos}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: `${pct(t.dos)}%`,
        borderLeft: `1px dashed ${C.line}`,
      }}
    />
  ))
}

// Calendar date of a day-of-season in a given season, e.g. "Dec 12, 1998".
export const dosToFullDate = (dos, seasonStart) => {
  const ms = Date.UTC(seasonStart, 7, 1) + Math.round(dos) * 86400000
  return new Date(ms).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function useWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    setWidth(el.clientWidth)
    if (typeof ResizeObserver === "undefined") return undefined
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

export const endColor = (e) => (!e.ev.real ? C.steady : e.seasonEffect < 0 ? C.lost : C.gained)

export const STEPS = { strong: 3, moderate: 2, hint: 1, none: 0 }
export function EvidenceMeter({ ev }) {
  const steps = STEPS[ev.tier] ?? 0
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        color: C.muted,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ display: "inline-flex", gap: 2 }} aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              width: 4,
              height: 6 + i * 3,
              borderRadius: 1,
              alignSelf: "flex-end",
              background: i <= steps ? C.ink : C.line,
            }}
          />
        ))}
      </span>
      {ev.label}
    </span>
  )
}

export const CHART = { left: 38, right: 14, top: 22, plot: 116, bottom: 22 }

export function EndChart({
  e,
  sum,
  center,
  spanDays,
  width,
  plot = CHART.plot,
  highlightLatest = false,
  showDecades = true,
}) {
  const [hover, setHover] = useState(null)
  const color = endColor(e)
  const first = sum.firstYear
  const last = sum.lastYear
  const lo = center - spanDays / 2
  const hi = center + spanDays / 2
  const innerW = Math.max(width - CHART.left - CHART.right, 10)
  const H = CHART.top + plot + CHART.bottom
  const x = (d) => CHART.left + ((d - lo) / (hi - lo)) * innerW
  const y = (yr) => CHART.top + ((yr - first) / Math.max(last - first, 1)) * plot
  const moved = e.ev.real && Math.abs(e.shift) >= 1
  const showFit = e.ev.real || e.ev.tier === "hint"

  const decades = []
  if (showDecades) for (let d = Math.ceil((first + 4) / 10) * 10; d < last - 5; d += 10) decades.push(d)

  const onMove = (ev) => {
    const box = ev.currentTarget.getBoundingClientRect()
    const mx = ev.clientX - box.left
    const my = ev.clientY - box.top
    let best = null
    for (const p of e.pts) {
      const d = (x(p.y) - mx) ** 2 + (y(p.x) - my) ** 2
      if (!best || d < best.d) best = { d, p }
    }
    setHover(best && best.d < 30 ** 2 ? best.p : null)
  }

  // Endpoint label placement: keep text inside the chart.
  const labelAt = (d) => (x(d) > width - 70 ? { dx: -9, anchor: "end" } : { dx: 9, anchor: "start" })
  const halo = {
    paintOrder: "stroke",
    stroke: "#fff",
    strokeWidth: 3,
    strokeLinejoin: "round",
  }
  const arrowId = `ct-arrow-${e.kind}`

  return (
    <div style={{ position: "relative" }}>
      <svg
        width={width}
        height={H}
        role="img"
        aria-label={endSentence(e)}
        onPointerMove={e.pts.length ? onMove : undefined}
        onPointerDown={e.pts.length ? onMove : undefined}
        onPointerLeave={() => setHover(null)}
        style={{ display: "block", touchAction: "pan-y", overflow: "visible" }}
      >
        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={color} />
          </marker>
        </defs>

        {/* Plot frame: faint decade rows and month columns. */}
        {decades.map((d) => (
          <g key={d}>
            <line x1={CHART.left} x2={CHART.left + innerW} y1={y(d)} y2={y(d)} stroke={C.line} strokeDasharray="2 3" />
            <text x={CHART.left - 6} y={y(d) + 3} textAnchor="end" fontSize="9.5" fill={C.faint}>
              {d}
            </text>
          </g>
        ))}
        {[first, last].map((yr) => (
          <text
            key={yr}
            x={CHART.left - 6}
            y={y(yr) + 3.5}
            textAnchor="end"
            fontSize="10.5"
            fontWeight="700"
            fill={C.ink}
          >
            {yr}
          </text>
        ))}
        {MONTH_TICKS.filter((t) => t.dos > lo && t.dos < hi).map((t) => (
          <g key={t.dos}>
            <line x1={x(t.dos)} x2={x(t.dos)} y1={CHART.top - 6} y2={CHART.top + plot + 4} stroke={C.line} />
            <text x={x(t.dos)} y={H - 6} textAnchor="middle" fontSize="10" fill={C.muted}>
              {t.label} 1
            </text>
          </g>
        ))}

        {/* Likely range of the trend (95% Sen's-slope interval), pivoting on the data's centre. */}
        {e.ev.real && (
          <polygon
            points={[
              [e.at(first, e.s.sens_slope_lo), first],
              [e.at(first, e.s.sens_slope_hi), first],
              [e.at(last, e.s.sens_slope_hi), last],
              [e.at(last, e.s.sens_slope_lo), last],
            ]
              .map(([d, yr]) => `${x(d)},${y(yr)}`)
              .join(" ")}
            fill={color}
            fillOpacity="0.1"
          />
        )}

        {/* Every recorded season. */}
        {e.pts.map((p) => (
          <circle
            key={p.x}
            cx={x(p.y)}
            cy={y(p.x)}
            r={hover === p ? 5 : 3}
            fill={hover === p ? C.ink : "#94a3b8"}
            fillOpacity={hover === p ? 1 : 0.6}
            stroke="#fff"
            strokeWidth={hover === p ? 1.5 : 0.75}
          />
        ))}

        {/* Most recent season, ringed. */}
        {highlightLatest &&
          e.pts.length > 0 &&
          (() => {
            const p = e.pts.reduce((m, q) => (q.x > m.x ? q : m))
            return <circle cx={x(p.y)} cy={y(p.x)} r="6.5" fill="none" stroke={C.ink} strokeWidth="1.5" />
          })()}

        {/* The trend itself. */}
        {showFit ? (
          <line
            x1={x(e.at(first, e.s.sens_slope))}
            y1={y(first)}
            x2={x(e.at(last, e.s.sens_slope))}
            y2={y(last)}
            stroke={e.ev.real ? color : C.faint}
            strokeWidth={e.ev.real ? 2.75 : 1.5}
            strokeDasharray={e.ev.real ? undefined : "5 4"}
            strokeLinecap="round"
            markerEnd={moved ? `url(#${arrowId})` : undefined}
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
        )}

        {/* Then / now labels. */}
        {moved ? (
          <>
            <circle cx={x(e.then)} cy={y(first)} r="4.5" fill="#fff" stroke={color} strokeWidth="2" />
            <text
              x={x(e.then) + labelAt(e.then).dx}
              y={y(first) - 7}
              textAnchor={labelAt(e.then).anchor}
              fontSize="11"
              fontWeight="700"
              fill={C.ink}
              style={halo}
            >
              {dosToLabel(e.then)}
            </text>
            <text
              x={x(e.now) + labelAt(e.now).dx}
              y={y(last) + 4}
              textAnchor={labelAt(e.now).anchor}
              fontSize="11"
              fontWeight="700"
              fill={color}
              style={halo}
            >
              {dosToLabel(e.now)}
            </text>
          </>
        ) : showFit ? (
          <text
            x={x(e.at(first, e.s.sens_slope)) + (x(e.at(first, e.s.sens_slope)) > width * 0.55 ? 4 : -4)}
            y={CHART.top - 9}
            textAnchor={x(e.at(first, e.s.sens_slope)) > width * 0.55 ? "end" : "start"}
            fontSize="11"
            fontWeight="600"
            fill={C.muted}
            style={halo}
          >
            possible drift, unconfirmed
          </text>
        ) : (
          <text
            x={x(e.s.avg_dos)}
            y={CHART.top - 9}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={C.steady}
            style={halo}
          >
            usually {e.s.avg_date}
          </text>
        )}
      </svg>

      {hover && (
        <div
          style={{
            position: "absolute",
            left: Math.min(Math.max(x(hover.y), 70), width - 70),
            top: y(hover.x) - 10,
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
          <div style={{ fontWeight: 700 }}>
            {e.kind === "open" ? "Opened" : "Closed"} {dosToFullDate(hover.y, hover.x)}
          </div>
          <div style={{ opacity: 0.75 }}>
            {hover.x}–{String(hover.x + 1).slice(2)} season
            {e.ev.real &&
              ` · ${Math.abs(Math.round(hover.y - e.at(hover.x, e.s.sens_slope)))} days ${
                hover.y >= e.at(hover.x, e.s.sens_slope) ? "after" : "before"
              } trend`}
          </div>
        </div>
      )}
    </div>
  )
}

export function SeasonLengthHero({ sum }) {
  const color = verdictColor(sum.verdict)
  const max = Math.max(sum.lenThen, sum.lenNow)
  const drivers = [sum.o, sum.c].filter((e) => e.ev.real && Math.abs(e.shift) >= 1)
  const still = [sum.o, sum.c].filter((e) => !drivers.includes(e))
  const phrase = (e) =>
    e.kind === "open"
      ? `freeze-up now ${days(e.shift)} ${e.shift > 0 ? "later" : "earlier"}`
      : `thaw now ${days(e.shift)} ${e.shift > 0 ? "later" : "earlier"}`
  let why
  if (drivers.length === 0) why = "Neither the opening nor the closing date shows a clear long-term trend."
  else
    why =
      `Driven by ${drivers.map(phrase).join(" and ")}` +
      (still.length ? `; ${still[0].kind === "open" ? "opening" : "closing"} dates haven't clearly changed.` : ".")

  const Bar = ({ year, len, tone }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "34px 1fr",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 10.5, fontWeight: 700, color: C.muted }}>{year}</span>
      <span
        style={{
          display: "block",
          height: 8,
          borderRadius: 4,
          background: C.steadySoft,
        }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            width: `${(len / max) * 100}%`,
            borderRadius: 4,
            background: tone,
          }}
        />
      </span>
    </div>
  )

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
        Season length, {sum.firstYear} → {sum.lastYear}
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
        <div style={{ display: "grid", gap: 4, marginTop: 8 }}>
          <Bar year={sum.firstYear} len={sum.lenThen} tone="#cbd5e1" />
          <Bar year={sum.lastYear} len={sum.lenNow} tone={color} />
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
