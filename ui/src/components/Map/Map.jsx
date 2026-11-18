import { useEffect, useRef, useState, useMemo } from "react"

import { Modal } from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import { loadModules } from "esri-loader"
import "./styles.css"
import {
  citiesOfNorthwestTerritories,
  citiesOfNunavut,
  citiesOfYukon,
  layerData,
  northWestCoordinates,
  nunavutCoordinates,
  yukonCoordinates,
} from "./Data.js"
import { getClimateCity } from "../../services/meteo.service.js"
import { cities } from "../../utils/constants.js"
import { LineChart } from "@mui/x-charts/LineChart"
import { BarChart } from "@mui/x-charts/BarChart"
import { FormControlLabel, Icon, Switch, Tab, Tabs, Typography } from "@mui/material"
import useMediaQuery from "@mui/material/useMediaQuery"
import OpenInFullIcon from "@mui/icons-material/OpenInFull"
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen"
import TuneIcon from "@mui/icons-material/Tune"
import AcUnitIcon from "@mui/icons-material/AcUnit"
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment"
import WaterDropIcon from "@mui/icons-material/WaterDrop"
import ForecastPanel from "./ForecastPanel.jsx"
import YearRangeSlider from "../YearRangeSlider/YearRangeSlider.jsx"
import FddChart, { MIN_GRAPH_POINTS } from "./components/FddChart"
import PrecipChart, { PRECIP_BAR_GAPS } from "./components/PrecipChart"
import ChartScroller from "./components/ChartScroller.jsx"
import ClimateTrendStats from "./components/ClimateTrendStats.jsx"
import useSheetDrag from "../../hooks/useSheetDrag.js"

const API_BASE = "https://dev-moh.wramp.ca/python-api";

// A road season starting in year Y runs into Y+1 (it opens in winter). Label it
// as a season so "2025" is not read as the winter of early 2025: "'25–26" on an
// axis tick, "2025–26" in a tooltip.
const seasonLabel = (y, ctx) => {
  if (y == null) return ""
  const next = String(Number(y) + 1).slice(2)
  return ctx?.location === "tick" ? `’${String(y).slice(2)}–${next}` : `${y}–${next}`
}

// Temperature Max/Avg/Min: warm, dark and cool. Orange vs blue stays distinct
// for colour-blind readers, unlike the old red/blue/green.
const TEMP_COLORS = { max: "#c2410c", avg: "#1e293b", min: "#2563eb" }
const fmtTemp = (v) => (v == null ? "No data" : `${v.toFixed(1)} °C`)

// Short month names for chart labels.
const MONTH_ABBR = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Horizontal space each season gets in the road-popup charts. A road can carry
// 40+ seasons, and on a phone the popup leaves the plot barely 220px wide — at
// that point the duration bars collapse to ~4px and the trend marks smear into
// a line. Below these widths the chart stops compressing and scrolls sideways
// inside its own container instead (the pattern the city modal already uses).
// The pointer floor is deliberately low: the widest popup fits today's longest
// record without scrolling, so it only kicks in for an even longer one.
const POPUP_CHART_SLOT = { compact: 22, wide: 8 }

// Axis gutters for the road-popup charts. On a phone the rotated y-axis label
// costs about a quarter of the plot for something both captions below the chart
// and the tick text already say, so it is dropped there and the gutter shrinks
// to what the tick labels alone need.
const popupChartGeometry = ({ count, compact, tickGutter, height }) => {
  const left = compact ? tickGutter : tickGutter + 26
  const right = 18
  const top = 16
  const bottom = compact ? 34 : 50
  const slot = compact ? POPUP_CHART_SLOT.compact : POPUP_CHART_SLOT.wide
  return {
    margin: { left, right, top, bottom },
    minWidth: Math.ceil(left + right + Math.max(count, 1) * slot),
    height,
    // Year labels need ~26px; thin them out until they fit their own slot.
    labelEvery: Math.max(1, Math.ceil(26 / slot)),
    // Wide touch bars need a visible gap to read as separate seasons; the
    // narrow pointer bars cannot spare the pixels.
    categoryGapRatio: compact ? 0.28 : 0.1,
  }
}

// Stations with fewer than this many seasons of data get a persistent warning
// banner: the record is too short to reliably assess long-term climate trends
// (30 years is the standard climate-normal period).
const SHORT_RECORD_YEARS = 30

// Map city names (as they appear in Data.js) to weather station IDs
// Uses station IDs that have both ECCC and AHCCD data where possible
const CITY_STATION_MAP = {
  // NWT
  "Yellowknife": 51058,
  "Hay River": 1663,
  "Inuvik": 27222,
  "Norman Wells": 50717,
  "Fort Simpson": 27609,
  "Fort Smith": 1659,
  "Fort Good Hope": 53580,
  "Fort McPherson": 1647,
  "Fort Liard": 10687,
  "Fort Providence": 1651,
  "Fort Resolution": 1653,
  "Tuktoyaktuk": 26987,
  "Sachs Harbour": 10076,
  "Paulatuk": 26986,
  "Wrigley": 53601,
  "Deline": 27749,
  "Tulita": 52967,
  "Ulukhaktok": 1692,
  "Colville Lake": 1636,
  "Lutselke": 1676,
  // Yukon
  "Whitehorse": 50842,
  "Dawson": 10194,
  "Old Crow": 53023,
  "Mayo": 54178,
  "Watson Lake": 54198,
  "Carmacks": 1527,
  "Teslin": 1609,
  "Faro": 8964,
  "Ross River": 1592,
  "Haines Junction": 1556,
  "Burwash Landing": 10192,
  "Beaver Creek": 1516,
  // Nunavut
  "Iqaluit": 52079,
  "Resolute": 53060,
  "Alert": 1731,
  "Cambridge Bay": 54139,
  "Baker Lake": 54138,
  "Rankin Inlet": 51277,
  "Coral Harbour": 54220,
  "Arviat": 41576,
  "Kugluktuk": 54158,
  "Gjoa Haven": 41943,
  "Pond Inlet": 1773,
  "Arctic Bay": 1732,
  "Grise Fiord": 1754,
  "Clyde River": 1743,
  "Pangnirtung": 10721,
  "Kugaaruk": 43006,
  "Chesterfield": 1710,
  "Ennadai": 1714,
  "Taloyoak": 54219,
};

// Thermal palette shared by the road-season charts. Icy blue = colder / ice is
// solid / earlier openings; orange → red = warmer / thaw / delayed openings and
// earlier closures. Orange is the everyday "thaw / closed" tone; red is reserved
// for strong warming shifts. Green is deliberately absent so "warmer" never
// reads as OK.
const THERMAL = {
  cold: "#0ea5e9",
  coldDeep: "#0369a1",
  coldSoft: "#bae6fd",
  warm: "#dc2626",
  warmDeep: "#9a3412",
  warmMid: "#f97316",
  warmSoft: "#fdba74",
  warmTint: "#fff7ed",
  warmEdge: "#fed7aa",
  ink: "#1e293b",
  muted: "#64748b",
}

// Small thermal markers: fire where things are getting hotter, a snowflake
// where they are getting colder.
const FireIcon = (props) => <LocalFireDepartmentIcon {...props} />
const SnowIcon = (props) => <AcUnitIcon {...props} />

