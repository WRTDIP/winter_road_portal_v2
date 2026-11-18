// "Climate Trend Statistics" — bottom section of the road-closure popup.
//
// The section answers one question: is this road's usable season changing over
// the years, and by how much? Everything else (p-values, Pearson's r, SD) is
// supporting evidence and lives behind "Show the numbers".
//
// Three candidate layouts share one summary (summarizeSeason) so they always
// agree on the facts; a debug switcher at the bottom picks between them (and
// the legacy layout, passed in as `legacy`) while we decide.
import { useState } from "react"
import { VersionB1, VersionB2, VersionB3 } from "./ClimateTrendVariants.jsx"
import {
  C,
  DateAxis,
  EndChart,
  EvidenceMeter,
  MonthGrid,
  SeasonLengthHero,
  days,
  endColor,
  endSentence,
  headline,
  summarizeSeason,
  useWidth,
  verdictColor,
} from "./climateTrendShared.jsx"

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

// ---------------------------------------------------------------------------
// Version A — "Then vs now": one headline, two season bars on a date axis.

function VersionA({ sum }) {
  const { o, c } = sum
  const h = headline(sum)
  const lo = Math.min(o.then, o.now, o.s.earliest_dos) - 8
  const hi = Math.max(c.then, c.now, c.s.latest_dos) + 8
  const pct = (v) => ((v - lo) / (hi - lo)) * 100

  const Bar = ({ year, from, to, label, ghost }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "44px 1fr",
        gap: 8,
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{year}</div>
      <div style={{ position: "relative", height: 26 }}>
        <MonthGrid pct={pct} lo={lo} hi={hi} />
        {ghost}
        <div
          style={{
            position: "absolute",
            top: 3,
            bottom: 3,
            left: `${pct(from)}%`,
            width: `${pct(to) - pct(from)}%`,
            background: C.open,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  )

  // The days the recent season lost (red) or gained (blue) at each end.
  const diff = (a, b, lost) =>
    Math.abs(b - a) >= 1 ? (
      <div
        style={{
          position: "absolute",
          top: 3,
          bottom: 3,
          left: `${pct(Math.min(a, b))}%`,
          width: `${pct(Math.max(a, b)) - pct(Math.min(a, b))}%`,
          background: lost ? `repeating-linear-gradient(135deg, ${C.lostSoft} 0 4px, #fecaca 4px 8px)` : C.gainedSoft,
          border: `1px dashed ${lost ? C.lost : C.gained}`,
          borderRadius: 4,
        }}
      />
    ) : null

  return (
    <div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: verdictColor(sum.verdict),
          lineHeight: 1.2,
        }}
      >
        {h.big}
      </div>
      <div style={{ fontSize: 13, color: C.body }}>{h.small}</div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginTop: 14,
        }}
      >
        <Bar year={sum.firstYear} from={o.then} to={c.then} label={days(sum.lenThen)} />
        <Bar
          year={sum.lastYear}
          from={o.now}
          to={c.now}
          label={days(sum.lenNow)}
          ghost={
            <>
              {diff(o.then, o.now, o.now > o.then)}
              {diff(c.then, c.now, c.now < c.then)}
            </>
          }
        />
        <div style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 8 }}>
          <span />
          <DateAxis pct={pct} lo={lo} hi={hi} />
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
        <Key swatch={{ background: C.open }}>Road open</Key>
        {sum.change < 0 && (
          <Key swatch={{ background: C.lostSoft, border: `1px dashed ${C.lost}` }}>Days lost since {sum.firstYear}</Key>
        )}
        {[o, c].some((e) => e.seasonEffect > 0) && (
          <Key
            swatch={{
              background: C.gainedSoft,
              border: `1px dashed ${C.gained}`,
            }}
          >
            Days gained
          </Key>
        )}
      </div>

      <ul
        style={{
          margin: "12px 0 0",
          paddingLeft: 18,
          fontSize: 12.5,
          color: C.body,
          lineHeight: 1.55,
        }}
      >
        <li>{endSentence(o)}</li>
        <li>{endSentence(c)}</li>
      </ul>
    </div>
  )
}

function Key({ swatch, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 14, height: 10, borderRadius: 2, ...swatch }} />
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Version B — "Before → after": the season-length answer up top, then one
// small chart per end of the season. Each chart puts every recorded season on
// a date (x) × year (y) grid, so the long-term trend line can be read against
// the year-to-year scatter it was fitted to, with its likely range as a wedge.
// Both charts share one days-per-pixel scale so their shifts compare directly.

