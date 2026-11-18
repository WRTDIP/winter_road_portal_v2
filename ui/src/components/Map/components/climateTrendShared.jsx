// Shared pieces for the Climate Trend Statistics section: the season
// summary it reads from, palette, and small formatting/axis helpers.
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

export const verdictColor = (v) => (v === "shorter" ? C.lost : v === "longer" ? C.gained : C.steady)

// ---------------------------------------------------------------------------
// Shared bits

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