// Interactive gauge summarising the shortest / average / longest season a road
// has had. The track is a thermal scale centred on the average: seasons shorter
// than usual sit on the warm (amber → red) side, longer ones on the cold (blue)
// side, with hard-edged bands at one, two and three standard deviations and
// white beyond that. Hovering shows the day count and how unusual it is.
function DurationHeatGauge({ durationDays }) {
  const trackRef = useRef(null)
  const [hover, setHover] = useState(null) // { pct, days, label, color }
  const clearTimer = useRef(null)
  useEffect(() => () => clearTimeout(clearTimer.current), [])

  if (!durationDays || durationDays.length === 0) return null

  const min = Math.min(...durationDays)
  const max = Math.max(...durationDays)
  const avg = durationDays.reduce((s, d) => s + d, 0) / durationDays.length
  // Population standard deviation of the per-season durations.
  const sd = Math.sqrt(
    durationDays.reduce((s, d) => s + (d - avg) ** 2, 0) / durationDays.length
  )

  const { cold, coldDeep, coldSoft, warm, warmMid, warmSoft, ink } = THERMAL
  const WHITE = "#ffffff"
  const GREY = "#94a3b8"

  // Domain spans three standard deviations either side of the average (with a
  // little padding for the white "beyond 3σ" zones). Fall back to a small
  // window when every season has the same duration (sd === 0).
  const unit = sd > 0 ? sd : Math.max(avg * 0.1, 1)
  const pad = Math.max(unit * 0.5, 4)
  const lo = avg - 3 * unit - pad
  const hi = avg + 3 * unit + pad
  const span = hi - lo
  const pos = (v) => Math.max(0, Math.min(100, ((v - lo) / span) * 100))
  const valueAt = (pct) => lo + (pct / 100) * span

  const minPct = pos(min)
  const avgPct = pos(avg)
  const maxPct = pos(max)

  // Standard-deviation band boundaries around the average.
  const sd1Lo = pos(avg - unit)
  const sd1Hi = pos(avg + unit)
  const sd2Lo = pos(avg - 2 * unit)
  const sd2Hi = pos(avg + 2 * unit)
  const sd3Lo = pos(avg - 3 * unit)
  const sd3Hi = pos(avg + 3 * unit)

  // Hard-edged bands (coincident stops at each boundary so colours don't
  // blend). Shorter-than-average seasons run amber → red, longer ones run
  // light → deep blue: white | red | amber | pale amber ‖ pale blue | blue | navy | white.
  const gradient =
    `linear-gradient(to right, ` +
    `${WHITE} 0%, ${WHITE} ${sd3Lo}%, ` +
    `${warm} ${sd3Lo}%, ${warm} ${sd2Lo}%, ` +
    `${warmMid} ${sd2Lo}%, ${warmMid} ${sd1Lo}%, ` +
    `${warmSoft} ${sd1Lo}%, ${warmSoft} ${avgPct}%, ` +
    `${coldSoft} ${avgPct}%, ${coldSoft} ${sd1Hi}%, ` +
    `${cold} ${sd1Hi}%, ${cold} ${sd2Hi}%, ` +
    `${coldDeep} ${sd2Hi}%, ${coldDeep} ${sd3Hi}%, ` +
    `${WHITE} ${sd3Hi}%, ${WHITE} 100%)`

  // Classify a duration for the hover readout: how unusual it is (σ band,
  // expressed as the share of seasons expected in that band under a normal
  // distribution) and which way it leans — shorter seasons mean warmer winters.
  const classify = (value) => {
    const z = (value - avg) / unit
    const az = Math.abs(z)
    const shorter = z < 0
    const lean = shorter ? "shorter — warmer-winter territory" : "longer — colder-winter territory"
    if (az <= 1) return { color: shorter ? warmMid : cold, label: `typical · ≈68% of seasons · ${lean}` }
    if (az <= 2) return { color: shorter ? warmMid : cold, label: `uncommon · ≈27% of seasons · ${lean}` }
    if (az <= 3) return { color: shorter ? warm : coldDeep, label: `rare · ≈4% of seasons · ${lean}` }
    return { color: GREY, label: `very rare · <1% of seasons · ${lean}` }
  }

  // Pointer events, not mouse events, so a tap or a finger sliding along the
  // bar shows the readout on a phone too. A touch readout clears itself
  // shortly after the finger lifts instead of sticking forever.
  const handleMove = (e) => {
    clearTimeout(clearTimer.current)
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const value = valueAt(pct)
    const days = Math.max(0, Math.round(value))
    const { color, label } = classify(value)
    setHover({ pct, days, label, color })
  }

  const Marker = ({ pct, color, label, value, below }) => (
    <div
      style={{
        position: "absolute",
        left: `${pct}%`,
        top: below ? "auto" : 0,
        bottom: below ? 0 : "auto",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: below ? "column-reverse" : "column",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, color, lineHeight: 1.2, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: "#475569", lineHeight: 1.2, whiteSpace: "nowrap" }}>
        {Math.round(value)} days
      </span>
      <div style={{ width: 2, height: 8, background: color, marginTop: below ? 0 : 2, marginBottom: below ? 2 : 0 }} />
    </div>
  )

  return (
    <div style={{ width: "100%", padding: "4px 12px 2px" }}>
      {/* The numbers in words first, so the gauge is a picture of them rather
          than the only way to read them. */}
      <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.45, marginBottom: 6 }}>
        <strong>Usually {Math.max(0, Math.round(avg - unit))}–{Math.round(avg + unit)} days open</strong>
        {" "}· shortest {min} · longest {max} · {durationDays.length} seasons
      </div>
      <div style={{ position: "relative", height: 36 }}>
        {hover ? (
          <div
            style={{
              position: "absolute",
              left: `${hover.pct}%`,
              top: 0,
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: hover.color, lineHeight: 1.2, whiteSpace: "nowrap" }}>
              {hover.days} days
            </span>
            <span style={{ fontSize: 10, color: "#475569", lineHeight: 1.2, whiteSpace: "nowrap" }}>
              {hover.label}
            </span>
            <div style={{ width: 2, height: 8, background: hover.color, marginTop: 2 }} />
          </div>
        ) : (
          <Marker pct={avgPct} color={ink} label="Average" value={avg} />
        )}
      </div>
      <div
        ref={trackRef}
        onPointerDown={handleMove}
        onPointerMove={handleMove}
        onPointerLeave={() => setHover(null)}
        onPointerUp={(e) => {
          if (e.pointerType !== "mouse") clearTimer.current = setTimeout(() => setHover(null), 2500)
        }}
        style={{
          position: "relative",
          height: 22,
          touchAction: "pan-y",
          borderRadius: 11,
          background: gradient,
          border: "1px solid #e2e8f0",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08)",
          cursor: "crosshair",
        }}
      >
        {hover ? (
          <div
            style={{
              position: "absolute",
              left: `${hover.pct}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: "rgba(15,23,42,0.7)",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          />
        ) : null}
      </div>
      <div style={{ position: "relative", height: 36, marginTop: 2 }}>
        <Marker pct={minPct} color={warm} label="Shortest" value={min} below />
        <Marker pct={maxPct} color={cold} label="Longest" value={max} below />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          marginTop: 2,
          fontSize: 10.5,
          fontWeight: 600,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 3, color: warm }}>
          <FireIcon sx={{ fontSize: 14 }} /> Shorter season · warmer winters
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 3, color: cold, textAlign: "right" }}>
          Longer season · colder winters <SnowIcon sx={{ fontSize: 14 }} />
        </span>
      </div>
    </div>
  )
}

function WeatherMap() {
  // References for DOM elements and data
  const weatherData = useRef(null)
  const MapElement = useRef(null)
  const [territory, setTerritory] = useState(null)
  const [key, setKey] = useState(null)
  const [mouse, setMouse] = useState({})
  
  // These two states are created for province and stationCode
  const [climateData, setClimateData] = useState(null)
  const [climateLoading, setClimateLoading] = useState(false)

  // State to control modal visibility
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [modalEnlarge, setModalEnlarge] = useState(false)
  // Section the Climate & Weather body is scrolled to, for the jump links.
  const [climateSection, setClimateSection] = useState("forecast")
  const climateBodyRef = useRef(null)

  // Custom feature popup state (replaces ArcGIS native popup)
  const [featurePopup, setFeaturePopup] = useState(null) // {title, content, layerTitle, screenX, screenY}

  // Road closure open/close trend chart state
  const [roadTrendName, setRoadTrendName] = useState("")
  const [roadTrendLoading, setRoadTrendLoading] = useState(false)
  const [roadTrend, setRoadTrend] = useState(null) // backend payload
  // Whether the road popup is enlarged (centered on screen like a modal).
  // Desktop only; on a phone the popup is a bottom sheet sized by roadSheetSnap.
  const [roadPopupEnlarged, setRoadPopupEnlarged] = useState(false)
  // Phone bottom-sheet height: "peek" (header and tabs), "half" or "full".
  const [roadSheetSnap, setRoadSheetSnap] = useState("half")
  // Which tab of the road popup is showing. Persists across road popups for
  // the page session, so a reader comparing roads stays on the same view.
  const [roadTab, setRoadTab] = useState("season")
  // Climate trend statistics (bottom section of the road popup).
  const [roadStats, setRoadStats] = useState(null) // backend payload
  const [roadStatsLoading, setRoadStatsLoading] = useState(false)
  // FDD chart state
  const [fddSeries, setFddSeries] = useState([]) // [{stationId, stationName, years, fdds}]
  const [fddLoading, setFddLoading] = useState(false)
  const [fddDatasets, setFddDatasets] = useState([])
  const [fddDatasetId, setFddDatasetId] = useState("")
  const [cityStations, setCityStations] = useState([]) // [{station_id, name}]
  const [selectedStations, setSelectedStations] = useState([]) // [stationId, ...]
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showCalcInfo, setShowCalcInfo] = useState(false)
  const [fddViewRange, setFddViewRange] = useState([1951, 2023])
  const [fddYRange, setFddYRange] = useState([0, 5000])
  const [showLowess, setShowLowess] = useState(true)
  const [lowessSeries, setLowessSeries] = useState([]) // [{stationId, years, fdds}]
  const [snowfallData, setSnowfallData] = useState(null) // {labels: [], avgs: [], maxs: [], mins: []}
  const [snowfallLoading, setSnowfallLoading] = useState(false)
  // Default month range: current month ±1 (wrapping Dec↔Jan)
  const currentMonth = new Date().getMonth() + 1 // 1-indexed
  const defaultMonthStart = currentMonth === 1 ? 12 : currentMonth - 1
  const defaultMonthEnd = currentMonth === 12 ? 1 : currentMonth + 1

  const [snowMonthRange, setSnowMonthRange] = useState([defaultMonthStart, defaultMonthEnd])
  const [snowShowMax, setSnowShowMax] = useState(true)
  const [snowShowAvg, setSnowShowAvg] = useState(true)
  const [snowShowMin, setSnowShowMin] = useState(true)
  // Precipitation / snowfall share one section; this picks which panel shows.
  const [precipSnowView, setPrecipSnowView] = useState("precipitation")
  const [precipData, setPrecipData] = useState(null) // {labels: [], avgs: [], maxs: [], mins: []}
  const [precipLoading, setPrecipLoading] = useState(false)
  // CanHomP V2 resolutions this station has data for, from /precip-datasets.
  const [precipSources, setPrecipSources] = useState([])
  const [precipResolution, setPrecipResolution] = useState("daily")
  const [precipMonthRange, setPrecipMonthRange] = useState([defaultMonthStart, defaultMonthEnd])
  const [precipShowMax, setPrecipShowMax] = useState(true)
  const [precipShowAvg, setPrecipShowAvg] = useState(true)
  const [precipShowMin, setPrecipShowMin] = useState(true)
  // Per-month Mann-Kendall / Sen's slope trends for the precipitation table.
  const [precipTrend, setPrecipTrend] = useState(null)
  const [precipTrendLoading, setPrecipTrendLoading] = useState(false)
  const [tempData, setTempData] = useState(null) // {labels: [], avgs: [], maxs: [], mins: []}
  const [tempLoading, setTempLoading] = useState(false)
  const [tempMonthRange, setTempMonthRange] = useState([defaultMonthStart, defaultMonthEnd])
  const [tempShowMax, setTempShowMax] = useState(true)
  const [tempShowAvg, setTempShowAvg] = useState(true)
  const [tempShowMin, setTempShowMin] = useState(true)
  // Matches the --bp-md breakpoint the stylesheet uses, so the JS and CSS
  // mobile branches never disagree at exactly 768px.
  const isMobile = useMediaQuery("(max-width:767.98px)")
  // For effects that should read the current layout without re-running on a
  // rotation.
  const isMobileRef = useRef(isMobile)
  isMobileRef.current = isMobile

  /**
   * Effect hook to load data when component mounts.
   */
  useEffect(() => {
    loadData(weatherData, MapElement)
  }, [])

  // Layers whose popups should show expected (historical-average) open/close
  // dates fetched from the road_closures dataset.
  const ROAD_CLOSURE_LAYERS = useMemo(
    () => [
      "Winter Roads - Northwest Territories",
      "Winter Roads - Nunavut",
      "Ice Crossings - Northwest Territories",
      "Ice Crossings - Yukon",
    ],
    []
  )

  // When a road-closure feature popup opens, fetch the expected open/close
  // dates for the current season and fill in the placeholder in the popup body.
  useEffect(() => {
    if (!featurePopup) return
    if (!ROAD_CLOSURE_LAYERS.includes(featurePopup.layerTitle)) return
    if (featurePopup.roadForecastDone) return
    if (!featurePopup.content || !featurePopup.content.includes("data-road-forecast")) return

    const roadName = featurePopup.title
    let cancelled = false

    // An actual date keeps its year. A predicted one is an average over the
    // whole record, so it gets month and day only: "January 31, 2027" read as
    // a forecast for a specific season, which it is not.
    const fmt = (iso, predicted) => {
      if (!iso) return null
      const d = new Date(iso + "T00:00:00")
      return predicted
        ? `around ${d.toLocaleDateString("en-CA", { month: "long", day: "numeric" })}`
        : d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })
    }

    fetch(`${API_BASE}/road-closure-forecast?road_name=${encodeURIComponent(roadName)}`)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return
        const d = res?.data || {}
        const open = fmt(d.expected_open, d.open_predicted)
        const close = fmt(d.expected_close, d.close_predicted)

        let html
        if (!d.matched || (!open && !close)) {
          html = `<div data-road-forecast><em>No historical closure data available.</em></div>`
        } else {
          // No season in brackets — averages are computed across the full
          // historical record, so a single season label is misleading.
          const openLabel = d.open_predicted ? "Usually opens" : "Opened"
          const closeLabel = d.close_predicted ? "Usually closes" : "Closed"
          const n = Math.max(d.open_samples || 0, d.close_samples || 0)
          html =
            `<div data-road-forecast>` +
            `<b>${openLabel}:</b> ${open || "N/A"}<br>` +
            `<b>${closeLabel}:</b> ${close || "N/A"}<br>` +
            (d.open_predicted || d.close_predicted
              ? `<span class="wrtdip-forecast-note">Average of ${n} seasons on record</span>`
              : "") +
            `</div>`
        }

        setFeaturePopup((prev) => {
          if (!prev || prev.title !== roadName || prev.layerTitle !== featurePopup.layerTitle) {
            return prev
          }
          return {
            ...prev,
            roadForecastDone: true,
            content: prev.content.replace(
              /<div data-road-forecast>[\s\S]*?<\/div>/,
              html
            ),
          }
        })
      })
      .catch(() => {
        if (cancelled) return
        setFeaturePopup((prev) => {
          if (!prev || prev.title !== roadName) return prev
          return {
            ...prev,
            roadForecastDone: true,
            content: prev.content.replace(
              /<div data-road-forecast>[\s\S]*?<\/div>/,
              `<div data-road-forecast><em>Expected dates unavailable.</em></div>`
            ),
          }
        })
      })

    return () => {
      cancelled = true
    }
  }, [featurePopup, ROAD_CLOSURE_LAYERS])

  // When a road-closure feature popup opens, load the open/close trend data
  // so the chart can be rendered inline inside the popup.
  const roadTrendFetchedFor = useRef(null)
  const popupRoadName =
    featurePopup && ROAD_CLOSURE_LAYERS.includes(featurePopup.layerTitle)
      ? featurePopup.title
      : null

  useEffect(() => {
    if (!popupRoadName) return
    if (roadTrendFetchedFor.current === popupRoadName) return // already loaded for this road

    roadTrendFetchedFor.current = popupRoadName
    let cancelled = false
    setRoadTrendName(popupRoadName)
    setRoadTrend(null)
    setRoadTrendLoading(true)
    fetch(`${API_BASE}/road-closure-trend?road_name=${encodeURIComponent(popupRoadName)}`)
      .then((r) => r.json())
      .then((res) => {
        if (!cancelled) setRoadTrend(res?.data || null)
      })
      .catch(() => {
        if (!cancelled) setRoadTrend(null)
      })
      .finally(() => {
        if (!cancelled) setRoadTrendLoading(false)
      })

    // Summary trend statistics for the bottom "Climate Trend Statistics" section.
    setRoadStats(null)
    setRoadStatsLoading(true)
    fetch(`${API_BASE}/road-closure-stats?road_name=${encodeURIComponent(popupRoadName)}`)
      .then((r) => r.json())
      .then((res) => {
        if (!cancelled) setRoadStats(res?.data || null)
      })
      .catch(() => {
        if (!cancelled) setRoadStats(null)
      })
      .finally(() => {
        if (!cancelled) setRoadStatsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [popupRoadName])

  // Each road popup opens at the default size: compact on desktop, a half-height
  // sheet on a phone, so the road stays visible on the map above it.
  //
  // This fires on the open itself, not on every road: switching straight from
  // one road to another keeps whatever size the user chose, and a rotation
  // that flips isMobile mid-popup leaves that choice alone too. Closing ends
  // the run, so the next popup opens at the default again.
  const roadPopupWasOpen = useRef(false)

  useEffect(() => {
    const open = popupRoadName != null
    if (open === roadPopupWasOpen.current) return

    roadPopupWasOpen.current = open
    if (open) {
      setRoadPopupEnlarged(false)
      setRoadSheetSnap("half")
    }
  }, [popupRoadName])

  const closeFeaturePopup = () => {
    setFeaturePopup(null)
    setRoadPopupEnlarged(false)
  }
  const roadSheet = useSheetDrag({
    enabled: isMobile && popupRoadName != null,
    snap: roadSheetSnap,
    setSnap: setRoadSheetSnap,
    onClose: closeFeaturePopup,
  })

  // Convert a "day of season" (days since Aug 1) back to a readable date label.
  const SEASON_BASE_MS = Date.UTC(2001, 7, 1) // Aug 1
  const dosToLabel = (dos) => {
    if (dos == null || isNaN(dos)) return ""
    const d = new Date(SEASON_BASE_MS + dos * 86400000)
    return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" })
  }

  // Render the open/close scatter + LOWESS trend chart for the current road.
  const renderRoadTrendChart = (height = 320) => {
    if (roadTrendLoading) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
          Loading trend data…
        </Typography>
      )
    }

    const years = roadTrend?.years || []
    const openScatter = roadTrend?.open_scatter || []
    const closeScatter = roadTrend?.close_scatter || []
    const openLowess = roadTrend?.open_lowess || []
    const closeLowess = roadTrend?.close_lowess || []

    if (!roadTrend?.matched || (openScatter.length === 0 && closeScatter.length === 0)) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
          No historical open/close data available for this road.
        </Typography>
      )
    }

    // Blue = opening (freeze-up, cold), Orange = closing (thaw, warm).
    const OPEN_COLOR = THERMAL.cold
    const CLOSE_COLOR = THERMAL.warmMid

    // Align the raw points to the shared year axis (null where a year has no
    // record) so they can be drawn as marks on a LineChart.
    const openByYear = Object.fromEntries(openScatter.map((p) => [p.x, p.y]))
    const closeByYear = Object.fromEntries(closeScatter.map((p) => [p.x, p.y]))
    const openRaw = years.map((y) => (openByYear[y] != null ? openByYear[y] : null))
    const closeRaw = years.map((y) => (closeByYear[y] != null ? closeByYear[y] : null))

    // Tighten the y-axis to the data range (with a little padding) so the
    // points and trends use the full vertical space instead of clustering.
    const allY = [
      ...openScatter.map((p) => p.y),
      ...closeScatter.map((p) => p.y),
      ...openLowess.filter((v) => v != null),
      ...closeLowess.filter((v) => v != null),
    ]
    const yMin = allY.length ? Math.floor(Math.min(...allY) - 5) : undefined
    const yMax = allY.length ? Math.ceil(Math.max(...allY) + 5) : undefined

    // Shade the chart by road status: blue between the opening and closing
    // trend lines (road open — ice is solid) and a warm amber wash everywhere
    // else (road closed — too warm for ice). The amber is a full-height area
    // covering the whole plot; the blue band is two stacked areas — a
    // transparent base on the opening trend and a fill carrying the
    // (close − open) gap — so it spans exactly from the opening line up to the
    // closing line. Both are null wherever either trend is missing so the
    // shading only covers the range where both trends exist.
    const redBackgroundData = years.map(() => yMax)
    const bandFillData = years.map((_, i) => {
      const o = openLowess[i]
      const c = closeLowess[i]
      return o != null && c != null ? c - o : null
    })
    const bandBaseData = years.map((_, i) =>
      bandFillData[i] != null ? openLowess[i] : null
    )

    const series = [
      // Warm "closed" background: a full-height area filling the whole plot.
      // Drawn first so the blue band and the data sit on top of it.
      {
        type: "line",
        id: "redBg",
        data: redBackgroundData,
        area: true,
        showMark: false,
        connectNulls: true,
        color: "transparent",
        valueFormatter: () => null,
      },
      // Blue "open" band between the trend lines (transparent stacked base on
      // the opening trend + a fill carrying the close−open gap).
      {
        type: "line",
        id: "bandBase",
        data: bandBaseData,
        stack: "band",
        area: false,
        showMark: false,
        connectNulls: true,
        curve: "monotoneX",
        color: "transparent",
        valueFormatter: () => null,
      },
      {
        type: "line",
        id: "bandFill",
        data: bandFillData,
        stack: "band",
        area: true,
        showMark: false,
        connectNulls: true,
        curve: "monotoneX",
        color: "transparent",
        valueFormatter: () => null,
      },
      // Order matters for the legend: Opening, Opening trend, Closing, Closing trend.
      // Raw points (rendered as marks only — the connecting line is hidden via sx).
      {
        type: "line",
        id: "openPts",
        label: "Opening (freeze-up)",
        color: OPEN_COLOR,
        data: openRaw,
        showMark: true,
        connectNulls: false,
        valueFormatter: (v) => (v == null ? "" : dosToLabel(v)),
      },
      {
        type: "line",
        id: "openTrend",
        label: "Opening trend",
        color: OPEN_COLOR,
        data: openLowess,
        showMark: false,
        connectNulls: true,
        curve: "monotoneX",
        valueFormatter: (v) => (v == null ? "" : dosToLabel(v)),
      },
      {
        type: "line",
        id: "closePts",
        label: "Closing (thaw)",
        color: CLOSE_COLOR,
        data: closeRaw,
        showMark: true,
        connectNulls: false,
        valueFormatter: (v) => (v == null ? "" : dosToLabel(v)),
      },
      {
        type: "line",
        id: "closeTrend",
        label: "Closing trend",
        color: CLOSE_COLOR,
        data: closeLowess,
        showMark: false,
        connectNulls: true,
        curve: "monotoneX",
        valueFormatter: (v) => (v == null ? "" : dosToLabel(v)),
      },
    ]

    // Tick labels are dates ("Apr 8"), so the left gutter has to clear ~52px of
    // text before the axis line.
    const geo = popupChartGeometry({
      count: years.length,
      compact: isMobile,
      tickGutter: 52,
      height,
    })

    return (
      <div style={{ width: "100%" }}>
        {/* The chart is wider than the popup and scrolls, so its legend has to
            live outside the scroller or it drifts off-screen with the plot. */}
        <div className="wrtdip-popup-legend">
          {[
            { label: "Opening (freeze-up)", color: OPEN_COLOR, kind: "mark" },
            { label: "Opening trend", color: OPEN_COLOR, kind: "dash" },
            { label: "Closing (thaw)", color: CLOSE_COLOR, kind: "mark" },
            { label: "Closing trend", color: CLOSE_COLOR, kind: "dash" },
          ].map((item) => (
            <span key={item.label} className="wrtdip-popup-legend__item">
              <span
                className={`wrtdip-popup-legend__swatch wrtdip-popup-legend__swatch--${item.kind}`}
                style={{ color: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
        <ChartScroller
          minWidth={geo.minWidth}
          hint="Scroll sideways to see every season"
        >
          <LineChart
            height={geo.height}
            series={series}
            xAxis={[
              {
                data: years,
                scaleType: "point",
                label: isMobile ? undefined : "Season",
                valueFormatter: seasonLabel,
                tickInterval: (v, i) => i % geo.labelEvery === 0,
                tickLabelStyle: { fontSize: 12 },
              },
            ]}
            yAxis={[
              {
                label: isMobile ? undefined : "Date",
                min: yMin,
                max: yMax,
                valueFormatter: (v) => dosToLabel(v),
                tickLabelStyle: { fontSize: 12 },
              },
            ]}
            margin={geo.margin}
            grid={{ horizontal: true }}
            slotProps={{
              legend: { hidden: true },
              // The chart's hover tooltip renders in a Popper. Its default
              // z-index sits below the road-closure popup (5000/6000), so lift
              // it above the popup to keep the datapoint tooltip on top.
              popper: {
                sx: { zIndex: 7000 },
              },
            }}
            sx={{
              // The y-axis label sits at a fixed offset that ignores tick-label
              // width, so wide date labels (e.g. "Jan 15") overlap it. Nudge the
              // label group further left to clear them.
              "& .MuiChartsAxis-left .MuiChartsAxis-label": { transform: "translateX(-28px)" },
              // Hide the connecting lines for the raw-point series; keep only marks.
              "& .MuiLineElement-series-openPts": { display: "none" },
              "& .MuiLineElement-series-closePts": { display: "none" },
              // Hide the line strokes of the shading helper series (only fills show).
              "& .MuiLineElement-series-redBg": { display: "none" },
              "& .MuiLineElement-series-bandBase": { display: "none" },
              "& .MuiLineElement-series-bandFill": { display: "none" },
              // Soft orange "closed" wash and solid blue "open" band.
              "& .MuiAreaElement-series-redBg": { fill: THERMAL.warmMid, fillOpacity: 0.14 },
              "& .MuiAreaElement-series-bandFill": { fill: OPEN_COLOR, fillOpacity: 0.3 },
              // Dash the trend lines so they read distinctly from the points.
              "& .MuiLineElement-series-openTrend": { strokeDasharray: "6 4" },
              "& .MuiLineElement-series-closeTrend": { strokeDasharray: "6 4" },
              // Marks are drawn as paths, so thicken the ring rather than the
              // radius to keep neighbouring seasons separable.
              "& .MuiMarkElement-root": { strokeWidth: 2 },
            }}
          />
        </ChartScroller>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "4px 16px",
            marginTop: 4,
            fontSize: 11,
            color: THERMAL.muted,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 10, borderRadius: 2, background: OPEN_COLOR, opacity: 0.3 }} />
            <AcUnitIcon sx={{ fontSize: 13, color: THERMAL.cold }} />
            Road open — ice is solid
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 10, borderRadius: 2, background: THERMAL.warmMid, opacity: 0.35 }} />
            <FireIcon sx={{ fontSize: 13, color: THERMAL.warmMid }} />
            Road closed — too warm for safe ice
          </span>
        </div>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, textAlign: "center" }}>
          If the blue band narrows from left to right, the season is shrinking.
        </Typography>
      </div>
    )
  }

  // Render a bar chart of the open duration (days the road was open) per season.
  // Duration = closing day-of-season − opening day-of-season for each year that
  // has both an open and a close record.
  const renderRoadDurationChart = (height = 320) => {
    if (roadTrendLoading) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
          Loading duration data…
        </Typography>
      )
    }

    const openScatter = roadTrend?.open_scatter || []
    const closeScatter = roadTrend?.close_scatter || []
    const openByYear = Object.fromEntries(openScatter.map((p) => [p.x, p.y]))
    const closeByYear = Object.fromEntries(closeScatter.map((p) => [p.x, p.y]))

    // Only seasons with both an opening and a closing date yield a duration.
    const durationYears = []
    const durationDays = []
    Object.keys(openByYear)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((y) => {
        if (closeByYear[y] != null && openByYear[y] != null) {
          const days = closeByYear[y] - openByYear[y]
          if (days >= 0) {
            durationYears.push(y)
            durationDays.push(days)
          }
        }
      })

    if (!roadTrend?.matched || durationYears.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
          No seasons with both an open and close date are available for this road.
        </Typography>
      )
    }

    const avgDuration =
      durationDays.reduce((sum, d) => sum + d, 0) / durationDays.length

    // Tick labels are day counts (at most 3 digits), so this axis needs a much
    // narrower gutter than the date-labelled trend chart above it.
    const geo = popupChartGeometry({
      count: durationYears.length,
      compact: isMobile,
      tickGutter: 34,
      height,
    })

    return (
      <div style={{ width: "100%" }}>
        <DurationHeatGauge durationDays={durationDays} />
        <ChartScroller
          minWidth={geo.minWidth}
          hint="Scroll sideways to see every season"
        >
          <BarChart
            height={geo.height}
            series={[
              {
                type: "bar",
                id: "openDuration",
                label: "Days open",
                color: "#2563eb",
                data: durationDays,
                valueFormatter: (v) => (v == null ? "" : `${v} days`),
                highlightScope: { highlighted: "item", faded: "global" },
              },
            ]}
            xAxis={[
              {
                data: durationYears,
                scaleType: "band",
                label: isMobile ? undefined : "Season",
                valueFormatter: seasonLabel,
                categoryGapRatio: geo.categoryGapRatio,
                barGapRatio: 0,
                tickInterval: (v, i) => i % geo.labelEvery === 0,
                tickLabelStyle: { fontSize: 12 },
              },
            ]}
            yAxis={[
              {
                label: isMobile ? undefined : "Days open",
                min: 0,
                tickLabelStyle: { fontSize: 12 },
              },
            ]}
            borderRadius={3}
            margin={{ ...geo.margin, top: 24 }}
            grid={{ horizontal: true }}
            slotProps={{
              legend: { hidden: true },
              // The chart's hover tooltip renders in a Popper. Its default
              // z-index sits below the road-closure popup (5000/6000), so lift
              // it above the popup to keep the datapoint tooltip on top.
              popper: {
                sx: { zIndex: 7000 },
              },
            }}
            sx={{
              // The y-axis label sits at a fixed offset that ignores tick-label
              // width, so the day counts overlap it. Nudge it clear.
              "& .MuiChartsAxis-left .MuiChartsAxis-label": { transform: "translateX(-14px)" },
            }}
          />
        </ChartScroller>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, textAlign: "center" }}>
          Number of days the road stayed open each season (close date − open date). Average:{" "}
          {Math.round(avgDuration)} days.
        </Typography>
      </div>
    )
  }

  // Format a p-value as a significance level, matching the analysis notebook.
  const fmtP = (p) => {
    if (p == null) return "—"
    if (p < 0.001) return "p < 0.001"
    if (p < 0.01) return "p < 0.01"
    if (p < 0.05) return "p < 0.05"
    return `p = ${p.toFixed(3)}`
  }

  // Evidence ramp for a Mann-Kendall p-value: grey (no evidence) through pale
  // blue to deep navy (strongest). Ordered by intensity so the column reads as
  // a scale rather than four unrelated colours.
  const PRECIP_SIG_STYLES = {
    very: { label: "Very significant", short: "p < 0.001" },
    significant: { label: "Significant", short: "p < 0.01" },
    somewhat: { label: "Somewhat significant", short: "p < 0.05" },
    none: { label: "Not significant", short: "p ≥ 0.05" },
    insufficient: { label: "Insufficient data", short: "< 3 years" },
  }

  // Compact p-value for the table's own column.
  const fmtPValue = (p) => {
    if (p == null) return "—"
    if (p < 0.001) return "<0.001"
    return p.toFixed(3)
  }

  const renderPrecipTrendTable = () => {
    if (precipTrendLoading) {
      return (
        <div className="wrtdip-trend-panel">
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            Calculating monthly trends…
          </Typography>
        </div>
      )
    }

    const months = precipTrend?.months || []
    const usable = months.filter((m) => m.sens_slope != null)
    if (usable.length === 0) return null

    // Scale the magnitude bars against the largest absolute slope so the
    // strongest month fills the half-width and the rest read relative to it.
    const maxAbs = Math.max(...usable.map((m) => Math.abs(m.sens_slope)), 0.0001)
    // Diverging scale with grey at "no change": brown for drier, navy for
    // wetter. The old white-to-navy ramp drew the strongest drying month white
    // on a white table. Brown/blue also stays distinct for colour-blind readers.
    const trendColor = (slope) => {
      if (slope == null) return "#94a3b8"
      const amount = Math.max(-1, Math.min(1, slope / maxAbs))
      const mid = [203, 213, 225]
      const end = amount < 0 ? [161, 98, 7] : [30, 58, 138]
      const t = Math.abs(amount)
      return `rgb(${mid.map((channel, index) => Math.round(channel + (end[index] - channel) * t)).join(", ")})`
    }

    const isSignificant = (m) => m.p != null && m.p < 0.05
    // Months in the chart's current window get a subtle highlight so the table
    // and the bars above stay visually linked.
    const [ms, me] = precipMonthRange
    const inWindow = (m) => (ms <= me ? m >= ms && m <= me : m >= ms || m <= me)

    const strongest = usable.filter(isSignificant)
      .sort((a, b) => Math.abs(b.sens_slope) - Math.abs(a.sens_slope))[0]

    return (
      <div className="wrtdip-trend-panel">
        <div className="wrtdip-trend-panel__head">
          <div>
            <div className="wrtdip-trend-panel__title">Monthly Precipitation Trends</div>
            <div className="wrtdip-trend-panel__sub">
              {showAdvanced ? (
                <>
                  Sen&rsquo;s slope (Theil&ndash;Sen) of monthly totals against year, with a
                  Mann&ndash;Kendall test for significance.
                </>
              ) : (
                <>
                  How much precipitation each month has gained or lost per decade across
                  this station&rsquo;s record. Faded months show no clear change.
                </>
              )}
            </div>
          </div>
          <div className="wrtdip-trend-panel__aside">
            {precipTrend?.first_year != null && (
              <div className="wrtdip-trend-panel__range">
                <span className="wrtdip-trend-panel__range-years">
                  {precipTrend.first_year}&ndash;{precipTrend.last_year}
                </span>
                <span className="wrtdip-trend-panel__range-label">
                  {precipTrend.n_years} yrs
                  {precipTrend.source === "daily" ? " · from daily" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {showAdvanced && strongest && (
          <div className="wrtdip-trend-panel__headline">
            Strongest signal:&nbsp;
            <strong>{strongest.name}</strong>
            <span className="wrtdip-trend-drop" style={{ color: trendColor(strongest.sens_slope) }}>
              <WaterDropIcon fontSize="inherit" />
            </span>
            {strongest.sens_slope > 0 ? "+" : "−"}
            {Math.abs(strongest.sens_slope).toFixed(2)} mm/yr
            <span className="wrtdip-trend-panel__headline-note">
              ({(Math.abs(strongest.sens_slope) * 10).toFixed(1)} mm per decade)
            </span>
          </div>
        )}

        <div className="wrtdip-trend-table-wrap">
          <table className={`wrtdip-trend-table${showAdvanced ? " wrtdip-trend-table--advanced" : ""}`}>
            <thead>
              <tr>
                <th className="wrtdip-trend-table__th">Month</th>
                <th className="wrtdip-trend-table__th wrtdip-trend-table__th--num">
                  {showAdvanced ? "Sen's Slope (mm/yr)" : "Change (mm/decade)"}
                </th>
                {showAdvanced && (
                  <>
                    <th className="wrtdip-trend-table__th">Significance</th>
                    <th className="wrtdip-trend-table__th wrtdip-trend-table__th--num">p&#8209;value</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {months.map((m) => {
                const sig = PRECIP_SIG_STYLES[m.significance] || PRECIP_SIG_STYLES.none
                const slope = m.sens_slope
                const pctW = slope == null ? 0 : (Math.abs(slope) / maxAbs) * 50
                return (
                  <tr
                    key={m.month}
                    className={`wrtdip-trend-table__row${inWindow(m.month) ? " wrtdip-trend-table__row--active" : ""}${
                      // Basic view hides the p-values, so fade the months whose
                      // change is not significant rather than let noise read as
                      // a trend.
                      !showAdvanced && !isSignificant(m) ? " wrtdip-trend-table__row--weak" : ""
                    }`}
                  >
                    <td className="wrtdip-trend-table__month">
                      <span
                        className="wrtdip-trend-drop"
                        style={{ color: trendColor(slope) }}
                        role="img"
                        aria-label={
                          slope == null ? "Insufficient data" :
                          slope === 0 ? "No change" :
                          slope > 0 ? "Getting wetter" : "Getting drier"
                        }
                      >
                        {slope == null ? "\u2014" : <WaterDropIcon fontSize="inherit" />}
                      </span>
                      <span className="wrtdip-trend-table__month-name">{m.name}</span>
                    </td>
                    <td className="wrtdip-trend-table__slope">
                      <div className="wrtdip-trend-bar">
                        <span className="wrtdip-trend-bar__axis" />
                        {slope != null && (
                          <span
                            className="wrtdip-trend-bar__fill"
                            style={{
                              [slope >= 0 ? "left" : "right"]: "50%",
                              width: `${pctW}%`,
                              backgroundColor: trendColor(slope),
                            }}
                          />
                        )}
                      </div>
                      <span className="wrtdip-trend-table__value">
                        {slope == null
                          ? "—"
                          : showAdvanced
                            ? `${slope > 0 ? "+" : slope < 0 ? "−" : ""}${Math.abs(slope).toFixed(3)}`
                            : `${slope > 0 ? "+" : slope < 0 ? "−" : ""}${Math.abs(slope * 10).toFixed(1)}`}
                      </span>
                    </td>
                    {showAdvanced && (
                      <>
                        <td>
                          <span
                            className={`wrtdip-sig-pill wrtdip-sig-pill--${m.significance}`}
                            title={`${sig.label} (${sig.short})`}
                          >
                            {sig.label}
                          </span>
                        </td>
                        <td className="wrtdip-trend-table__p">{fmtPValue(m.p)}</td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="wrtdip-precip-scale">
          <div className="wrtdip-precip-scale__body">
            <div className="wrtdip-precip-scale__droplets" aria-hidden="true">
              {Array.from({ length: 9 }, (_, index) => (
                <WaterDropIcon
                  key={index}
                  style={{ color: trendColor(maxAbs * (index / 4 - 1)) }}
                />
              ))}
            </div>
            <div className="wrtdip-precip-scale__labels">
              <span>Getting drier</span>
              <span>Getting wetter</span>
            </div>
          </div>
        </div>
        {showAdvanced && (
          <div className="wrtdip-trend-legend">
            {["very", "significant", "somewhat", "none"].map((level) => (
              <span key={level} className="wrtdip-trend-legend__item">
                <span className={`wrtdip-sig-dot wrtdip-sig-dot--${level}`} />
                {PRECIP_SIG_STYLES[level].label}
                <em>{PRECIP_SIG_STYLES[level].short}</em>
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Climate-trend statistics (bottom section of the popup). Loading and
  // no-data states still come from the legacy renderer.
  const renderRoadStatsSection = () => {
    if (roadStatsLoading || !roadStats?.matched || (!roadStats?.open && !roadStats?.close)) {
      return renderRoadStatsMessage()
    }
    return (
      <ClimateTrendStats
        open={roadStats.open}
        close={roadStats.close}
        openPoints={roadTrend?.open_scatter}
        closePoints={roadTrend?.close_scatter}
        fmtP={fmtP}
      />
    )
  }

  // Loading and no-data states for the Climate Trend Statistics tab.
  const renderRoadStatsMessage = () => (
    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
      {roadStatsLoading
        ? "Loading statistics…"
        : "Not enough historical data to compute trend statistics for this road."}
    </Typography>
  )

  // Fetch available stations for this city when modal opens
  useEffect(() => {
    if (!modalIsOpen) return
    const cityName = getCityName()
    if (!cityName) {
      setCityStations([])
      setSelectedStations([])
      return
    }

    fetch(`${API_BASE}/city-stations?name=${encodeURIComponent(cityName)}`)
      .then((r) => r.json())
      .then((json) => {
        const stations = json.data || []
        setCityStations(stations)
        // Default: select the mapped station, or first available
        const defaultId = CITY_STATION_MAP[cityName]
        if (defaultId && stations.some((s) => s[0] === defaultId)) {
          setSelectedStations([defaultId])
        } else if (stations.length > 0) {
          setSelectedStations([stations[0][0]])
        } else {
          setSelectedStations([])
        }
      })
      .catch(() => {
        setCityStations([])
        setSelectedStations([])
      })
  }, [modalIsOpen, territory, key])


  /* The Max/Avg/Min switches report which series they are, so each panel needs
     one handler rather than three setters threaded through the chart. */
  const setPrecipSeriesVisible = (key, on) => {
    if (key === "max") setPrecipShowMax(on)
    else if (key === "avg") setPrecipShowAvg(on)
    else setPrecipShowMin(on)
  }
  const setSnowSeriesVisible = (key, on) => {
    if (key === "max") setSnowShowMax(on)
    else if (key === "avg") setSnowShowAvg(on)
    else setSnowShowMin(on)
  }
  /* Whether the phone layout can offer "show monthly instead" as the way out
     of a daily chart too dense to fit the screen. */
  const hasMonthlyPrecip = precipSources.some((source) => source.resolution === "monthly")

  // Fetch FDD data for all selected stations
  useEffect(() => {
    if (!modalIsOpen || selectedStations.length === 0) {
      setFddSeries([])
      setFddDatasets([])
      return
    }

    // Fetch datasets for the first selected station (for the dropdown)
    // Auto-select the dataset with the most data points
    fetch(`${API_BASE}/station-datasets?stationid=${selectedStations[0]}`)
      .then((r) => r.json())
      .then((json) => {
        const datasets = json.data || []
        setFddDatasets(datasets)
        if (datasets.length > 0 && !fddDatasetId) {
          const best = datasets.reduce((a, b) => (b[2] > a[2] ? b : a), datasets[0])
          setFddDatasetId(String(best[0]))
        }
      })
      .catch(() => setFddDatasets([]))

    setFddLoading(true)
    const fetches = selectedStations.map((stationId) => {
      let url = `${API_BASE}/fdd?fromyear=1951&toyear=2023&stationid=${stationId}`
      if (fddDatasetId) {
        url += `&dataset_id=${fddDatasetId}`
      }
      const stationName = cityStations.find((s) => s[0] === stationId)?.[1] || `Station ${stationId}`
      return fetch(url)
        .then((r) => r.json())
        .then((json) => {
          const rows = json.data || []
          return {
            stationId,
            stationName,
            years: rows.map((row) => row[0]),
            fdds: rows.map((row) => parseFloat(row[1])),
          }
        })
        .catch(() => ({ stationId, stationName, years: [], fdds: [] }))
    })

    Promise.all(fetches)
      .then((results) => setFddSeries(results.filter((r) => r.years.length > 0)))
      .finally(() => setFddLoading(false))
  }, [modalIsOpen, selectedStations, fddDatasetId])

  // Fetch LOWESS data when toggle is on
  useEffect(() => {
    if (!showLowess || !modalIsOpen || selectedStations.length === 0) {
      setLowessSeries([])
      return
    }
    const fetches = selectedStations.map((stationId) => {
      let url = `${API_BASE}/lowess?fromyear=1951&toyear=2023&stationid=${stationId}`
      if (fddDatasetId) {
        url += `&dataset_id=${fddDatasetId}`
      }
      return fetch(url)
        .then((r) => r.json())
        .then((json) => {
          const rows = json.data || []
          return {
            stationId,
            years: rows.map((row) => row[0]),
            fdds: rows.map((row) => row[1]),
          }
        })
        .catch(() => ({ stationId, years: [], fdds: [] }))
    })
    Promise.all(fetches)
      .then((results) => setLowessSeries(results.filter((r) => r.years.length > 0)))
  }, [showLowess, modalIsOpen, selectedStations, fddDatasetId])

  // Which CanHomP V2 resolutions (daily / monthly) this station actually has.
  useEffect(() => {
    if (!modalIsOpen || selectedStations.length === 0) {
      setPrecipSources([])
      return
    }
    fetch(`${API_BASE}/precip-datasets?stationid=${selectedStations[0]}`)
      .then((r) => r.json())
      .then((json) => {
        const sources = json.data || []
        setPrecipSources(sources)
        // On a phone start on monthly: twelve bars fit the screen, ninety
        // daily ones need a sideways scroll. Otherwise keep the current
        // resolution if the station has it, else fall back to whatever it
        // does have (some stations are monthly-only).
        setPrecipResolution((prev) =>
          isMobileRef.current && sources.some((s) => s.resolution === "monthly")
            ? "monthly"
            : sources.some((s) => s.resolution === prev)
              ? prev
              : sources.length > 0
                ? sources[0].resolution
                : prev
        )
      })
      .catch(() => setPrecipSources([]))
  }, [modalIsOpen, selectedStations])

  // Fetch average precipitation for the selected month range and resolution
  useEffect(() => {
    if (!modalIsOpen || selectedStations.length === 0) {
      setPrecipData(null)
      return
    }
    const source = precipSources.find((s) => s.resolution === precipResolution)
    if (!source) {
      setPrecipData(null)
      return
    }
    const stationId = selectedStations[0]
    const url =
      `${API_BASE}/avg-precipitation?stationid=${stationId}` +
      `&month_start=${precipMonthRange[0]}&month_end=${precipMonthRange[1]}` +
      `&resolution=${precipResolution}&dataset_id=${source.dataset_id}`

    setPrecipLoading(true)
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        const rows = json.data || []
        setPrecipData({
          // Monthly rows carry a null day, so they label as "Jan" not "Jan 1".
          labels: rows.map((r) =>
            r[1] === null ? MONTH_ABBR[r[0]] : `${MONTH_ABBR[r[0]]} ${r[1]}`
          ),
          avgs: rows.map((r) => r[2]),
          maxs: rows.map((r) => r[3]),
          mins: rows.map((r) => r[4]),
        })
      })
      .catch(() => setPrecipData(null))
      .finally(() => setPrecipLoading(false))
  }, [modalIsOpen, selectedStations, precipSources, precipResolution, precipMonthRange])

  // Per-month precipitation trends (Mann-Kendall + Sen's slope). Computed over
  // the station's whole record, so this is independent of the month slider and
  // only needs to refetch when the station changes.
  useEffect(() => {
    if (!modalIsOpen || selectedStations.length === 0 || precipSources.length === 0) {
      setPrecipTrend(null)
      return
    }
    let cancelled = false
    const stationId = selectedStations[0]
    setPrecipTrendLoading(true)
    fetch(`${API_BASE}/precip-trend?stationid=${stationId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setPrecipTrend(json.data || null)
      })
      .catch(() => {
        if (!cancelled) setPrecipTrend(null)
      })
      .finally(() => {
        if (!cancelled) setPrecipTrendLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [modalIsOpen, selectedStations, precipSources])

  // Fetch average snowfall for selected month range when modal opens
  useEffect(() => {
    if (!modalIsOpen || selectedStations.length === 0) {
      setSnowfallData(null)
      return
    }
    const stationId = selectedStations[0]
    let url = `${API_BASE}/avg-snowfall?stationid=${stationId}&month_start=${snowMonthRange[0]}&month_end=${snowMonthRange[1]}`
    if (fddDatasetId) {
      url += `&dataset_id=${fddDatasetId}`
    }
    setSnowfallLoading(true)
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        const rows = json.data || []
        const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        setSnowfallData({
          labels: rows.map((r) => `${monthNames[r[0]]} ${r[1]}`),
          avgs: rows.map((r) => r[2]),
          maxs: rows.map((r) => r[3]),
          mins: rows.map((r) => r[4]),
        })
      })
      .catch(() => setSnowfallData(null))
      .finally(() => setSnowfallLoading(false))
  }, [modalIsOpen, selectedStations, fddDatasetId, snowMonthRange])

  // Fetch average temperature for selected month range
  useEffect(() => {
    if (!modalIsOpen || selectedStations.length === 0) {
      setTempData(null)
      return
    }
    const stationId = selectedStations[0]
    let url = `${API_BASE}/avg-temperature?stationid=${stationId}&month_start=${tempMonthRange[0]}&month_end=${tempMonthRange[1]}`
    if (fddDatasetId) {
      url += `&dataset_id=${fddDatasetId}`
    }
    setTempLoading(true)
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        const rows = json.data || []
        const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        setTempData({
          labels: rows.map((r) => `${monthNames[r[0]]} ${r[1]}`),
          avgs: rows.map((r) => r[2]),
          maxs: rows.map((r) => r[3]),
          mins: rows.map((r) => r[4]),
        })
      })
      .catch(() => setTempData(null))
      .finally(() => setTempLoading(false))
  }, [modalIsOpen, selectedStations, fddDatasetId, tempMonthRange])

  useEffect(() => {
    console.log("Print Mouse", mouse)
  }, [mouse])

  // Sync fddViewRange when fddSeries data changes
  useEffect(() => {
    if (fddSeries.length > 0) {
      const allYears = [...new Set(fddSeries.flatMap((s) => s.years))].sort((a, b) => a - b)
      if (allYears.length > 0) {
        setFddViewRange([allYears[0], allYears[allYears.length - 1]])
      }
      const allFdds = fddSeries.flatMap((s) => s.fdds).filter((v) => v != null && !isNaN(v))
      if (allFdds.length > 0) {
        setFddYRange([Math.floor(Math.min(...allFdds)), Math.ceil(Math.max(...allFdds))])
      }
    }
  }, [fddSeries])

  // Compute FDD value bounds for Y-axis slider
  const fddYBounds = useMemo(() => {
    const allFdds = fddSeries.flatMap((s) => s.fdds).filter((v) => v != null && !isNaN(v))
    if (allFdds.length === 0) return { min: 0, max: 5000 }
    return { min: Math.floor(Math.min(...allFdds)), max: Math.ceil(Math.max(...allFdds)) }
  }, [fddSeries])

  // Pinch-to-zoom ref for the popup chart
  const fddAllYears = useMemo(() => {
    if (fddSeries.length === 0) return []
    return [...new Set(fddSeries.flatMap((s) => s.years))].sort((a, b) => a - b)
  }, [fddSeries])

  /**
   * Function to close the modal.
   */
  // Jump links in the Climate & Weather header. The short-record banner is
  // sticky at the top of the body, so land each section just below it.
  const CLIMATE_SECTIONS = [
    { id: "forecast", label: "Forecast" },
    { id: "fdd", label: "Winter (FDD)" },
    { id: "precip", label: "Precip & snow" },
    { id: "temp", label: "Temperature" },
  ]
  const climateStickyOffset = (body) => {
    const banner = body.querySelector(".wrtdip-short-record-banner")
    return (banner ? banner.getBoundingClientRect().height : 0) + 12
  }
  const jumpToClimateSection = (id) => {
    const body = climateBodyRef.current
    const section = document.getElementById(`wrtdip-cw-${id}`)
    if (!body || !section) return
    const top =
      body.scrollTop +
      section.getBoundingClientRect().top -
      body.getBoundingClientRect().top -
      climateStickyOffset(body)
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    body.scrollTo({ top, behavior: reduce ? "auto" : "smooth" })
    setClimateSection(id)
  }
  const onClimateBodyScroll = (e) => {
    const body = e.currentTarget
    const line = body.getBoundingClientRect().top + climateStickyOffset(body) + 24
    let current = CLIMATE_SECTIONS[0].id
    for (const { id } of CLIMATE_SECTIONS) {
      const el = document.getElementById(`wrtdip-cw-${id}`)
      if (el && el.getBoundingClientRect().top <= line) current = id
    }
    // At the very bottom the last section may be too short to reach the line.
    if (body.scrollTop + body.clientHeight >= body.scrollHeight - 4) {
      current = CLIMATE_SECTIONS[CLIMATE_SECTIONS.length - 1].id
    }
    if (current !== climateSection) setClimateSection(current)
  }

  function closeModal() {
    setModalEnlarge(false)
    setModalIsOpen(false)
    setClimateData(null)
    setFddSeries([])
    setFddDatasets([])
    setFddDatasetId("")
    setCityStations([])
    setSelectedStations([])
    setShowAdvanced(false)
    setShowCalcInfo(false)
    setFddViewRange([1951, 2023])
    setFddYRange([0, 5000])
    setShowLowess(false)
    setLowessSeries([])
    setSnowfallData(null)
    setSnowMonthRange([defaultMonthStart, defaultMonthEnd])
    setPrecipSnowView("precipitation")
    setPrecipData(null)
    setPrecipSources([])
    setPrecipResolution("daily")
    setPrecipMonthRange([defaultMonthStart, defaultMonthEnd])
    setPrecipTrend(null)
    setTempData(null)
    setTempMonthRange([defaultMonthStart, defaultMonthEnd])
  }

  /**
   * Function to open enlarged modal
   */
  function enlargeModal() {
    setModalEnlarge(true)
  }

  function getCityName() {
    let cityName = null
    if (territory == "yt") {
      cityName = citiesOfYukon[key]
    }
    if (territory == "nt") {
      cityName = citiesOfNorthwestTerritories[key]
    }
    if (territory == "nu") {
      cityName = citiesOfNunavut[key]
    }
    return cityName
  }

  // The FDD graph has a desktop and a phone layout; <FddChart> picks one. All
  // the state it reads stays here, because crossing the breakpoint remounts the
  // variant and anything held inside it would be lost on rotate.
  function generateChart() {
    return (
      <FddChart
        loading={fddLoading}
        series={fddSeries}
        lowessSeries={lowessSeries}
        showLowess={showLowess}
        showAdvanced={showAdvanced}
        cityName={getCityName()}
        viewRange={fddViewRange}
        onViewRangeChange={setFddViewRange}
        yRange={fddYRange}
        onYRangeChange={setFddYRange}
        yBounds={fddYBounds}
        allYears={fddAllYears}
      />
    )
  }

  // Name of the climate station currently providing the FDD data, so the
  // user can clearly see where the numbers for this place come from.
  const activeStationName =
    cityStations.find((s) => s[0] === selectedStations[0])?.[1] || null

  // Longest record (usable seasons) among the stations currently shown, used
  // to decide whether the short-record warning banner applies. Derived from
  // the fetched FDD data so it automatically applies to every station.
  const fddRecordYears = useMemo(
    () => (fddSeries.length ? Math.max(...fddSeries.map((s) => s.years.length)) : 0),
    [fddSeries]
  )
  // Only warn when a graph is actually drawn — below MIN_GRAPH_POINTS the
  // chart is replaced by a "not enough data points" message, so there is
  // nothing to caution the user about.
  const showShortRecordBanner =
    !fddLoading &&
    fddRecordYears >= MIN_GRAPH_POINTS &&
    fddRecordYears < SHORT_RECORD_YEARS

  // Name of the dataset currently providing the FDD data.
  const activeDatasetName =
    fddDatasets.find((d) => String(d[0]) === String(fddDatasetId))?.[1] || null

  // Get coordinates for the selected city by lat and lon
  let lat = null, lon = null;
  if (territory === "yt" && yukonCoordinates[key]) {
    lat = yukonCoordinates[key][0];
    lon = yukonCoordinates[key][1];
  } else if (territory === "nt" && northWestCoordinates[key]) {
    lat = northWestCoordinates[key][0];
    lon = northWestCoordinates[key][1];
  } else if (territory === "nu" && nunavutCoordinates[key]) {
    lat = nunavutCoordinates[key][0];
    lon = nunavutCoordinates[key][1];
  }

  return (
    <div className="wrtdip-map" ref={MapElement}>
      <div id="legend-container"></div>
      <div id="layer-list-container"></div>

      {/* Custom feature popup (replaces ArcGIS native popup). On a phone a road
          popup is a bottom sheet: drag the header to peek / half / full. */}
      {featurePopup && (() => {
        const isRoadPopup = ROAD_CLOSURE_LAYERS.includes(featurePopup.layerTitle)
        const isSheet = isRoadPopup && isMobile
        const enlarged = isRoadPopup && roadPopupEnlarged && !isMobile
        const containerWidth = MapElement.current?.clientWidth || 600
        // Popup is centered on `left` via translateX(-50%), so keep its half
        // width inside the map bounds.
        const popupWidth = isRoadPopup ? Math.min(560, containerWidth - 32) : 280
        const half = popupWidth / 2
        const clampedLeft = Math.max(half + 8, Math.min(featurePopup.screenX, containerWidth - half - 8))
        const chartHeight = enlarged ? 420 : isMobile ? 260 : 320
        const roadTabs = [
          { id: "season", label: "Season" },
          { id: "details", label: "Details" },
          { id: "dates", label: "Open/Close" },
          { id: "duration", label: "Duration" },
        ]
        const tab = roadTabs.some((t) => t.id === roadTab) ? roadTab : "season"
        const popupClass = [
          "wrtdip-feature-popup",
          isRoadPopup && "wrtdip-feature-popup--wide",
          enlarged && "wrtdip-feature-popup--enlarged",
          isSheet && "wrtdip-feature-popup--sheet",
          isSheet && `wrtdip-feature-popup--${roadSheetSnap}`,
        ].filter(Boolean).join(" ")
        return (
        <div
          ref={isSheet ? roadSheet.sheetRef : undefined}
          className={popupClass}
          role="dialog"
          aria-modal="false"
          aria-label={featurePopup.title || "Feature"}
          onKeyDown={(e) => { if (e.key === "Escape") closeFeaturePopup() }}
          style={
            isSheet ? roadSheet.sheetStyle
              : enlarged ? {}
              : { left: clampedLeft, top: Math.max(featurePopup.screenY - 10, 10) }
          }
        >
          <div className="wrtdip-feature-popup__grab" {...(isSheet ? roadSheet.zoneProps : {})}>
            {isSheet && (
              <button
                type="button"
                className="wrtdip-feature-popup__handle"
                onClick={() => setRoadSheetSnap((s) => (s === "full" ? "half" : "full"))}
                aria-label={roadSheetSnap === "full" ? "Shrink details" : "Expand details"}
              >
                <span aria-hidden="true" />
              </button>
            )}
            <div className="wrtdip-feature-popup__header">
              <div className="wrtdip-feature-popup__header-text">
                {featurePopup.layerTitle && (
                  <span className="wrtdip-feature-popup__layer-tag">{featurePopup.layerTitle}</span>
                )}
                <span className="wrtdip-feature-popup__title">{featurePopup.title || "Feature"}</span>
              </div>
              {isRoadPopup && !isMobile && (
                <button
                  type="button"
                  className="wrtdip-popup-icon-btn"
                  onClick={() => setRoadPopupEnlarged((e) => !e)}
                  aria-label={enlarged ? "Shrink" : "Enlarge"}
                  title={enlarged ? "Shrink" : "Enlarge"}
                >
                  {enlarged ? <CloseFullscreenIcon style={{ fontSize: 14 }} /> : <OpenInFullIcon style={{ fontSize: 14 }} />}
                </button>
              )}
              <button
                type="button"
                className="wrtdip-popup-icon-btn"
                onClick={closeFeaturePopup}
                aria-label="Close"
                title="Close"
              >
                ×
              </button>
            </div>
            {isRoadPopup && (
              <Tabs
                value={tab}
                onChange={(_, v) => {
                  setRoadTab(v)
                  // Picking a tab from the peek strip means "show me this".
                  if (isSheet && roadSheetSnap === "peek") setRoadSheetSnap("half")
                }}
                variant="fullWidth"
                className="wrtdip-popup-tabs"
                aria-label="Road information"
              >
                {roadTabs.map((t) => (
                  <Tab
                    key={t.id}
                    value={t.id}
                    label={t.label}
                    id={`wrtdip-road-tab-${t.id}`}
                    aria-controls="wrtdip-road-tabpanel"
                  />
                ))}
              </Tabs>
            )}
          </div>
          {isRoadPopup ? (
            <div
              className="wrtdip-feature-popup__body"
              role="tabpanel"
              id="wrtdip-road-tabpanel"
              aria-labelledby={`wrtdip-road-tab-${tab}`}
            >
              <div className="wrtdip-popup-section">
                {tab === "details" && featurePopup.content && (
                  <div
                    className="wrtdip-popup-section__content"
                    dangerouslySetInnerHTML={{ __html: featurePopup.content }}
                  />
                )}
                {tab === "season" && (
                  <div className="wrtdip-popup-section__content">{renderRoadStatsSection()}</div>
                )}
                {tab === "dates" && (
                  <div className="wrtdip-popup-section__content">{renderRoadTrendChart(chartHeight)}</div>
                )}
                {tab === "duration" && (
                  <div className="wrtdip-popup-section__content">{renderRoadDurationChart(chartHeight)}</div>
                )}
              </div>
            </div>
          ) : (
            featurePopup.content && (
              <div
                className="wrtdip-feature-popup__body"
                dangerouslySetInnerHTML={{ __html: featurePopup.content }}
              />
            )
          )}
          <div className="wrtdip-feature-popup__arrow" />
        </div>
        )
      })()}
      <Modal
        show={modalIsOpen}
        onHide={closeModal}
        onEnter={() => setClimateSection("forecast")}
        fullscreen="md-down"
        centered={!modalEnlarge}
        dialogClassName={
          modalEnlarge ? "wrtdip-map-modal wrtdip-map-modal--enlarged" : "wrtdip-map-modal"
        }
        contentClassName="wrtdip-map-modal__content"
        backdropClassName="wrtdip-map-modal__backdrop"
      >
        <Modal.Header className="wrtdip-map-modal__header">
          <div className="wrtdip-map-modal__heading">
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1, letterSpacing: 1 }}>
              Climate &amp; Weather
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              sx={{ color: "#fff", fontWeight: 600, lineHeight: 1.2, mt: 0.5, overflowWrap: "anywhere" }}
            >
              {getCityName() || "Selected Location"}
            </Typography>
          </div>
          <div className="wrtdip-map-modal__actions">
            <FormControlLabel
              className={`wrtdip-map-modal__advanced${showAdvanced ? " wrtdip-map-modal__advanced--active" : ""}`}
              labelPlacement="start"
              control={
                <Switch
                  checked={showAdvanced}
                  onChange={(event) => setShowAdvanced(event.target.checked)}
                  inputProps={{ role: "switch", "aria-label": "Advanced" }}
                />
              }
              label={
                <span className="wrtdip-map-modal__advanced-label">
                  <TuneIcon aria-hidden="true" />
                  <span>Advanced</span>
                  <span className="wrtdip-map-modal__advanced-state" aria-hidden="true">
                    {showAdvanced ? "ON" : "OFF"}
                  </span>
                </span>
              }
            />
            {!isMobile && (
              <button
                type="button"
                className="wrtdip-popup-icon-btn"
                onClick={() => setModalEnlarge(!modalEnlarge)}
                aria-label={modalEnlarge ? "Shrink" : "Enlarge"}
                title={modalEnlarge ? "Shrink" : "Enlarge"}
              >
                {modalEnlarge ? <CloseFullscreenIcon style={{ fontSize: 14 }} /> : <OpenInFullIcon style={{ fontSize: 14 }} />}
              </button>
            )}
            <button
              type="button"
              className="wrtdip-popup-icon-btn"
              onClick={closeModal}
              aria-label="Close"
              title="Close"
            >
              ×
            </button>
          </div>
          <nav className="wrtdip-map-modal__jump" aria-label="Jump to section">
            {CLIMATE_SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`wrtdip-map-modal__jump-btn${climateSection === id ? " wrtdip-map-modal__jump-btn--active" : ""}`}
                aria-current={climateSection === id ? "true" : undefined}
                onClick={() => jumpToClimateSection(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        </Modal.Header>
        <Modal.Body className="wrtdip-map-modal__body" ref={climateBodyRef} onScroll={onClimateBodyScroll}>
          {/* Sticky short-record warning: stays pinned while the user scrolls
              so it can't be missed when reading the graphs. Wording is a
              placeholder — final text to be confirmed with Yukari. */}
          {showShortRecordBanner && (
            <div className="wrtdip-short-record-banner" role="alert">
              <span className="wrtdip-short-record-banner__icon" aria-hidden="true">⚠️</span>
              <span>
                <strong>Limited data:</strong> only {fddRecordYears}{" "}
                {fddRecordYears === 1 ? "season" : "seasons"} on record, under the{" "}
                {SHORT_RECORD_YEARS} needed for a reliable trend. Read the graphs with caution.
              </span>
            </div>
          )}
          <section className="wrtdip-map-modal__section" id="wrtdip-cw-forecast">
            <Typography variant="subtitle1" className="wrtdip-map-modal__section-title">
              3-Day Weather Forecast
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
              Current conditions and outlook for the next 3 days
            </Typography>
            <ForecastPanel lat={lat} lon={lon} />
            <div className="wrtdip-forecast-links">
              <span>Displayed forecast: Open-Meteo</span>
              {lat != null && lon != null && (
                <a
                  href={`https://weather.gc.ca/en/location/index.html?coords=${lat},${lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  3-day weather forecast from Environment Canada
                </a>
              )}
            </div>
          </section>
          {/* Names the dataset the FDD graph is actually drawn from; it used
              to say CanHomT V4 even when the station only had ECCC data. */}
          {activeDatasetName && (
            <div className="wrtdip-map-modal__data-badge">
              <Typography variant="caption" sx={{ display: "block", lineHeight: 1.4 }}>
                {/canhomt/i.test(activeDatasetName) ? (
                  <>
                    Data: <strong>CanHomT V4</strong>, Canada's homogenized temperature record, corrected for
                    station moves and equipment changes.
                  </>
                ) : (
                  <>
                    Data: <strong>{activeDatasetName}</strong>. Not adjusted for station moves or equipment
                    changes, so read long-term trends with some caution.
                  </>
                )}
              </Typography>
            </div>
          )}
          <section className="wrtdip-map-modal__section" id="wrtdip-cw-fdd">
            <Typography variant="subtitle1" className="wrtdip-map-modal__section-title">
              Freezing Degree Days (FDDs)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Annual cumulative freezing degree days (Sept–May) for {getCityName() || "this location"}
            </Typography>
            {showAdvanced && activeStationName && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                📍 Based on data from the <strong>{activeStationName}</strong> climate station
                {activeDatasetName && (
                  <> (<strong>{activeDatasetName}</strong> dataset)</>
                )}
              </Typography>
            )}
            <div className="wrtdip-map-modal__chart">{generateChart()}</div>
            <div className="wrtdip-toggle-row">
              <button
                onClick={() => setShowCalcInfo(!showCalcInfo)}
                className={`wrtdip-toggle-btn${showCalcInfo ? " wrtdip-toggle-btn--active" : ""}`}
              >
                <span className="wrtdip-toggle-btn__icon">{showCalcInfo ? "▾" : "▸"}</span>
                Calculation Information
              </button>
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              {showAdvanced && (
                <div className="wrtdip-adv-panel">
                  <div className="wrtdip-adv-row">
                    {cityStations.length > 1 && (
                      <div className="wrtdip-adv-field">
                        <label className="wrtdip-adv-label">
                          Climate Station
                        </label>
                        <select
                          value={selectedStations[0] || ""}
                          onChange={(e) => {
                            const id = Number(e.target.value)
                            setSelectedStations([id])
                            // Reset so the best dataset for the new station is auto-selected
                            setFddDatasetId("")
                          }}
                          className="wrtdip-select"
                        >
                          {cityStations.map((s) => (
                            <option key={s[0]} value={s[0]}>
                              {s[1]}
                            </option>
                          ))}
                        </select>
                        <span className="wrtdip-adv-help">
                          Choose which nearby weather station provides the FDD data.
                        </span>
                      </div>
                    )}
                    {fddDatasets.length > 0 && (
                      <div className="wrtdip-adv-field">
                        <label className="wrtdip-adv-label">
                          Dataset
                        </label>
                        <select
                          value={fddDatasetId}
                          onChange={(e) => setFddDatasetId(e.target.value)}
                          className="wrtdip-select"
                        >
                          {fddDatasets.map((d) => (
                            <option key={d[0]} value={d[0]}>
                              {d[1]}
                            </option>
                          ))}
                        </select>
                        <span className="wrtdip-adv-help">
                          The dataset with the most data is selected automatically. Change it here if needed.
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="wrtdip-adv-field">
                    <label className="wrtdip-adv-check">
                      <input
                        type="checkbox"
                        checked={showLowess}
                        onChange={(e) => setShowLowess(e.target.checked)}
                      />
                      Show LOWESS trend curve
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Calculation Information collapsible */}
            <div style={{ marginTop: "0.5rem" }}>
              {showCalcInfo && (
                <div className="wrtdip-calc-info__body">
                  <p className="wrtdip-calc-info__text">
                    <strong>Freezing Degree Days (FDD)</strong> quantify the cumulative intensity and duration of below-freezing temperatures over a winter season.
                  </p>
                  <ul className="wrtdip-calc-info__list">
                    <li>
                      For each day in the accumulation period <strong>(September 1 – May 31)</strong>, the daily mean temperature (T<sub>mean</sub>) is checked.
                    </li>
                    <li>
                      If T<sub>mean</sub> is below 0 °C, its absolute value is added to the running total.
                    </li>
                    <li>
                      Days with T<sub>mean</sub> ≥ 0 °C contribute zero to the sum.
                    </li>
                    <li>
                      The final sum for the season is the annual FDD value, expressed in <strong>°C·days</strong>.
                    </li>
                    <li>
                      <strong>Quality filtering:</strong> Any month that has <strong>3 or more consecutive days</strong> of missing data, or <strong>5 or more total days</strong> missing, is excluded from the calculation. If any month within the season is excluded, the entire season's FDD is not reported.
                    </li>
                  </ul>
                  <div className="wrtdip-calc-info__datasource">
                    <p className="wrtdip-calc-info__datasource-title">Data Sources</p>
                    <p className="wrtdip-calc-info__text">
                      Our primary data source is the <strong>Adjusted and Homogenized Canadian Climate Data (AHCCD)</strong>. AHCCD records undergo rigorous quality control and statistical adjustments to account for non-climatic factors such as station relocations, changes in instrumentation, and modifications to observing procedures. This homogenization process makes AHCCD highly accurate and reliable for long-term trend analysis.
                    </p>
                    <p className="wrtdip-calc-info__text" style={{ marginBottom: 0 }}>
                      When AHCCD data is not available for a given station or time period, we fall back to <strong>Environment and Climate Change Canada (ECCC)</strong> daily climate data. While ECCC records have not undergone the same homogenization adjustments, they provide broader station coverage and more recent observations, ensuring FDD values can still be computed where AHCCD gaps exist.
                    </p>
                  </div>
                  <p className="wrtdip-calc-info__note">
                    Higher FDD values indicate a colder and/or longer winter, which is critical for ice road bearing capacity and construction scheduling.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="wrtdip-map-modal__section" id="wrtdip-cw-precip">
            <div className="wrtdip-section-switch" role="tablist" aria-label="Precipitation or snowfall">
              <button
                type="button"
                role="tab"
                aria-selected={precipSnowView === "precipitation"}
                className={`wrtdip-section-switch__btn${precipSnowView === "precipitation" ? " wrtdip-section-switch__btn--active" : ""}`}
                onClick={() => setPrecipSnowView("precipitation")}
              >
                Precipitation
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={precipSnowView === "snowfall"}
                className={`wrtdip-section-switch__btn${precipSnowView === "snowfall" ? " wrtdip-section-switch__btn--active" : ""}`}
                onClick={() => setPrecipSnowView("snowfall")}
              >
                Snowfall
              </button>
            </div>

            {precipSnowView === "precipitation" ? (
              <>
                <Typography variant="subtitle1" className="wrtdip-map-modal__section-title">
                  Average {precipResolution === "monthly" ? "Monthly" : "Daily"} Precipitation
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  Homogenized precipitation (mm) for each{" "}
                  {precipResolution === "monthly" ? "month" : "day"} in the selected month(s)
                </Typography>

                <div className="wrtdip-precip-controls">
                  {/* There is only ever one precipitation dataset, so this is a
                      label rather than a dropdown with nothing to choose. */}
                  <div className="wrtdip-precip-control">
                    <span className="wrtdip-precip-control__label">Dataset</span>
                    <span className="wrtdip-precip-dataset">
                      {precipSources.length > 0
                        ? "CanHomP V2 (homogenized precipitation)"
                        : "No dataset for this station"}
                    </span>
                  </div>
                  <div className="wrtdip-precip-control">
                    <span className="wrtdip-precip-control__label">Resolution</span>
                    <div className="wrtdip-precip-resolution">
                      {["daily", "monthly"].map((res) => {
                        const available = precipSources.some((s) => s.resolution === res)
                        return (
                          <button
                            key={res}
                            type="button"
                            disabled={!available}
                            title={available ? undefined : `No ${res} CanHomP V2 data for this station`}
                            className={`wrtdip-precip-resolution__btn${precipResolution === res ? " wrtdip-precip-resolution__btn--active" : ""}`}
                            onClick={() => setPrecipResolution(res)}
                          >
                            {res === "daily" ? "Daily" : "Monthly"}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "0.5rem" }}>
                  <YearRangeSlider
                    value={precipMonthRange}
                    onChange={setPrecipMonthRange}
                    min={1}
                    max={12}
                    label="Months"
                  />
                  <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: -0.5 }}>
                    {new Date(2000, precipMonthRange[0] - 1).toLocaleString("default", { month: "long" })}
                    {precipMonthRange[0] !== precipMonthRange[1] && ` – ${new Date(2000, precipMonthRange[1] - 1).toLocaleString("default", { month: "long" })}`}
                  </Typography>
                </div>

                <div className="wrtdip-map-modal__chart">
                  <PrecipChart
                    loading={precipLoading}
                    data={precipData}
                    visible={{ max: precipShowMax, avg: precipShowAvg, min: precipShowMin }}
                    onVisibleChange={setPrecipSeriesVisible}
                    xAxisLabel={precipResolution === "monthly" ? "Month" : "Date"}
                    yAxisLabel="Precipitation (mm)"
                    barGaps={PRECIP_BAR_GAPS[precipResolution]}
                    loadingMessage="Loading precipitation data..."
                    emptyMessage="No CanHomP V2 precipitation data available for this location."
                    denseHint="Scroll sideways to see every day"
                    onRequestCoarser={
                      precipResolution === "daily" && hasMonthlyPrecip
                        ? () => setPrecipResolution("monthly")
                        : undefined
                    }
                    coarserLabel="Show monthly instead — fits the screen"
                  />
                </div>

                {renderPrecipTrendTable()}
              </>
            ) : (
              <>
                <Typography variant="subtitle1" className="wrtdip-map-modal__section-title">
                  Average Daily Snowfall
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  Historical snowfall (cm) for each day in the selected month(s)
                </Typography>
                <div style={{ marginBottom: "0.5rem" }}>
                  <YearRangeSlider
                    value={snowMonthRange}
                    onChange={setSnowMonthRange}
                    min={1}
                    max={12}
                    label="Months"
                  />
                  <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: -0.5 }}>
                    {new Date(2000, snowMonthRange[0] - 1).toLocaleString("default", { month: "long" })}
                    {snowMonthRange[0] !== snowMonthRange[1] && ` – ${new Date(2000, snowMonthRange[1] - 1).toLocaleString("default", { month: "long" })}`}
                  </Typography>
                </div>
                <div className="wrtdip-map-modal__chart">
                  <PrecipChart
                    loading={snowfallLoading}
                    data={snowfallData}
                    visible={{ max: snowShowMax, avg: snowShowAvg, min: snowShowMin }}
                    onVisibleChange={setSnowSeriesVisible}
                    xAxisLabel="Date"
                    yAxisLabel="Snowfall (cm)"
                    loadingMessage="Loading snowfall data..."
                    emptyMessage="No snowfall data available for this location."
                    denseHint="Scroll sideways to see every day"
                  />
                </div>
              </>
            )}
          </section>

          <section className="wrtdip-map-modal__section" id="wrtdip-cw-temp">
            <Typography variant="subtitle1" className="wrtdip-map-modal__section-title">
              Average Daily Temperature
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Historical temperature (°C) for each day in the selected month(s)
            </Typography>
            <div style={{ marginBottom: "0.5rem" }}>
              <YearRangeSlider
                value={tempMonthRange}
                onChange={setTempMonthRange}
                min={1}
                max={12}
                label="Months"
              />
              <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: -0.5 }}>
                {new Date(2000, tempMonthRange[0] - 1).toLocaleString("default", { month: "long" })}
                {tempMonthRange[0] !== tempMonthRange[1] && ` – ${new Date(2000, tempMonthRange[1] - 1).toLocaleString("default", { month: "long" })}`}
              </Typography>
            </div>
            <div className="wrtdip-map-modal__chart">
              {tempLoading ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                  Loading temperature data...
                </Typography>
              ) : tempData && tempData.labels.length > 0 ? (
                <div className="u-fit-width">
                  <div className="wrtdip-series-toggles">
                    <label className={`wrtdip-series-toggle${tempShowMax ? " wrtdip-series-toggle--on" : ""}`}>
                      <input
                        type="checkbox"
                        className="wrtdip-series-toggle__input"
                        checked={tempShowMax}
                        onChange={(e) => setTempShowMax(e.target.checked)}
                      />
                      <span className="wrtdip-series-toggle__dot" style={{ background: TEMP_COLORS.max }} />
                      Max
                    </label>
                    <label className={`wrtdip-series-toggle${tempShowAvg ? " wrtdip-series-toggle--on" : ""}`}>
                      <input
                        type="checkbox"
                        className="wrtdip-series-toggle__input"
                        checked={tempShowAvg}
                        onChange={(e) => setTempShowAvg(e.target.checked)}
                      />
                      <span className="wrtdip-series-toggle__dot" style={{ background: TEMP_COLORS.avg }} />
                      Avg
                    </label>
                    <label className={`wrtdip-series-toggle${tempShowMin ? " wrtdip-series-toggle--on" : ""}`}>
                      <input
                        type="checkbox"
                        className="wrtdip-series-toggle__input"
                        checked={tempShowMin}
                        onChange={(e) => setTempShowMin(e.target.checked)}
                      />
                      <span className="wrtdip-series-toggle__dot" style={{ background: TEMP_COLORS.min }} />
                      Min
                    </label>
                  </div>
                  {/* Lines, not bars: a few months of days is hundreds of
                      points, which as bars became hairlines that needed a
                      sideways scroll. Lines fit the screen and show the
                      max-min spread at a glance. */}
                  <LineChart
                    xAxis={[{
                      data: tempData.labels,
                      label: isMobile ? undefined : "Date",
                      scaleType: "point",
                      tickInterval: (_, i) => i % Math.max(1, Math.ceil(tempData.labels.length / (isMobile ? 4 : 8))) === 0,
                      tickLabelStyle: { fontSize: 12 },
                    }]}
                    yAxis={[{ label: isMobile ? undefined : "Temperature (°C)", tickLabelStyle: { fontSize: 12 } }]}
                    series={[
                      ...(tempShowMax ? [{ id: "max", data: tempData.maxs, label: "Max", color: TEMP_COLORS.max, showMark: false, valueFormatter: fmtTemp }] : []),
                      ...(tempShowAvg ? [{ id: "avg", data: tempData.avgs, label: "Avg", color: TEMP_COLORS.avg, showMark: false, valueFormatter: fmtTemp }] : []),
                      ...(tempShowMin ? [{ id: "min", data: tempData.mins, label: "Min", color: TEMP_COLORS.min, showMark: false, valueFormatter: fmtTemp }] : []),
                    ]}
                    height={240}
                    margin={{ left: isMobile ? 40 : 56, right: 12, top: 10, bottom: isMobile ? 28 : 44 }}
                    grid={{ horizontal: true }}
                    slotProps={{ legend: { hidden: true } }}
                    sx={{ "& .MuiLineElement-series-avg": { strokeWidth: 2.5 } }}
                  />
                </div>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                  No temperature data available for this location.
                </Typography>
              )}
            </div>
          </section>

        </Modal.Body>
      </Modal>
    </div>
  )
  /**
   * Function to load map data using ArcGIS API.
   * @param {object} weatherData - Reference to weather data.
   * @param {object} MapElement - Reference to map container element.
   * @param {string} mapType - Type of map (e.g., "arcgis-topographic").
   */

  async function loadData(
    weatherData,
    MapElement,
    mapType = "arcgis-topographic"
  ) {
    loadModules(
      [
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/layers/ImageryLayer",
        "esri/layers/ImageryTileLayer",
        "esri/layers/GraphicsLayer",
        "esri/layers/VectorTileLayer",
        "esri/layers/TileLayer",
        "esri/Basemap",
        "esri/Map",
        "esri/config",
        "esri/identity/IdentityManager",
        "esri/Graphic",
        "esri/widgets/Popup",
        "esri/PopupTemplate",
        "esri/widgets/LayerList",
        "esri/widgets/Legend",
        "esri/widgets/Expand",
        "esri/widgets/Zoom",
        "esri/widgets/Zoom/ZoomViewModel",
        "esri/portal/Portal",
        "esri/identity/OAuthInfo",
        "esri/layers/MapImageLayer",
      ],
      {
        css: true,
      }
    ).then(
      async ([
        MapView,
        FeatureLayer,
        ImageryLayer,
        ImageryTileLayer,
        GraphicsLayer,
        VectorTileLayer,
        TileLayer,
        Basemap,
        Map,
        esriConfig,
        esriId,
        Graphic,
        Popup,
        PopupTemplate,
        LayerList,
        Legend,
        Expand,
        Zoom,
        ZoomViewModel,
        Portal,
        OAuthInfo,
        MapImageLayer,
      ]) => {
        // esriConfig.apiKey =
        //   "AAPKd7da5e4a967540cfb66765bf918280a4t9Et4goGp4RqyeGZkQfG9yVBkkmOC1j35X1YLmsZ1nqucmvVp0j2nXbwF5wP3XRw"


        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.register("service-worker.js")
        }

        // Esri Canada "Canada Basemap" (topographic) — includes niche and
        // First Nations roads missing from the default streets basemap.
        // From webmap 98652eb8458a464fa95feb9bd812b29a, minus its two raster
        // hillshade layers: they double tile traffic and alpha-blending cost
        // (noticeable lag) while adding only cosmetic terrain shading.
        const canadaTopoBasemap = new Basemap({
          title: "Canada Topographic",
          baseLayers: [
            // World fallback for areas outside Canada_Topographic coverage
            new VectorTileLayer({
              url: "https://www.arcgis.com/sharing/rest/content/items/6d0ed88458c6429d99331260fb7bf2b0/resources/styles/root.json",
            }),
            new VectorTileLayer({
              url: "https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Topographic/VectorTileServer",
            }),
          ],
        })

        // Default basemap: Esri Streets (see BASEMAP_OPTIONS "street" below).
        const map = new Map({ basemap: "streets-vector" })

        // Full 4-layer version of webmap 98652eb8458a464fa95feb9bd812b29a
        // (with both hillshades). Kept for performance comparison against
        // the trimmed Topographic basemap. Layers only load when selected.
        const oldCanadaTopoBasemap = new Basemap({
          title: "Canada Topographic (Old)",
          baseLayers: [
            new TileLayer({
              url: "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer",
              opacity: 0.74,
            }),
            new VectorTileLayer({
              url: "https://www.arcgis.com/sharing/rest/content/items/6d0ed88458c6429d99331260fb7bf2b0/resources/styles/root.json",
            }),
            new TileLayer({
              url: "https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Hillshade/MapServer",
            }),
            new VectorTileLayer({
              url: "https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Topographic/VectorTileServer",
            }),
          ],
        })

        // Basemap options for the switcher panel. Street and Hybrid use
        // Esri's well-known ArcGIS Online basemaps.
        const BASEMAP_OPTIONS = [
          {
            id: "topographic",
            title: "Topographic",
            sub: "Canada Topographic",
            icon: "\u{1F5FA}\uFE0F",
            basemap: canadaTopoBasemap,
          },
          {
            id: "street",
            title: "Street",
            sub: "Esri Streets",
            icon: "\u{1F6E3}\uFE0F",
            basemap: "streets-vector",
          },
          {
            id: "hybrid",
            title: "Hybrid",
            sub: "Imagery with labels",
            icon: "\u{1F6F0}\uFE0F",
            basemap: "hybrid",
          },
          {
            id: "old-base",
            title: "Old Base Layer",
            sub: "Canada Topo + hillshades (perf test)",
            icon: "\u{26F0}\uFE0F",
            basemap: oldCanadaTopoBasemap,
          },
        ]
        const view = new MapView({
          container: MapElement.current,
          map: map,
          center: [-110, 65.5], // Adjust longitude and latitude as needed
          zoom: 4.5,
          popupEnabled: true,
        })

        // Hovered road features get a bright glow (see the pointer-move
        // handler below) so users can tell they're clickable.
        view.highlightOptions = {
          color: "#ffc400",
          haloOpacity: 0.9,
          fillOpacity: 0.2,
        }

        // //Map Image Layer
        // let mapImageLayer = new MapImageLayer({
        //   url: "https://www.apps.geomatics.gov.nt.ca/arcgis/rest/services/GNWT/Transportation_LCC/MapServer",
        //   popupTemplate: {
        //     title: "{L_STNAME_C}",
        //   },
        // })
        // mapImageLayer.title = "Transportation"
        // map.add(mapImageLayer)

        // Modis
        const imageryLayer = new ImageryLayer({
          url: "https://modis.arcgis.com/arcgis/rest/services/MODIS/ImageServer",
          useViewTime: false,
          timeExtent: {
            start: new Date("2024/05/16 09:00:00 UTC"),
            end: new Date("2024/05/17 09:00:00 UTC"),
          },
          format: "jpgpng",
        })
        imageryLayer.title = "MODIS"
        imageryLayer.visible = false
        map.add(imageryLayer)

        //Create Popup Template

  // Create layer list and legend widgets
  // Reorder layers in the desired order
  const orderedLayerTitles = [
    "Major Roads",
    "Minor Roads",
    "Airports - Northwest Territories",
    "Airports - Yukon",
    "Airports - Nunavut",
    "Winter Roads - Northwest Territories",
    "Winter Roads - Nunavut",
    "Ice Crossings - Northwest Territories",
    "Ice Crossings - Yukon",
    "Ferries - Northwest Territories",
    "Ferries - Yukon",
    "Proposed Roads - Northwest Territories",
    ];

  // Sort layerData based on the desired order
  // Use slice() to create a shallow copy of layerData
  const orderedLayerData = layerData.slice().sort((a, b) => {
    return (
      orderedLayerTitles.indexOf(a.title) - orderedLayerTitles.indexOf(b.title)
    );
  });

  // Debugging: Log the sorted layer data
  console.log("Ordered Layer Data:", orderedLayerData.map((layer) => layer.title));

  // Add feature layers in reverse order so the first is on top in the Layer List
  [...orderedLayerData].reverse().forEach((layer) => {
   console.log(`Adding layer: ${layer.title}`); // Debugging
    const featureLayer = new FeatureLayer({
      url: layer.link,
      // Layers without a popup are drawn, never inspected, so their attributes
      // are dead weight. The GNWT Transportation service in particular returns
      // ~1.1 MB per tile query with outFields ["*"] vs ~90 KB with just the
      // object id; at that size a zoom fires enough concurrent requests for the
      // server to reset the connections (ERR_CONNECTION_RESET) and the roads
      // drop out of the map.
      outFields: layer.popupTemplate ? ["*"] : ["OBJECTID"],
      popupTemplate: layer.popupTemplate,
      popupEnabled: layer.popupTemplate !== null,
      visible: layer.visible, // Apply the visible property from layerData
    });

  // Set renderer if it exists
  if (layer.renderer) {
    featureLayer.renderer = layer.renderer;
  }

  // Clip Major/Minor Roads (GNWT Transportation service extends south into
  // BC/Alberta) to the three territories — everything north of 60°N.
  if (layer.title === "Major Roads" || layer.title === "Minor Roads") {
    featureLayer.featureEffect = {
      filter: {
        geometry: {
          type: "extent",
          xmin: -141.5,
          ymin: 60,
          xmax: -60,
          ymax: 84,
          spatialReference: { wkid: 4326 },
        },
        spatialRelationship: "intersects",
      },
      excludedEffect: "opacity(0%)",
    };
  }

  featureLayer.title = layer.title;
  map.add(featureLayer);
  });

  // Create a custom layer list panel (replaces the default ArcGIS LayerList).
  // It's wrapped in an Expand widget so it occupies the exact same UI slot.
  const layerListContainer = document.createElement("div")
  layerListContainer.className = "wrtdip-layer-panel"
  layerListContainer.innerHTML = `
    <div class="wrtdip-layer-panel__header">
      <span class="wrtdip-layer-panel__title">Map Layers</span>
      <div class="wrtdip-layer-panel__actions">
        <button type="button" class="wrtdip-layer-panel__btn" data-action="all">All</button>
        <button type="button" class="wrtdip-layer-panel__btn" data-action="none">None</button>
      </div>
    </div>
    <div class="wrtdip-layer-panel__featured" data-featured-slot></div>
    <ul class="wrtdip-layer-panel__list" role="list"></ul>
  `

  // Title of the layer that the pinned "3-Day Forecast" row controls.
  const FORECAST_LAYER_TITLE = "Weather Forecast"
  const miniForecastState = {
    loading: false,
    days: [],
    hasLoaded: false,
    cityName: "",
  }

  function getMiniWeatherIcon(code) {
    if (code === 0) return "☀️"
    if (code === 1 || code === 2) return "⛅"
    if (code === 3) return "☁️"
    if (code >= 45 && code <= 48) return "🌫️"
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "🌧️"
    if (code >= 71 && code <= 77) return "❄️"
    if (code >= 95) return "⛈️"
    return "🌡️"
  }

  function buildMiniForecastMarkup() {
    if (miniForecastState.loading) {
      return `<div class="wrtdip-layer-panel__mini-loading">Loading 3-day forecast...</div>`
    }
    if (!miniForecastState.days.length) {
      const hint = miniForecastState.hasLoaded
        ? "Forecast unavailable"
        : "Select a city marker"
      return `<div class="wrtdip-layer-panel__mini-hint">${hint}</div>`
    }

    return `
      <div class="wrtdip-layer-panel__mini-grid">
        ${miniForecastState.days
          .map(
            (day) => `
              <div class="wrtdip-layer-panel__mini-day">
                <span class="wrtdip-layer-panel__mini-icon" aria-hidden="true">${getMiniWeatherIcon(day.code)}</span>
                <span class="wrtdip-layer-panel__mini-temp">${day.temp}°</span>
              </div>
            `
          )
          .join("")}
      </div>
    `
  }

  async function updateLayerPanelMiniForecast(lat, lon) {
    miniForecastState.loading = true
    renderCustomLayerList()
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&daily=weather_code,temperature_2m_max&timezone=auto&forecast_days=3&temperature_unit=celsius`
      const json = await fetch(url).then((r) => r.json())
      const daily = json?.daily || {}
      const codes = Array.isArray(daily.weather_code) ? daily.weather_code : []
      const temps = Array.isArray(daily.temperature_2m_max)
        ? daily.temperature_2m_max
        : []
      miniForecastState.days = [0, 1, 2]
        .map((i) => ({
          code: codes[i],
          temp: Number.isFinite(temps[i]) ? Math.round(temps[i]) : null,
        }))
        .filter((d) => d.temp !== null)
    } catch (e) {
      miniForecastState.days = []
    } finally {
      miniForecastState.loading = false
      miniForecastState.hasLoaded = true
      renderCustomLayerList()
    }
  }

  /**
   * Build / rebuild the list of layers as checkbox rows. Wires up two-way
   * sync: clicks toggle layer.visible, and external visibility changes
   * (e.g. via code) update the checkboxes.
   */
  const layerWatchHandles = []
  function renderCustomLayerList() {
    // Clean up previous per-layer watchers
    while (layerWatchHandles.length) {
      const h = layerWatchHandles.pop()
      try { h.remove() } catch (e) { /* ignore */ }
    }

    // ---- Featured row: 3-Day Forecast ----
    const featuredSlot = layerListContainer.querySelector("[data-featured-slot]")
    featuredSlot.innerHTML = ""
    const forecastLayer = map.layers.find(
      (l) => l && l.title === FORECAST_LAYER_TITLE
    )
    if (forecastLayer) {
      const featured = document.createElement("div")
      featured.className = "wrtdip-layer-panel__featured-row"

      const label = document.createElement("label")
      label.className = "wrtdip-layer-panel__featured-label"
      label.innerHTML = `
        <span class="wrtdip-layer-panel__featured-icon" aria-hidden="true">⛅</span>
        <span class="wrtdip-layer-panel__featured-text">
          <span class="wrtdip-layer-panel__featured-title">3-Day Forecast</span>
          <span class="wrtdip-layer-panel__featured-sub">${
            miniForecastState.cityName || "Select a city marker"
          }</span>
          ${buildMiniForecastMarkup()}
        </span>
      `

      featured.appendChild(label)
      featuredSlot.appendChild(featured)
    }

    // ---- Regular layer list ----
    const ul = layerListContainer.querySelector(".wrtdip-layer-panel__list")
    ul.innerHTML = ""

    // Render in reverse so the top-most map layer appears at the top of the list.
    const layers = map.layers.toArray().slice().reverse()
    layers.forEach((layer) => {
      if (!layer.title) return
      // Skip the forecast layer here — it's pinned at the top instead.
      if (layer.title === FORECAST_LAYER_TITLE) return

      const li = document.createElement("li")
      li.className = "wrtdip-layer-panel__item"

      const id = `wrtdip-layer-${Math.random().toString(36).slice(2, 9)}`
      const checkbox = document.createElement("input")
      checkbox.type = "checkbox"
      checkbox.id = id
      checkbox.className = "wrtdip-layer-panel__checkbox"
      checkbox.checked = !!layer.visible

      const label = document.createElement("label")
      label.htmlFor = id
      label.className = "wrtdip-layer-panel__label"
      label.textContent = layer.title

      checkbox.addEventListener("change", () => {
        layer.visible = checkbox.checked
      })

      // Keep checkbox in sync with external changes
      const handle = layer.watch("visible", (v) => {
        checkbox.checked = !!v
      })
      layerWatchHandles.push(handle)

      li.appendChild(checkbox)
      li.appendChild(label)
      ul.appendChild(li)
    })
  }

  // "All" / "None" bulk toggles
  layerListContainer.querySelectorAll(".wrtdip-layer-panel__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action")
      const next = action === "all"
      map.layers.forEach((layer) => {
        if (layer.title) layer.visible = next
      })
    })
  })

  // Re-render whenever layers are added/removed from the map
  map.layers.on("change", () => renderCustomLayerList())
  // Initial render (more layers may be added later — change handler will refresh)
  renderCustomLayerList()


 
        const legend = new Legend({ 
          view, 
          container: "legend-container" })

        // Add expand widgets for layer list and legend
        const layerListExpand = new Expand({
          content: layerListContainer,
          view,
          expanded: false,
          expandIconClass: "custom-layerlist-icon",
        })
        const legendExpand = new Expand({
          content: legend.domNode,
          view,
          expanded: window.innerWidth > 768,
          expandIconClass: "custom-legend-icon",
        })

        // --- Basemap switcher panel (same styling as the layer panel) ---
        const basemapPanel = document.createElement("div")
        basemapPanel.className = "wrtdip-layer-panel wrtdip-basemap-panel"
        basemapPanel.innerHTML = `
          <div class="wrtdip-layer-panel__header">
            <span class="wrtdip-layer-panel__title">Base Map</span>
          </div>
          <ul class="wrtdip-basemap-panel__list" role="list"></ul>
        `
        const basemapList = basemapPanel.querySelector(
          ".wrtdip-basemap-panel__list"
        )
        let activeBasemapId = "street"
        BASEMAP_OPTIONS.forEach((opt) => {
          const li = document.createElement("li")
          li.className = "wrtdip-basemap-panel__item"
          const btn = document.createElement("button")
          btn.type = "button"
          btn.className = "wrtdip-basemap-panel__option"
          if (opt.id === activeBasemapId) btn.classList.add("is-active")
          btn.dataset.basemapId = opt.id
          btn.innerHTML = `
            <span class="wrtdip-basemap-panel__icon" aria-hidden="true">${opt.icon}</span>
            <span class="wrtdip-basemap-panel__text">
              <span class="wrtdip-basemap-panel__name">${opt.title}</span>
              <span class="wrtdip-basemap-panel__sub">${opt.sub}</span>
            </span>
            <span class="wrtdip-basemap-panel__check" aria-hidden="true">\u2713</span>
          `
          btn.addEventListener("click", () => {
            if (activeBasemapId === opt.id) return
            activeBasemapId = opt.id
            map.basemap = opt.basemap
            basemapList
              .querySelectorAll(".wrtdip-basemap-panel__option")
              .forEach((b) =>
                b.classList.toggle(
                  "is-active",
                  b.dataset.basemapId === activeBasemapId
                )
              )
          })
          li.appendChild(btn)
          basemapList.appendChild(li)
        })

        const basemapExpand = new Expand({
          content: basemapPanel,
          view,
          expanded: false,
          expandIconClass: "custom-basemap-icon",
          expandTooltip: "Base Map",
        })

        // Add custom zoom button
        const customZoomButton = document.createElement("div")
        customZoomButton.innerHTML = "🏠"
        customZoomButton.title = "Default"
        customZoomButton.classList.add(
          "esri-widget",
          "esri-widget--button",
          "esri-widget--icon",
          "esri-zoom__custom-button"
        )

        customZoomButton.addEventListener("click", () => {
          view.goTo({ center: [-110, 65.5], zoom: 4.5 })
        })

        view.ui.add(customZoomButton, "top-left")

        // --- GPS Location Button ---
        const gpsButton = document.createElement("div")
        gpsButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#333"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>'
        gpsButton.title = "My Location"
        gpsButton.classList.add(
          "esri-widget",
          "esri-widget--button",
          "esri-widget--icon",
          "esri-zoom__custom-button"
        )

        let gpsMarkerGraphic = null
        let gpsLocationGranted = false
        const DEBUG_GPS = { enabled: true, latitude: 62.45, longitude: -114.37 }
        const DEBUG_GPS_DRAGGABLE = true  // Allow dragging the GPS pin to simulate different locations

        function findNearestCity(lat, lon) {
          let nearest = null
          let minDist = Infinity

          const allCoords = [
            { coords: yukonCoordinates, territory: "yt", names: citiesOfYukon },
            { coords: northWestCoordinates, territory: "nt", names: citiesOfNorthwestTerritories },
            { coords: nunavutCoordinates, territory: "nu", names: citiesOfNunavut },
          ]

          allCoords.forEach(({ coords, territory, names }) => {
            Object.keys(coords).forEach((key) => {
              const [cLat, cLon] = coords[key]
              const dist = Math.sqrt(Math.pow(cLat - lat, 2) + Math.pow(cLon - lon, 2))
              if (dist < minDist) {
                minDist = dist
                nearest = { key, territory, name: names[key], lat: cLat, lon: cLon, dist }
              }
            })
          })
          return nearest
        }

        // Threshold in degrees — roughly 0.1 ≈ 10km
        const GPS_CITY_THRESHOLD = 0.1
        const GPS_ROAD_QUERY_RADIUS = 0.3  // degrees for road buffer query

        const ROAD_LAYER_TITLES = [
          "Winter Roads - Northwest Territories",
          "Winter Roads - Nunavut",
          "Ice Crossings - Northwest Territories",
          "Ice Crossings - Yukon",
        ]

        function findNearestRoad(latitude, longitude) {
          const roadLayers = map.layers
            .toArray()
            .filter((l) => ROAD_LAYER_TITLES.includes(l.title) && l.visible)

          if (roadLayers.length === 0) return Promise.resolve(null)

          const queryGeometry = {
            type: "extent",
            xmin: longitude - GPS_ROAD_QUERY_RADIUS,
            ymin: latitude - GPS_ROAD_QUERY_RADIUS,
            xmax: longitude + GPS_ROAD_QUERY_RADIUS,
            ymax: latitude + GPS_ROAD_QUERY_RADIUS,
            spatialReference: { wkid: 4326 },
          }

          const queries = roadLayers.map((layer) => {
            const query = layer.createQuery()
            query.geometry = queryGeometry
            query.spatialRelationship = "intersects"
            query.outFields = ["*"]
            query.returnGeometry = true
            return layer.queryFeatures(query).then((result) => {
              if (result.features.length > 0) {
                return { feature: result.features[0], layer }
              }
              return null
            }).catch(() => null)
          })

          return Promise.all(queries).then((results) => {
            return results.find((r) => r !== null) || null
          })
        }

        function showGpsLocation(openNearestCity) {
          const handlePosition = (latitude, longitude) => {
              const gpsPoint = {
                type: "point",
                latitude: latitude,
                longitude: longitude,
              }

              // Remove previous GPS marker if it exists
              if (gpsMarkerGraphic) {
                view.graphics.remove(gpsMarkerGraphic)
              }

              // Add GPS marker (red location pin matching MUI LocationOn)
              const locationPinSvg = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#d32f2f"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>')
              gpsMarkerGraphic = new Graphic({
                geometry: gpsPoint,
                symbol: {
                  type: "picture-marker",
                  url: locationPinSvg,
                  width: "36px",
                  height: "36px",
                  yoffset: "18px",
                },
              })
              view.graphics.add(gpsMarkerGraphic)

              // Enable dragging of GPS marker for debugging
              if (DEBUG_GPS_DRAGGABLE) {
                let isDraggingGps = false

                view.on("drag", (event) => {
                  if (!gpsMarkerGraphic) return

                  if (event.action === "start") {
                    view.hitTest(event).then((response) => {
                      const hit = response.results.find((r) => r.graphic === gpsMarkerGraphic)
                      if (hit) {
                        isDraggingGps = true
                        event.stopPropagation()
                      }
                    })
                  } else if (event.action === "update" && isDraggingGps) {
                    event.stopPropagation()
                    const point = view.toMap({ x: event.x, y: event.y })
                    if (point) {
                      gpsMarkerGraphic.geometry = point
                    }
                  } else if (event.action === "end" && isDraggingGps) {
                    isDraggingGps = false
                    event.stopPropagation()
                    const finalPoint = gpsMarkerGraphic.geometry
                    console.log("GPS marker moved to:", finalPoint.latitude, finalPoint.longitude)

                    // Trigger the same logic as clicking the GPS button
                    const lat = finalPoint.latitude
                    const lon = finalPoint.longitude
                    const nearestCity = findNearestCity(lat, lon)

                    findNearestRoad(lat, lon).then((roadResult) => {
                      if (roadResult && (!nearestCity || nearestCity.dist > GPS_CITY_THRESHOLD)) {
                        const graphic = roadResult.feature
                        const attrs = graphic.attributes || {}
                        const layerTitle = roadResult.layer.title || ""
                        const originalLayer = layerData.find((l) => l.title === layerTitle)
                        const origTmpl = originalLayer?.popupTemplate || {}

                        const sub = (str) =>
                          (str || "").replace(/\{([^}]+)\}/g, (_, field) => {
                            const key = Object.keys(attrs).find((k) => k.toLowerCase() === field.toLowerCase())
                            const val = key ? attrs[key] : null
                            return val != null ? val : ""
                          })

                        const title = sub(typeof origTmpl.title === "string" ? origTmpl.title : "")
                        const content = sub(typeof origTmpl.content === "string" ? origTmpl.content : "")

                        const mapRect = MapElement.current.getBoundingClientRect()
                        const screenX = mapRect.width / 2
                        const screenY = mapRect.height / 2

                        setFeaturePopup({ title, content, layerTitle, screenX, screenY })
                      } else if (nearestCity && nearestCity.dist <= GPS_CITY_THRESHOLD) {
                        setKey(nearestCity.key)
                        setTerritory(nearestCity.territory)
                        setFeaturePopup(null)
                        setModalIsOpen(true)
                      } else if (nearestCity) {
                        setKey(nearestCity.key)
                        setTerritory(nearestCity.territory)
                        setFeaturePopup(null)
                        setModalIsOpen(true)
                      }
                    })
                  }
                })
              }

              // Zoom to user location
              view.goTo({ center: [longitude, latitude], zoom: 8 })

              // If triggered by click, open nearest city or road popup
              if (openNearestCity) {
                const nearestCity = findNearestCity(latitude, longitude)

                findNearestRoad(latitude, longitude).then((roadResult) => {
                  if (roadResult && (!nearestCity || nearestCity.dist > GPS_CITY_THRESHOLD)) {
                    // Road is nearby and city is not close — open road popup
                    const graphic = roadResult.feature
                    const attrs = graphic.attributes || {}
                    const layerTitle = roadResult.layer.title || ""
                    const originalLayer = layerData.find((l) => l.title === layerTitle)
                    const origTmpl = originalLayer?.popupTemplate || {}

                    const sub = (str) =>
                      (str || "").replace(/\{([^}]+)\}/g, (_, field) => {
                        const key = Object.keys(attrs).find((k) => k.toLowerCase() === field.toLowerCase())
                        const val = key ? attrs[key] : null
                        return val != null ? val : ""
                      })

                    const title = sub(typeof origTmpl.title === "string" ? origTmpl.title : "")
                    const content = sub(typeof origTmpl.content === "string" ? origTmpl.content : "")

                    // Position popup at center of screen
                    const mapRect = MapElement.current.getBoundingClientRect()
                    const screenX = mapRect.width / 2
                    const screenY = mapRect.height / 2

                    setFeaturePopup({ title, content, layerTitle, screenX, screenY })
                  } else if (nearestCity && nearestCity.dist <= GPS_CITY_THRESHOLD) {
                    // City is very close — open city modal
                    setKey(nearestCity.key)
                    setTerritory(nearestCity.territory)
                    setFeaturePopup(null)
                    setModalIsOpen(true)
                  } else if (nearestCity) {
                    // Fallback: open nearest city regardless
                    setKey(nearestCity.key)
                    setTerritory(nearestCity.territory)
                    setFeaturePopup(null)
                    setModalIsOpen(true)
                  }
                })
              }

              gpsLocationGranted = true
          }

          if (DEBUG_GPS.enabled) {
            handlePosition(DEBUG_GPS.latitude, DEBUG_GPS.longitude)
          } else {
            navigator.geolocation.getCurrentPosition(
              (position) => handlePosition(position.coords.latitude, position.coords.longitude),
              (error) => {
                console.warn("GPS error:", error.message)
                alert("Unable to retrieve your location. Please allow GPS access.")
              },
              { enableHighAccuracy: true, timeout: 10000 }
            )
          }
        }

        // On page load, if GPS permission is already granted, show marker + zoom
        if (navigator.permissions) {
          navigator.permissions.query({ name: "geolocation" }).then((result) => {
            if (result.state === "granted") {
              showGpsLocation(false)
            }
          })
        }

        gpsButton.addEventListener("click", () => {
          if (gpsLocationGranted) {
            // Already have location — just zoom + open nearest city
            showGpsLocation(true)
          } else {
            // First time — request permission, show marker, zoom, open nearest city
            showGpsLocation(true)
          }
        })

        view.ui.add(gpsButton, "top-left")

        /**
         * Creates a graphic representing a city on the map.
         * @param {number[]} coordinates - Array containing latitude and longitude of the city.
         * @param {string} color - Color of the marker representing the city.
         * @param {GraphicsLayer} layer - Graphics layer where the city graphic will be added.
         * @param {string} cityKey - The key used to identify this city in the coordinates object.
         * @param {string} territoryCode - Territory code ("yt", "nt", "nu").
         */
        function createCityGraphic(coordinates, color, layer, cityKey, territoryCode) {
          const pinCoordinates = {
            type: "point",
            longitude: coordinates[1],
            latitude: coordinates[0],
          }

          // Resolve city name for the label
          let cityName = ""
          if (territoryCode === "yt") cityName = citiesOfYukon[cityKey] || ""
          else if (territoryCode === "nt") cityName = citiesOfNorthwestTerritories[cityKey] || ""
          else if (territoryCode === "nu") cityName = citiesOfNunavut[cityKey] || ""

          let markerStyle = {
            type: "simple-marker",
            color: color,
            size: "15px",
            outline: {
              color: "white",
              width: 1,
            },
          };

          let newPointGraphic = new Graphic({
            symbol: markerStyle,
            geometry: pinCoordinates,
            attributes: {
              cityKey: cityKey,
              territory: territoryCode,
            },
          });
          layer.add(newPointGraphic);

          // Add text label for the city
          let labelGraphic = new Graphic({
            symbol: {
              type: "text",
              color: "#333",
              text: cityName,
              font: {
                size: 10,
                weight: "bold",
              },
              haloColor: "white",
              haloSize: 1,
              yoffset: -14,
            },
            geometry: pinCoordinates,
          });
          layer.add(labelGraphic);
        }

        // --- Hover: enlarge marker on pointer-move ---
        let highlightedGraphic = null
        const NORMAL_SIZE = "15px"
        const HOVER_SIZE = "22px"

        // Road-feature hover state: the ArcGIS highlight handle producing the
        // glow, and a key identifying which feature is currently glowing.
        let roadHighlightHandle = null
        let roadHighlightKey = null
        const clearRoadHighlight = () => {
          if (roadHighlightHandle) {
            roadHighlightHandle.remove()
            roadHighlightHandle = null
          }
          roadHighlightKey = null
        }

        view.on("pointer-move", (event) => {
          view.hitTest(event).then((response) => {
            const hit = response.results.find(
              (r) => r.graphic && r.graphic.attributes && r.graphic.attributes.cityKey != null
            )

            if (hit) {
              const graphic = hit.graphic
              // Only update if it's a different graphic than currently highlighted
              if (highlightedGraphic !== graphic) {
                // Reset previous
                if (highlightedGraphic) {
                  const prevSymbol = highlightedGraphic.symbol.clone()
                  prevSymbol.size = NORMAL_SIZE
                  highlightedGraphic.symbol = prevSymbol
                }
                // Enlarge current
                const newSymbol = graphic.symbol.clone()
                newSymbol.size = HOVER_SIZE
                graphic.symbol = newSymbol
                highlightedGraphic = graphic
              }
              clearRoadHighlight()
              view.container.style.cursor = "pointer"
            } else {
              // Reset if we moved off all markers
              if (highlightedGraphic) {
                const prevSymbol = highlightedGraphic.symbol.clone()
                prevSymbol.size = NORMAL_SIZE
                highlightedGraphic.symbol = prevSymbol
                highlightedGraphic = null
              }

              // Glow winter roads / ice crossings on hover so users can tell
              // they're clickable.
              const roadHit = response.results.find(
                (r) =>
                  r.graphic &&
                  r.graphic.layer &&
                  ROAD_LAYER_TITLES.includes(r.graphic.layer.title)
              )
              if (roadHit) {
                const graphic = roadHit.graphic
                const oid = graphic.attributes?.[graphic.layer.objectIdField]
                const key = `${graphic.layer.title}:${oid}`
                if (roadHighlightKey !== key) {
                  clearRoadHighlight()
                  roadHighlightKey = key
                  view.whenLayerView(graphic.layer).then((layerView) => {
                    // A later hover may have superseded this one while the
                    // layer view was resolving.
                    if (roadHighlightKey === key) {
                      roadHighlightHandle = layerView.highlight(graphic)
                    }
                  })
                }
                view.container.style.cursor = "pointer"
              } else {
                clearRoadHighlight()
                view.container.style.cursor = "default"
              }
            }
          })
        })

        // --- Click: use hitTest for precise marker detection ---
        view.on("click", (event) => {
          console.log("Response0", event)
          view.hitTest(event).then((response) => {
            console.log("hitTest response", response)
            console.log("Response1", response.results)
            const hit = response.results.find(
              (r) => r.graphic && r.graphic.attributes && r.graphic.attributes.cityKey != null
            )

            if (!hit) {
              // No city marker clicked — check for feature layer popups
              // (e.g. Winter Roads, Airports, Ice Crossings)
              console.log("Response2",response.results)
              const featureHit = response.results.find(
                (r) =>
                  r.graphic &&
                  r.graphic.layer &&
                  r.graphic.layer.popupEnabled &&
                  r.graphic.layer.popupTemplate
              )
              if (featureHit) {
                const graphic = featureHit.graphic
                const attrs = graphic.attributes || {}
                const layerTitle = graphic.layer.title || ""

                console.log("--- CUSTOM POPUP PROCESSING START ---")
                console.log("1. Layer Title:", layerTitle)
                console.log("2. Graphic Attributes:", attrs)

                // Get original string template from layerData because ArcGIS autocasts popupTemplate.content into an object array
                const originalLayer = layerData.find((l) => l.title === layerTitle)
                const origTmpl = originalLayer?.popupTemplate || {}
                console.log("3. Original Template from layerData:", origTmpl)

                // Substitute {FIELD} placeholders with actual attribute values (case-insensitive key match)
                const sub = (str) =>
                  (str || "").replace(/\{([^}]+)\}/g, (_, field) => {
                    const key = Object.keys(attrs).find((k) => k.toLowerCase() === field.toLowerCase())
                    const val = key ? attrs[key] : null
                    console.log(`  -> Substituting {${field}}: matched attribute key '${key}' with value '${val}'`)
                    return val != null ? val : ""
                  })

                const rawTitle = typeof origTmpl.title === "string" ? origTmpl.title : (graphic.layer.popupTemplate?.title || "")
                const rawContent = typeof origTmpl.content === "string" ? origTmpl.content : ""
                console.log("4. Raw Title before substitution:", rawTitle)
                console.log("5. Raw Content before substitution:", rawContent)

                const title = sub(rawTitle)
                const content = sub(rawContent)
                console.log("6. Final Title after substitution:", title)
                console.log("7. Final Content after substitution:", content)
                console.log("--- CUSTOM POPUP PROCESSING END ---")

                // Get screen position relative to map container
                const mapRect = MapElement.current.getBoundingClientRect()
                const screenX = event.x - mapRect.left
                const screenY = event.y - mapRect.top

                setFeaturePopup({ title, content, layerTitle, screenX, screenY })
              } else {
                setFeaturePopup(null)
              }
              return
            }

            const { cityKey, territory: terr } = hit.graphic.attributes
            let selectedCityName = null
            let selectedCoordinates = null

            if (terr === "yt") {
              selectedCityName = citiesOfYukon[cityKey]
              selectedCoordinates = yukonCoordinates[cityKey]
              let city = cities.find((c) => c.name_e == selectedCityName)
              if (city && city.province && city.stationCode) {
                setClimateLoading(true)
                setClimateData(null)
                getClimateCity(city.province, city.stationCode)
                  .then((data) => setClimateData(data))
                  .catch(() =>
                    setClimateData({ error: "Weather data is unavailable right now." })
                  )
                  .finally(() => setClimateLoading(false))
              } else if (city) {
                setClimateData({ error: "No weather data available for this location." })
                setClimateLoading(false)
              }
            } else if (terr === "nt") {
              selectedCityName = citiesOfNorthwestTerritories[cityKey]
              selectedCoordinates = northWestCoordinates[cityKey]
            } else if (terr === "nu") {
              selectedCityName = citiesOfNunavut[cityKey]
              selectedCoordinates = nunavutCoordinates[cityKey]
            }

            miniForecastState.cityName = selectedCityName || ""
            renderCustomLayerList()

            if (terr != null && selectedCoordinates) {
              updateLayerPanelMiniForecast(
                selectedCoordinates[0],
                selectedCoordinates[1]
              )
            }
            setKey(cityKey)
            setTerritory(terr)
            setFeaturePopup(null) // Close feature popup when city modal opens
            setModalIsOpen(true)
          })
        })

        // Disable default popup so other layer popups don't interfere
        view.popup.autoOpenEnabled = false

        //Adds the feature layers from the ArcGIS web map. Certain layers are hidden via the featureLayer.visible parameter
      //  layerData.forEach((layer, index) => {
      //    const featureLayer = new FeatureLayer({
      //      url: layer.link,
      //      popupTemplate: layer.popupTemplate,
      //      visible: layer.visible, // Apply the visible property from layerData
      //    })

          //Set renderer
      //    if (layer.renderer) {
     //       featureLayer.renderer = layer.renderer
      //    }

          // Set visibility for specific indices
      //    if (index === 0 || index === 4 || index === 7) {
      //      featureLayer.visible = false
      //    }

      //    featureLayer.title = layer.title

          // featureLayer.featureReduction = {
          //   type: "cluster",
          // };

      //    map.add(featureLayer)
      //  })

        view.ui.add(layerListExpand, "top-left")
        view.ui.add(basemapExpand, "top-left")
        view.ui.add(legendExpand, "top-right")

        //adds the live weather data from the GeoMet API for towns in the three territories
        const liveWeatherDataLayer = new GraphicsLayer({
          title: "Weather and Climate Data",
        })

        Object.keys(yukonCoordinates).forEach((key) => {
          createCityGraphic(yukonCoordinates[key], "blue", liveWeatherDataLayer, key, "yt")
        })
        Object.keys(northWestCoordinates).forEach((key) => {
          createCityGraphic(northWestCoordinates[key], "blue", liveWeatherDataLayer, key, "nt")
        })
        Object.keys(nunavutCoordinates).forEach((key) => {
          createCityGraphic(nunavutCoordinates[key], "blue", liveWeatherDataLayer, key, "nu")
        })
        map.add(liveWeatherDataLayer)

        // Create a new GraphicsLayer for the weather forecast
        const weatherForecastLayer = new GraphicsLayer({
          title: "Weather Forecast",
          visible: false,
        })
                
        // Add Weather Forecast markers to the Weather Forecast layer
        Object.keys(yukonCoordinates).forEach((key) => {
          createCityGraphic(yukonCoordinates[key], "orange", weatherForecastLayer, key, "yt")
        })
        Object.keys(northWestCoordinates).forEach((key) => {
          createCityGraphic(northWestCoordinates[key], "orange", weatherForecastLayer, key, "nt")
        })
        Object.keys(nunavutCoordinates).forEach((key) => {
          createCityGraphic(nunavutCoordinates[key], "orange", weatherForecastLayer, key, "nu")
        })
        
map.add(weatherForecastLayer);
      }
    )
  }
}

export default WeatherMap