function VersionB({ sum }) {
  const [ref, width] = useWidth()
  const ends = [sum.o, sum.c]
  // One shared days-per-pixel scale: wide enough for the busier end.
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
  const extents = ends.map(extent)
  const spanDays = Math.max(45, ...extents.map(([a, b]) => b - a)) + 14

  return (
    <div ref={ref}>
      <SeasonLengthHero sum={sum} />
      {width > 0 &&
        ends.map((e, i) => (
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
              <span style={{ fontSize: 14, fontWeight: 700, color: endColor(e) }}>
                {e.ev.real && Math.abs(e.shift) >= 1
                  ? `${days(e.shift)} ${e.shift > 0 ? "later" : "earlier"}`
                  : "No clear change"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "2px 10px",
                flexWrap: "wrap",
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 11, color: C.muted }}>
                {e.ev.real
                  ? `likely ${Math.round(Math.min(Math.abs(e.lo), Math.abs(e.hi)))}–${days(
                      Math.max(Math.abs(e.lo), Math.abs(e.hi))
                    )} ${e.shift > 0 ? "later" : "earlier"}`
                  : `usually ${e.s.avg_date}, ranging ${e.s.earliest_date} – ${e.s.latest_date}`}
              </span>
              {e.ev.tier !== "none" && <EvidenceMeter ev={e.ev} />}
            </div>
            <EndChart e={e} sum={sum} width={width} spanDays={spanDays} center={(extents[i][0] + extents[i][1]) / 2} />
          </div>
        ))}
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
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <svg width="10" height="10" aria-hidden="true">
            <circle cx="5" cy="5" r="3" fill="#94a3b8" />
          </svg>
          One season (tap for details)
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <svg width="18" height="10" aria-hidden="true">
            <line x1="1" y1="5" x2="17" y2="5" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Long-term trend
        </span>
        {ends.some((e) => e.ev.real) && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <svg width="18" height="10" aria-hidden="true">
              <polygon points="1,1 17,1 17,9 1,9" fill={C.ink} fillOpacity="0.12" />
            </svg>
            Likely range of the trend
          </span>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Version C — "Verdict card": one word, one number, how sure we are, and why.

function VersionC({ sum }) {
  const { o, c } = sum
  const color = verdictColor(sum.verdict)
  const word = {
    shorter: "Shrinking",
    longer: "Growing",
    stable: "Holding steady",
  }[sum.verdict]
  const sure = {
    strong: {
      steps: 3,
      text: "Very sure — the shift is far bigger than year-to-year noise.",
    },
    moderate: {
      steps: 2,
      text: "Fairly sure — the shift stands out from year-to-year noise.",
    },
    hint: {
      steps: 1,
      text: "There's a weak hint of change, but it could easily be chance.",
    },
    none: {
      steps: 0,
      text: "No sign of a long-term shift; dates just bounce around year to year.",
    },
  }[sum.best]
  // The end doing the moving, if any, is the "why".
  const drivers = [o, c].filter((e) => e.ev.real && Math.abs(e.shift) >= 1)

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          padding: "12px 14px",
          borderRadius: 10,
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderLeft: `4px solid ${color}`,
        }}
      >
        <div style={{ flex: "1 1 160px" }}>
          <div
            style={{
              fontSize: 11,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            The road season is
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1.15 }}>{word}</div>
        </div>
        <div style={{ flex: "0 0 auto", marginLeft: "auto" }}>
          <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1.1 }}>
            {sum.verdict === "stable"
              ? `≈ ${Math.round(sum.lenNow)}`
              : `${sum.change < 0 ? "−" : "+"}${Math.round(Math.abs(sum.change))}`}
            <span style={{ fontSize: 13, fontWeight: 600 }}> days</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>
            {sum.verdict === "stable"
              ? `typical season, ${sum.firstYear}–${sum.lastYear}`
              : `since ${sum.firstYear} · now ≈ ${days(sum.lenNow)}`}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>How sure are we?</div>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background: i <= sure.steps ? C.ink : C.line,
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.body, marginTop: 4 }}>{sure.text}</div>
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: C.muted }}>Why</div>
      <ul
        style={{
          margin: "2px 0 0",
          paddingLeft: 18,
          fontSize: 12.5,
          color: C.body,
          lineHeight: 1.55,
        }}
      >
        {drivers.length === 0 ? (
          <>
            <li>{endSentence(o)}</li>
            <li>{endSentence(c)}</li>
          </>
        ) : (
          <>
            {drivers.map((e) => (
              <li key={e.kind}>
                <b style={{ color: e.seasonEffect < 0 ? C.lost : C.gained }}>
                  {e.kind === "open" ? "Freeze-up" : "Thaw"}
                </b>{" "}
                — {endSentence(e)}
              </li>
            ))}
            {[o, c]
              .filter((e) => !drivers.includes(e))
              .map((e) => (
                <li key={e.kind}>{endSentence(e)}</li>
              ))}
          </>
        )}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------

const VERSIONS = [
  { id: "B", label: "B · current", group: "B variants" },
  { id: "B1", label: "B1 · One chart", group: "B variants" },
  { id: "B2", label: "B2 · By decade", group: "B variants" },
  { id: "B3", label: "B3 · Refined", group: "B variants" },
  { id: "A", label: "A", group: "earlier" },
  { id: "C", label: "C", group: "earlier" },
  { id: "legacy", label: "Old", group: "earlier" },
]
const GROUPS = ["B variants", "earlier"]
// v2: the B variants are new, so start everyone on B1 rather than a stored "B".
const STORAGE_KEY = "wrtdip.climateTrendVersion.v2"

function readVersion() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return VERSIONS.some((x) => x.id === v) ? v : "B1"
  } catch {
    return "B1"
  }
}

export default function ClimateTrendStats({ open, close, openPoints, closePoints, fmtP, legacy }) {
  const [version, setVersion] = useState(readVersion)
  const [showNumbers, setShowNumbers] = useState(false)

  const pick = (v) => {
    setVersion(v)
    try {
      window.localStorage.setItem(STORAGE_KEY, v)
    } catch {
      /* storage unavailable — choice lasts for this page only */
    }
  }

  const sum = summarizeSeason(open, close, openPoints, closePoints)
  const needsBoth = !sum.o || !sum.c

  let body
  if (version === "legacy") body = legacy?.()
  else if (needsBoth) {
    // One end missing: no season length, so fall back to the per-end sentences.
    body = (
      <ul
        style={{
          margin: 0,
          paddingLeft: 18,
          fontSize: 12.5,
          color: C.body,
          lineHeight: 1.55,
        }}
      >
        {sum.o && <li>{endSentence(sum.o)}</li>}
        {sum.c && <li>{endSentence(sum.c)}</li>}
      </ul>
    )
  } else if (version === "B") body = <VersionB sum={sum} />
  else if (version === "B1") body = <VersionB1 sum={sum} />
  else if (version === "B2") body = <VersionB2 sum={sum} />
  else if (version === "B3") body = <VersionB3 sum={sum} />
  else if (version === "C") body = <VersionC sum={sum} />
  else body = <VersionA sum={sum} />

  return (
    <div style={{ width: "100%" }}>
      {body}

      {version !== "legacy" && (
        <>
          <button
            type="button"
            onClick={() => setShowNumbers((d) => !d)}
            style={{
              marginTop: 12,
              padding: 0,
              border: "none",
              background: "none",
              fontSize: 12,
              fontWeight: 600,
              color: "#2563eb",
              cursor: "pointer",
            }}
          >
            {showNumbers ? "Hide the numbers ▴" : "Show the numbers ▾"}
          </button>
          {showNumbers && <NumbersTable open={open} close={close} fmtP={fmtP} />}
        </>
      )}

      {/* Debug: layout switcher while we choose a design. Remove once decided. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
          marginTop: 16,
          paddingTop: 8,
          borderTop: `1px dashed ${C.faint}`,
          fontSize: 11,
          color: C.muted,
        }}
      >
        {GROUPS.map((g) => (
          <div
            key={g}
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 6,
              width: "100%",
            }}
          >
            <span style={{ fontFamily: "monospace", minWidth: 92 }}>
              {g === GROUPS[0] ? "debug · " : ""}
              {g}
            </span>
            {VERSIONS.filter((v) => v.group === g).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => pick(v.id)}
                aria-pressed={version === v.id}
                style={{
                  padding: "4px 10px",
                  minHeight: 28,
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: `1px solid ${version === v.id ? C.ink : C.line}`,
                  background: version === v.id ? C.ink : "#fff",
                  color: version === v.id ? "#fff" : C.muted,
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
