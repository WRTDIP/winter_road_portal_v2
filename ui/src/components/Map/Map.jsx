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
import { width } from "@fortawesome/free-regular-svg-icons/faAddressBook"
import { getClimateCity } from "../../services/meteo.service.js"
import { cities } from "../../utils/constants.js"
import { LineChart, lineElementClasses, areaElementClasses } from "@mui/x-charts/LineChart"
import { BarChart } from "@mui/x-charts/BarChart"
import { Icon, Typography } from "@mui/material"
import useMediaQuery from "@mui/material/useMediaQuery"
import OpenInFullIcon from "@mui/icons-material/OpenInFull"
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen"
import IconButton from "@mui/material/IconButton"
import ForecastPanel from "./ForecastPanel.jsx"
import YearRangeSlider from "../YearRangeSlider/YearRangeSlider.jsx"
import usePinchZoomYears from "../../hooks/usePinchZoomYears.js"

const API_BASE = "https://dev-moh.wramp.ca/python-api";

// A station needs at least this many usable seasons before its FDD graph is
// drawn — one or two dots read as a trend when they aren't one. Stations below
// the threshold get a "not enough data" message instead.
const MIN_GRAPH_POINTS = 6

// Short month names for chart labels.
const MONTH_ABBR = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Bar geometry for the precipitation chart. A monthly range is at most 12 bars,
// so they can be wide; a daily range is up to ~90, so they have to be thin.
// (categoryGapRatio: gap between categories, barGapRatio: gap between bars.)
const PRECIP_BAR_GAPS = {
  monthly: { categoryGapRatio: 0.15, barGapRatio: 0.05 },
  daily: { categoryGapRatio: 0.55, barGapRatio: 0.2 },
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

// Interactive gauge summarising the min / average / max days a road is open.
// The track is coloured by distance from the average: green within one standard
// deviation, yellow out to two, red out to three, then white beyond. The colour
// boundaries are hard-edged. Hovering the track shows the day count at the
// cursor and which standard-deviation band (1σ / 2σ / 3σ) it falls in.
function DurationHeatGauge({ durationDays }) {
  const trackRef = useRef(null)
  const [hover, setHover] = useState(null) // { pct, days, label, color }

  if (!durationDays || durationDays.length === 0) return null

  const min = Math.min(...durationDays)
  const max = Math.max(...durationDays)
  const avg = durationDays.reduce((s, d) => s + d, 0) / durationDays.length
  // Population standard deviation of the per-season durations.
  const sd = Math.sqrt(
    durationDays.reduce((s, d) => s + (d - avg) ** 2, 0) / durationDays.length
  )

  const GREEN = "#66bb6a"
  const YELLOW = "#fdd835"
  const RED = "#ef5350"
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
  // blend): white | red (3σ) | yellow (2σ) | green (1σ) | yellow | red | white.
  const gradient =
    `linear-gradient(to right, ` +
    `${WHITE} 0%, ${WHITE} ${sd3Lo}%, ` +
    `${RED} ${sd3Lo}%, ${RED} ${sd2Lo}%, ` +
    `${YELLOW} ${sd2Lo}%, ${YELLOW} ${sd1Lo}%, ` +
    `${GREEN} ${sd1Lo}%, ${GREEN} ${sd1Hi}%, ` +
    `${YELLOW} ${sd1Hi}%, ${YELLOW} ${sd2Hi}%, ` +
    `${RED} ${sd2Hi}%, ${RED} ${sd3Hi}%, ` +
    `${WHITE} ${sd3Hi}%, ${WHITE} 100%)`

  // Classify a duration value into its σ band for the hover readout, expressed
  // as the likelihood of a season falling in that band under a normal
  // distribution (per-band probabilities: ≈68% / ≈27% / ≈4% / <1%).
  const classify = (value) => {
    const z = Math.abs(value - avg) / unit
    if (z <= 1) return { color: GREEN, label: "typical · ≈68% of seasons" }
    if (z <= 2) return { color: YELLOW, label: "uncommon · ≈27% of seasons" }
    if (z <= 3) return { color: RED, label: "rare · ≈4% of seasons" }
    return { color: GREY, label: "very rare · <1% of seasons" }
  }

  const handleMove = (e) => {
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
      <span style={{ fontSize: 11, fontWeight: 700, color, lineHeight: 1.2, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span style={{ fontSize: 10, color: "#475569", lineHeight: 1.2, whiteSpace: "nowrap" }}>
        {Math.round(value)} days
      </span>
      <div style={{ width: 2, height: 8, background: color, marginTop: below ? 0 : 2, marginBottom: below ? 2 : 0 }} />
    </div>
  )

  return (
    <div style={{ width: "100%", padding: "4px 12px 2px" }}>
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
            <span style={{ fontSize: 11, fontWeight: 700, color: hover.color, lineHeight: 1.2, whiteSpace: "nowrap" }}>
              {hover.days} days
            </span>
            <span style={{ fontSize: 10, color: "#475569", lineHeight: 1.2, whiteSpace: "nowrap" }}>
              {hover.label}
            </span>
            <div style={{ width: 2, height: 8, background: hover.color, marginTop: 2 }} />
          </div>
        ) : (
          <Marker pct={avgPct} color="#2e7d32" label="Avg" value={avg} />
        )}
      </div>
      <div
        ref={trackRef}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
        style={{
          position: "relative",
          height: 22,
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
        <Marker pct={minPct} color="#c62828" label="Min" value={min} below />
        <Marker pct={maxPct} color="#c62828" label="Max" value={max} below />
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

  // Custom feature popup state (replaces ArcGIS native popup)
  const [featurePopup, setFeaturePopup] = useState(null) // {title, content, layerTitle, screenX, screenY}

  // Road closure open/close trend chart state
  const [roadTrendName, setRoadTrendName] = useState("")
  const [roadTrendLoading, setRoadTrendLoading] = useState(false)
  const [roadTrend, setRoadTrend] = useState(null) // backend payload
  // Whether the road popup is enlarged (centered on screen like a modal).
  const [roadPopupEnlarged, setRoadPopupEnlarged] = useState(false)
  // Whether the inline trend chart is collapsed. Persists for the lifetime of
  // the page (session) so the user's choice is remembered across road popups.
  // Defaults to expanded (open) on page load.
  const [roadTrendCollapsed, setRoadTrendCollapsed] = useState(false)
  // Whether the inline open-duration chart is collapsed. Same persistence
  // behaviour as the trend chart; defaults to expanded.
  const [roadDurationCollapsed, setRoadDurationCollapsed] = useState(false)
  // Climate trend statistics (bottom section of the road popup).
  const [roadStats, setRoadStats] = useState(null) // backend payload
  const [roadStatsLoading, setRoadStatsLoading] = useState(false)
  const [roadStatsCollapsed, setRoadStatsCollapsed] = useState(false)
  // Whether the full numbers table inside the stats section is shown.
  const [roadStatsDetail, setRoadStatsDetail] = useState(false)
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
  // "Advanced" reveals the statistical detail (p-values). Off by default so the
  // table reads as plain mm/yr for a non-technical visitor.
  const [precipTrendAdvanced, setPrecipTrendAdvanced] = useState(false)
  const [tempData, setTempData] = useState(null) // {labels: [], avgs: [], maxs: [], mins: []}
  const [tempLoading, setTempLoading] = useState(false)
  const [tempMonthRange, setTempMonthRange] = useState([defaultMonthStart, defaultMonthEnd])
  const [tempShowMax, setTempShowMax] = useState(true)
  const [tempShowAvg, setTempShowAvg] = useState(true)
  const [tempShowMin, setTempShowMin] = useState(true)
  const isMobile = useMediaQuery("(max-width:768px)")

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

    const fmt = (iso) => {
      if (!iso) return null
      const d = new Date(iso + "T00:00:00")
      return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })
    }

    fetch(`${API_BASE}/road-closure-forecast?road_name=${encodeURIComponent(roadName)}`)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return
        const d = res?.data || {}
        const open = fmt(d.expected_open)
        const close = fmt(d.expected_close)

        let html
        if (!d.matched || (!open && !close)) {
          html = `<div data-road-forecast><em>No historical closure data available.</em></div>`
        } else {
          // No season in brackets — averages are computed across the full
          // historical record, so a single season label is misleading.
          const openLabel = d.open_predicted ? "Average Opening" : "Opening"
          const closeLabel = d.close_predicted ? "Average Closure" : "Closure"
          html =
            `<div data-road-forecast>` +
            `<b>${openLabel}:</b> ${open || "N/A"}<br>` +
            `<b>${closeLabel}:</b> ${close || "N/A"}<br>` +
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

    // Green = opening, Red = closing.
    const OPEN_COLOR = "#16a34a"
    const CLOSE_COLOR = "#dc2626"

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

    // Shade the chart by road status: solid green between the opening and
    // closing trend lines (road open) and solid red everywhere else (road
    // closed). The red is a full-height area covering the whole plot; the green
    // band is two stacked areas — a transparent base on the opening trend and a
    // fill carrying the (close − open) gap — so it spans exactly from the
    // opening line up to the closing line. Both are null wherever either trend
    // is missing so the shading only covers the range where both trends exist.
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
      // Red "closed" background: a full-height area filling the whole plot.
      // Drawn first so the green band and the data sit on top of it.
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
      // Green "open" band between the trend lines (transparent stacked base on
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
        label: "Opening",
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
        label: "Closing",
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

    return (
      <div style={{ width: "100%" }}>
        <LineChart
          height={height}
          series={series}
          xAxis={[
            {
              data: years,
              scaleType: "point",
              label: "Year",
              valueFormatter: (v) => String(v),
            },
          ]}
          yAxis={[
            {
              label: "Date",
              min: yMin,
              max: yMax,
              valueFormatter: (v) => dosToLabel(v),
            },
          ]}
          margin={{ left: 78, right: 18, top: 48, bottom: 50 }}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              direction: "row",
              position: { vertical: "top", horizontal: "middle" },
              padding: 0,
              itemMarkWidth: 14,
              itemMarkHeight: 3,
              markGap: 5,
              itemGap: 18,
              labelStyle: { fontSize: 12 },
            },
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
            // Solid red "closed" background and solid green "open" band.
            "& .MuiAreaElement-series-redBg": { fill: CLOSE_COLOR, fillOpacity: 0.18 },
            "& .MuiAreaElement-series-bandFill": { fill: OPEN_COLOR, fillOpacity: 0.32 },
            // Dash the trend lines so they read distinctly from the points.
            "& .MuiLineElement-series-openTrend": { strokeDasharray: "6 4" },
            "& .MuiLineElement-series-closeTrend": { strokeDasharray: "6 4" },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, textAlign: "center" }}>
          Points are recorded open/close dates per season; lines are LOWESS trends.
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

    return (
      <div style={{ width: "100%" }}>
        <DurationHeatGauge durationDays={durationDays} />
        <BarChart
          height={height}
          series={[
            {
              type: "bar",
              id: "openDuration",
              label: "Days open",
              color: "#2563eb",
              data: durationDays,
              valueFormatter: (v) => (v == null ? "" : `${v} days`),
            },
          ]}
          xAxis={[
            {
              data: durationYears,
              scaleType: "band",
              label: "Year",
              valueFormatter: (v) => String(v),
            },
          ]}
          yAxis={[
            {
              label: "Days open",
              min: 0,
            },
          ]}
          margin={{ left: 64, right: 18, top: 24, bottom: 50 }}
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
        />
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

  // Per-month Sen's slope table shown under the precipitation chart. Each row
  // carries a red direction arrow, a diverging magnitude bar, and a colour-coded
  // significance pill.
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
              {precipTrendAdvanced ? (
                <>
                  Sen&rsquo;s slope (Theil&ndash;Sen) of monthly totals against year, with a
                  Mann&ndash;Kendall test for significance.
                </>
              ) : (
                <>
                  How much precipitation each month has gained or lost per year across this
                  station&rsquo;s record.
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
            <button
              type="button"
              aria-pressed={precipTrendAdvanced}
              title={
                precipTrendAdvanced
                  ? "Hide the statistical detail"
                  : "Show p-values and the statistical detail behind each trend"
              }
              className={`wrtdip-trend-adv-btn${precipTrendAdvanced ? " wrtdip-trend-adv-btn--active" : ""}`}
              onClick={() => setPrecipTrendAdvanced((v) => !v)}
            >
              <span className="wrtdip-trend-adv-btn__icon">{precipTrendAdvanced ? "▾" : "▸"}</span>
              Advanced
            </button>
          </div>
        </div>

        {strongest && (
          <div className="wrtdip-trend-panel__headline">
            Strongest signal:&nbsp;
            <strong>{strongest.name}</strong>
            <span className={`wrtdip-trend-arrow wrtdip-trend-arrow--${strongest.direction}`}>
              {strongest.direction === "increasing" ? "▲" : "▼"}
            </span>
            {strongest.sens_slope > 0 ? "+" : "−"}
            {Math.abs(strongest.sens_slope).toFixed(2)} mm/yr
            <span className="wrtdip-trend-panel__headline-note">
              ({(Math.abs(strongest.sens_slope) * 10).toFixed(1)} mm per decade)
            </span>
          </div>
        )}

        <div className="wrtdip-trend-table-wrap">
          <table className="wrtdip-trend-table">
            <thead>
              <tr>
                <th className="wrtdip-trend-table__th">Month</th>
                <th className="wrtdip-trend-table__th wrtdip-trend-table__th--num">
                  Sen&rsquo;s Slope (mm/yr)
                </th>
                <th className="wrtdip-trend-table__th">Significance</th>
                {precipTrendAdvanced && (
                  <th className="wrtdip-trend-table__th wrtdip-trend-table__th--num">p&#8209;value</th>
                )}
              </tr>
            </thead>
            <tbody>
              {months.map((m) => {
                const sig = PRECIP_SIG_STYLES[m.significance] || PRECIP_SIG_STYLES.none
                const slope = m.sens_slope
                const sigTrend = isSignificant(m)
                const pctW = slope == null ? 0 : (Math.abs(slope) / maxAbs) * 50
                return (
                  <tr
                    key={m.month}
                    className={`wrtdip-trend-table__row${inWindow(m.month) ? " wrtdip-trend-table__row--active" : ""}`}
                  >
                    <td className="wrtdip-trend-table__month">
                      <span
                        className={
                          `wrtdip-trend-arrow wrtdip-trend-arrow--${m.direction}` +
                          (sigTrend ? "" : " wrtdip-trend-arrow--weak")
                        }
                        title={
                          m.direction === "none"
                            ? "No change"
                            : `${m.direction === "increasing" ? "Increasing" : "Decreasing"} precipitation` +
                              (sigTrend ? "" : " (not statistically significant)")
                        }
                      >
                        {m.direction === "increasing" ? "▲" : m.direction === "decreasing" ? "▼" : "–"}
                      </span>
                      <span className="wrtdip-trend-table__month-name">{m.name}</span>
                    </td>
                    <td className="wrtdip-trend-table__slope">
                      <div className="wrtdip-trend-bar">
                        <span className="wrtdip-trend-bar__axis" />
                        {slope != null && (
                          <span
                            className={`wrtdip-trend-bar__fill wrtdip-trend-bar__fill--${m.direction}${sigTrend ? "" : " wrtdip-trend-bar__fill--weak"}`}
                            style={
                              slope >= 0
                                ? { left: "50%", width: `${pctW}%` }
                                : { right: "50%", width: `${pctW}%` }
                            }
                          />
                        )}
                      </div>
                      <span
                        className={
                          "wrtdip-trend-table__value" +
                          (sigTrend ? ` wrtdip-trend-table__value--strong wrtdip-trend-table__value--${m.direction}` : "")
                        }
                      >
                        {slope == null
                          ? "—"
                          : `${slope > 0 ? "+" : slope < 0 ? "−" : ""}${Math.abs(slope).toFixed(3)}`}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`wrtdip-sig-pill wrtdip-sig-pill--${m.significance}`}
                        title={`${sig.label} (${sig.short})`}
                      >
                        {sig.label}
                      </span>
                    </td>
                    {precipTrendAdvanced && (
                      <td className="wrtdip-trend-table__p">{fmtPValue(m.p)}</td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="wrtdip-trend-legend">
          <span className="wrtdip-trend-legend__item">
            <span className="wrtdip-trend-arrow wrtdip-trend-arrow--increasing">▲</span> getting wetter
          </span>
          <span className="wrtdip-trend-legend__item">
            <span className="wrtdip-trend-arrow wrtdip-trend-arrow--decreasing">▼</span> getting drier
          </span>
          <span className="wrtdip-trend-legend__sep" />
          {["very", "significant", "somewhat", "none"].map((k) => (
            <span key={k} className="wrtdip-trend-legend__item">
              <span className={`wrtdip-sig-dot wrtdip-sig-dot--${k}`} />
              {PRECIP_SIG_STYLES[k].label}
              {precipTrendAdvanced && <em>{PRECIP_SIG_STYLES[k].short}</em>}
            </span>
          ))}
        </div>
        <div className="wrtdip-trend-legend__note">
          Faded arrows mark months whose direction is not statistically significant.
          Highlighted rows are the months currently shown in the chart above.
        </div>
      </div>
    )
  }

  // Render the climate-trend statistics as stat tiles + a season timeline,
  // with the full numbers table behind a toggle (bottom section of the popup).
  const renderRoadStatsSection = () => {
    if (roadStatsLoading) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
          Loading statistics…
        </Typography>
      )
    }

    const open = roadStats?.open
    const close = roadStats?.close
    if (!roadStats?.matched || (!open && !close)) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
          Not enough historical data to compute trend statistics for this road.
        </Typography>
      )
    }

    const OPEN_COLOR = "#16a34a"
    const CLOSE_COLOR = "#dc2626"
    const INK = "#1e293b"
    const MUTED = "#64748b"

    const isSig = (s) => s && s.mk_p < 0.05
    // Long-term shift in days per decade, as a friendly rounded string.
    const perDecade = (slope) => {
      const v = Math.abs(slope * 10)
      return v >= 3 ? String(Math.round(v)) : v.toFixed(1)
    }

    // One headline tile: label + colored series dot, big value, small context
    // line, and an evidence chip. Text stays in ink; the dot carries identity.
    const Tile = ({ label, color, value, sub, chip, chipStrong }) => (
      <div
        style={{
          flex: "1 1 130px",
          minWidth: 130,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          padding: "10px 12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: MUTED }}>
          {color && (
            <span style={{ width: 8, height: 8, borderRadius: 4, background: color, flex: "0 0 auto" }} />
          )}
          {label}
        </div>
        <div style={{ fontSize: 19, fontWeight: 600, color: INK, lineHeight: 1.25, marginTop: 2 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>{sub}</div>}
        {chip && (
          <span
            style={{
              display: "inline-block",
              marginTop: 6,
              padding: "1px 8px",
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 600,
              color: chipStrong ? "#1e3a8a" : MUTED,
              background: chipStrong ? "#dbeafe" : "#f1f5f9",
              border: `1px solid ${chipStrong ? "#bfdbfe" : "#e2e8f0"}`,
            }}
          >
            {chip}
          </span>
        )}
      </div>
    )

    // Headline for a date series: the per-decade shift if the trend is real,
    // otherwise "no clear shift".
    const seriesTile = (label, color, s) => {
      if (!s) return <Tile label={label} color={color} value="No data" />
      if (!isSig(s)) {
        return (
          <Tile
            label={label}
            color={color}
            value="No clear shift"
            sub={`typically around ${s.avg_date}`}
            chip="steady so far"
          />
        )
      }
      const later = s.sens_slope > 0
      return (
        <Tile
          label={label}
          color={color}
          value={`${later ? "→" : "←"} ${perDecade(s.sens_slope)} days ${later ? "later" : "earlier"}`}
          sub={`per decade since ${s.first_year}`}
          chip={`strong evidence (${fmtP(s.mk_p)})`}
          chipStrong
        />
      )
    }

    // Derived season-length tile from the two slopes.
    const seasonTile = () => {
      if (!open || !close) return null
      const changePerDecade = (close.sens_slope - open.sens_slope) * 10
      const avgLen = Math.round(close.avg_dos - open.avg_dos)
      if (Math.abs(changePerDecade) < 1) {
        return <Tile label="Season length" value="Holding steady" sub={`≈ ${avgLen} days on average`} />
      }
      const shrinking = changePerDecade < 0
      return (
        <Tile
          label="Season length"
          value={`${Math.round(Math.abs(changePerDecade))} days ${shrinking ? "shorter" : "longer"}`}
          sub={`per decade · ≈ ${avgLen} days on average`}
          chip={shrinking ? "season is shrinking" : "season is growing"}
          chipStrong={isSig(open) || isSig(close)}
        />
      )
    }

    // Season timeline: opening and closing windows (earliest → latest, with an
    // average marker) on a shared Aug-to-July day-of-season scale, joined by a
    // band showing the typical open season.
    const seasonStrip = () => {
      if (!open || !close) return null
      const lo = open.earliest_dos - 10
      const hi = close.latest_dos + 10
      const pct = (v) => ((v - lo) / (hi - lo)) * 100
      const band = (s, color) => (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: `${pct(s.earliest_dos)}%`,
            width: `${Math.max(pct(s.latest_dos) - pct(s.earliest_dos), 1)}%`,
            height: 8,
            borderRadius: 4,
            background: color,
            opacity: 0.3,
          }}
        />
      )
      const avgDot = (s, color) => (
        <div
          style={{
            position: "absolute",
            top: 11,
            left: `${pct(s.avg_dos)}%`,
            width: 10,
            height: 10,
            borderRadius: 5,
            background: color,
            border: "2px solid #fff",
            transform: "translateX(-50%)",
            boxShadow: "0 0 0 1px rgba(15,23,42,0.15)",
          }}
        />
      )
      return (
        <div style={{ marginTop: 12 }}>
          <div style={{ position: "relative", height: 40 }}>
            {/* typical open season between the two average dates */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: `${pct(open.avg_dos)}%`,
                width: `${pct(close.avg_dos) - pct(open.avg_dos)}%`,
                height: 4,
                background: "#cbd5e1",
              }}
            />
            {band(open, OPEN_COLOR)}
            {band(close, CLOSE_COLOR)}
            {avgDot(open, OPEN_COLOR)}
            {avgDot(close, CLOSE_COLOR)}
            <span
              style={{
                position: "absolute",
                top: 26,
                left: `${(pct(open.avg_dos) + pct(close.avg_dos)) / 2}%`,
                transform: "translateX(-50%)",
                fontSize: 10,
                color: MUTED,
                whiteSpace: "nowrap",
              }}
            >
              ≈ {Math.round(close.avg_dos - open.avg_dos)} days open
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 4 }}>
            <span style={{ fontSize: 11, color: MUTED, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: OPEN_COLOR }} />
              Opens {open.earliest_date} – {open.latest_date} (usually {open.avg_date})
            </span>
            <span style={{ fontSize: 11, color: MUTED, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: CLOSE_COLOR }} />
              Closes {close.earliest_date} – {close.latest_date} (usually {close.avg_date})
            </span>
          </div>
        </div>
      )
    }

    // One short plain-language takeaway built from the numbers.
    let takeaway
    if (isSig(open) && open.sens_slope > 0 && close && !isSig(close)) {
      takeaway = `The season is being squeezed at the freeze-up end: the road now opens about ${perDecade(open.sens_slope)} days later each decade, while spring closing dates have barely moved. That points to warmer early winters — the ice takes longer to get thick enough for traffic.`
    } else if (isSig(open) && isSig(close) && open.sens_slope > 0 && close.sens_slope < 0) {
      takeaway = `The season is shrinking from both ends — opening about ${perDecade(open.sens_slope)} days later and closing about ${perDecade(close.sens_slope)} days earlier each decade — consistent with warmer winters overall.`
    } else if (!isSig(open) && (!close || !isSig(close))) {
      takeaway = "So far, neither the opening nor the closing dates show a clear long-term shift for this road — the year-to-year swings are bigger than any steady trend."
    } else {
      const parts = []
      if (isSig(open)) parts.push(`openings have shifted about ${perDecade(open.sens_slope)} days ${open.sens_slope > 0 ? "later" : "earlier"} per decade`)
      if (isSig(close)) parts.push(`closings about ${perDecade(close.sens_slope)} days ${close.sens_slope > 0 ? "later" : "earlier"} per decade`)
      takeaway = `Over this record, ${parts.join(" and ")} — a signal of changing winter conditions.`
    }

    const detailRows = [
      ["Seasons on record", (s) => `${s.n} (${s.first_year}–${s.last_year})`],
      ["Average date", (s) => s.avg_date],
      ["Earliest date", (s) => s.earliest_date],
      ["Latest date", (s) => s.latest_date],
      ["Year-to-year variability (SD)", (s) => `± ${s.sd_days} days`],
      ["Sen's slope", (s) => `${s.sens_slope > 0 ? "+" : ""}${s.sens_slope.toFixed(2)} days/year`],
      ["Mann-Kendall trend", (s) => `${s.mk_trend} (${fmtP(s.mk_p)})`],
      ["Pearson's r vs year", (s) => `${s.pearson_r.toFixed(2)} (${fmtP(s.pearson_p)})`],
    ]
    const cellStyle = { padding: "4px 8px", borderBottom: "1px solid #e2e8f0", fontSize: 12 }

    return (
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {seriesTile("Opening date", OPEN_COLOR, open)}
          {seriesTile("Closing date", CLOSE_COLOR, close)}
          {seasonTile()}
        </div>
        {seasonStrip()}
        <Typography variant="body2" sx={{ fontSize: 12, color: "#334155", mt: 1.5 }}>
          {takeaway}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75, lineHeight: 1.5 }}>
          Dates naturally bounce around from year to year — the “per decade” numbers are the slow,
          steady shift underneath that. “Strong evidence” means the shift is too consistent to be
          chance.
        </Typography>
        <button
          type="button"
          onClick={() => setRoadStatsDetail((d) => !d)}
          style={{
            marginTop: 8,
            padding: 0,
            border: "none",
            background: "none",
            fontSize: 11.5,
            fontWeight: 600,
            color: "#2563eb",
            cursor: "pointer",
          }}
        >
          {roadStatsDetail ? "Hide detailed statistics ▴" : "Show detailed statistics ▾"}
        </button>
        {roadStatsDetail && (
          <div style={{ overflowX: "auto", marginTop: 6 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...cellStyle, textAlign: "left", color: "#475569" }}>Statistic</th>
                  <th style={{ ...cellStyle, textAlign: "right", color: "#475569" }}>Opening</th>
                  <th style={{ ...cellStyle, textAlign: "right", color: "#475569" }}>Closing</th>
                </tr>
              </thead>
              <tbody>
                {detailRows.map(([label, fmt]) => (
                  <tr key={label}>
                    <td style={{ ...cellStyle, color: "#475569" }}>{label}</td>
                    <td style={{ ...cellStyle, textAlign: "right", fontWeight: 600 }}>
                      {open ? fmt(open) : "—"}
                    </td>
                    <td style={{ ...cellStyle, textAlign: "right", fontWeight: 600 }}>
                      {close ? fmt(close) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

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
        // Keep the current resolution if the station has it, else fall back to
        // whatever it does have (some stations are monthly-only).
        setPrecipResolution((prev) =>
          sources.some((s) => s.resolution === prev)
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
  const fddPinchRef = usePinchZoomYears(
    fddViewRange,
    setFddViewRange,
    fddAllYears[0],
    fddAllYears[fddAllYears.length - 1],
    { range: fddYRange, setRange: setFddYRange, min: fddYBounds.min, max: fddYBounds.max }
  )

  /**
   * Function to close the modal.
   */
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
    setPrecipTrendAdvanced(false)
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

  function generateChart() {
    if (fddLoading) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          Loading FDD data...
        </Typography>
      )
    }
    // Only stations with enough seasons of data get plotted; the rest would
    // render as one or two floating dots.
    const chartSeries = fddSeries.filter((s) => s.years.length >= MIN_GRAPH_POINTS)
    if (fddSeries.length > 0 && chartSeries.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          Not enough data points.
        </Typography>
      )
    }
    if (chartSeries.length > 0) {
      // Only keep LOWESS curves for stations that are actually plotted.
      const chartLowess = lowessSeries.filter((ls) =>
        chartSeries.some((s) => s.stationId === ls.stationId)
      )
      // Combine all years from all series for the x-axis
      const allYears = [...new Set(chartSeries.flatMap((s) => s.years))].sort((a, b) => a - b)

      // Filter by view range
      const filteredYears = allYears.filter((y) => y >= fddViewRange[0] && y <= fddViewRange[1])
      const dataMin = allYears[0]
      const dataMax = allYears[allYears.length - 1]

      const colors = ["#2563eb", "#dc2626", "#16a34a", "#ea580c", "#7c3aed", "#0891b2"]
      const lowessColors = ["#f59e0b", "#9333ea", "#0d9488", "#e11d48", "#1d4ed8", "#78716c"]
      const cityName = getCityName()
      // Use an area fill only when a single station is shown (cleaner with one line)
      const singleSeries = chartSeries.length === 1
      const series = chartSeries.map((s, idx) => {
        // Align data to the filtered x-axis (null for missing years)
        const yearMap = {}
        s.years.forEach((y, i) => { yearMap[y] = s.fdds[i] })
        const alignedData = filteredYears.map((y) => yearMap[y] ?? null)
        // Show just the city name by default; full station name in advanced mode
        const displayLabel = showAdvanced ? s.stationName : (cityName || s.stationName)
        return {
          id: `fdd-${s.stationId}`,
          data: alignedData,
          color: colors[idx % colors.length],
          showMark: false,
          curve: "monotoneX",
          label: displayLabel,
          connectNulls: true,
          area: singleSeries,
          valueFormatter: (v) => (v == null ? "No data" : `${Math.round(v)} °C·days`),
        }
      })

      // Add LOWESS trend lines if enabled
      if (showLowess && chartLowess.length > 0) {
        chartLowess.forEach((ls, idx) => {
          const yearMap = {}
          ls.years.forEach((y, i) => { yearMap[y] = ls.fdds[i] })
          const alignedData = filteredYears.map((y) => yearMap[y] ?? null)
          const matchingStation = chartSeries.find((s) => s.stationId === ls.stationId)
          const baseName = showAdvanced ? (matchingStation?.stationName || `Station ${ls.stationId}`) : (cityName || matchingStation?.stationName || `Station ${ls.stationId}`)
          const label = `${baseName} (LOWESS)`
          series.push({
            id: `lowess-${ls.stationId}`,
            data: alignedData,
            color: lowessColors[idx % lowessColors.length],
            showMark: false,
            curve: "monotoneX",
            label,
            connectNulls: true,
            valueFormatter: (v) => (v == null ? "" : `${Math.round(v)} °C·days`),
          })
        })
      }

      // Build per-series styling: thick smooth data lines, dashed LOWESS trend lines,
      // and a soft gradient fill under a single-station line for a modern look.
      const chartSx = {
        [`.${lineElementClasses.root}`]: {
          strokeWidth: 2.5,
          strokeLinecap: "round",
        },
        [`.${areaElementClasses.root}`]: {
          fillOpacity: 0.12,
        },
      }
      if (showLowess && chartLowess.length > 0) {
        chartLowess.forEach((ls) => {
          chartSx[`.MuiLineElement-series-lowess-${ls.stationId}`] = {
            strokeWidth: 2,
            strokeDasharray: "6 5",
          }
        })
      }

      const chartHeight = chartSeries.length > 1 ? 300 : 260


      return (
        <div>
          <YearRangeSlider
            value={fddViewRange}
            onChange={setFddViewRange}
            min={dataMin}
            max={dataMax}
          />
          <YearRangeSlider
            value={fddYRange}
            onChange={setFddYRange}
            min={fddYBounds.min}
            max={fddYBounds.max}
            label="FDD Range (°C·days)"
          />
          <div ref={fddPinchRef} style={{ touchAction: "none", overflow: "hidden" }}>
            {filteredYears.length > 0 ? (
              <LineChart
                xAxis={[
                  {
                    data: filteredYears,
                    valueFormatter: (year) => year.toString(),
                    label: "Year",
                    tickMinStep: 1,
                  },
                ]}
                yAxis={[
                  {
                    min: fddYRange[0],
                    max: fddYRange[1],
                    label: "Freezing Degree Days (°C·days)",
                    labelStyle: { transform: "rotate(270deg) translate(-94px, -176px)" },
                  },
                ]}
                series={series}
                height={chartHeight}
                margin={{ left: 95, right: 20, top: 10, bottom: 50 }}
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
                sx={chartSx}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                No data in the selected year range.
              </Typography>
            )}
          </div>
          {isMobile && (
            <p style={{ textAlign: "center", fontSize: "0.7rem", color: "#888", margin: "4px 0 0" }}>
              Pinch to zoom · Swipe to pan
            </p>
          )}
          {(chartSeries.length > 1 || (showLowess && chartLowess.length > 0)) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", padding: "8px 0" }}>
              {chartSeries.map((s, idx) => {
                const displayLabel = showAdvanced ? s.stationName : (cityName || s.stationName)
                return (
                  <div key={s.stationId} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem" }}>
                    <span style={{ width: 14, height: 3, backgroundColor: colors[idx % colors.length], display: "inline-block", borderRadius: 2 }} />
                    <span>{displayLabel}</span>
                  </div>
                )
              })}
              {showLowess && chartLowess.map((ls, idx) => {
                const matchingStation = chartSeries.find((s) => s.stationId === ls.stationId)
                const baseName = showAdvanced ? (matchingStation?.stationName || `Station ${ls.stationId}`) : (cityName || matchingStation?.stationName || `Station ${ls.stationId}`)
                const label = `${baseName} (LOWESS)`
                return (
                  <div key={`lowess-${ls.stationId}`} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem" }}>
                    <span style={{ width: 14, height: 0, borderTop: `2px dashed ${lowessColors[idx % lowessColors.length]}`, display: "inline-block" }} />
                    <span>{label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    } else {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          No FDDs data available for this location.
        </Typography>
      )
    }
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
    <div style={{ height: "84vh", border: "none" }} ref={MapElement}>
      <div id="legend-container"></div>
      <div id="layer-list-container"></div>

      {/* Custom feature popup (replaces ArcGIS native popup) */}
      {featurePopup && (() => {
        const isRoadPopup = ROAD_CLOSURE_LAYERS.includes(featurePopup.layerTitle)
        const enlarged = isRoadPopup && roadPopupEnlarged
        const containerWidth = MapElement.current?.clientWidth || 600
        // Popup is centered on `left` via translateX(-50%), so keep its half
        // width inside the map bounds.
        const popupWidth = isRoadPopup ? Math.min(560, containerWidth - 32) : 280
        const half = popupWidth / 2
        const clampedLeft = Math.max(half + 8, Math.min(featurePopup.screenX, containerWidth - half - 8))
        return (
        <div
          className={`wrtdip-feature-popup${isRoadPopup ? " wrtdip-feature-popup--wide" : ""}${enlarged ? " wrtdip-feature-popup--enlarged" : ""}`}
          style={enlarged ? {} : {
            left: clampedLeft,
            top: Math.max(featurePopup.screenY - 10, 10),
          }}
        >
          <div className="wrtdip-feature-popup__header">
            <div className="wrtdip-feature-popup__header-text">
              {featurePopup.layerTitle && (
                <span className="wrtdip-feature-popup__layer-tag">{featurePopup.layerTitle}</span>
              )}
              <span className="wrtdip-feature-popup__title">{featurePopup.title || "Feature"}</span>
            </div>
            {isRoadPopup && (
              <button
                className="wrtdip-feature-popup__close"
                onClick={() => setRoadPopupEnlarged((e) => !e)}
                aria-label={enlarged ? "Shrink" : "Enlarge"}
                title={enlarged ? "Shrink" : "Enlarge"}
              >
                {enlarged ? <CloseFullscreenIcon style={{ fontSize: 14 }} /> : <OpenInFullIcon style={{ fontSize: 14 }} />}
              </button>
            )}
            <button
              className="wrtdip-feature-popup__close"
              onClick={() => { setFeaturePopup(null); setRoadPopupEnlarged(false) }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          {isRoadPopup ? (
            <div className="wrtdip-feature-popup__body">
              <div className="wrtdip-popup-section">
                <div className="wrtdip-popup-section__header wrtdip-popup-section__header--static">
                  <span className="wrtdip-popup-section__title">Details</span>
                </div>
                {featurePopup.content && (
                  <div
                    className="wrtdip-popup-section__content"
                    dangerouslySetInnerHTML={{ __html: featurePopup.content }}
                  />
                )}
              </div>
              <div className="wrtdip-popup-section">
                <button
                  type="button"
                  className="wrtdip-popup-section__header"
                  onClick={() => setRoadTrendCollapsed((c) => !c)}
                  aria-expanded={!roadTrendCollapsed}
                >
                  <span className="wrtdip-popup-section__title">Open/Close Trend</span>
                  <span className={`wrtdip-popup-section__caret${roadTrendCollapsed ? "" : " wrtdip-popup-section__caret--open"}`}>
                    ▾
                  </span>
                </button>
                {!roadTrendCollapsed && (
                  <div className="wrtdip-popup-section__content">
                    {renderRoadTrendChart(enlarged ? 420 : 320)}
                  </div>
                )}
              </div>
              <div className="wrtdip-popup-section">
                <button
                  type="button"
                  className="wrtdip-popup-section__header"
                  onClick={() => setRoadDurationCollapsed((c) => !c)}
                  aria-expanded={!roadDurationCollapsed}
                >
                  <span className="wrtdip-popup-section__title">Open Duration per Year</span>
                  <span className={`wrtdip-popup-section__caret${roadDurationCollapsed ? "" : " wrtdip-popup-section__caret--open"}`}>
                    ▾
                  </span>
                </button>
                {!roadDurationCollapsed && (
                  <div className="wrtdip-popup-section__content">
                    {renderRoadDurationChart(enlarged ? 420 : 320)}
                  </div>
                )}
              </div>
              <div className="wrtdip-popup-section">
                <button
                  type="button"
                  className="wrtdip-popup-section__header"
                  onClick={() => setRoadStatsCollapsed((c) => !c)}
                  aria-expanded={!roadStatsCollapsed}
                >
                  <span className="wrtdip-popup-section__title">Climate Trend Statistics</span>
                  <span className={`wrtdip-popup-section__caret${roadStatsCollapsed ? "" : " wrtdip-popup-section__caret--open"}`}>
                    ▾
                  </span>
                </button>
                {!roadStatsCollapsed && (
                  <div className="wrtdip-popup-section__content">
                    {renderRoadStatsSection()}
                  </div>
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
        centered={!modalEnlarge}
        dialogClassName={
          modalEnlarge ? "wrtdip-map-modal wrtdip-map-modal--enlarged" : "wrtdip-map-modal"
        }
        contentClassName="wrtdip-map-modal__content"
        backdropClassName="wrtdip-map-modal__backdrop"
      >
        <Modal.Header className="wrtdip-map-modal__header">
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1, letterSpacing: 1 }}>
              Climate &amp; Weather
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              sx={{ color: "#fff", fontWeight: 600, lineHeight: 1.2, mt: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {getCityName() || "Selected Location"}
            </Typography>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <IconButton
              onClick={() => setModalEnlarge(!modalEnlarge)}
              size="small"
              sx={{ color: "#fff" }}
              aria-label={modalEnlarge ? "Shrink" : "Enlarge"}
            >
              {modalEnlarge ? <CloseFullscreenIcon fontSize="small" /> : <OpenInFullIcon fontSize="small" />}
            </IconButton>
            <IconButton
              onClick={closeModal}
              size="small"
              sx={{ color: "#fff" }}
              aria-label="Close"
            >
              <span style={{ fontSize: 20, lineHeight: 1, fontWeight: 300 }}>×</span>
            </IconButton>
          </div>
        </Modal.Header>
        <Modal.Body className="wrtdip-map-modal__body">
          {/* Sticky short-record warning: stays pinned while the user scrolls
              so it can't be missed when reading the graphs. Wording is a
              placeholder — final text to be confirmed with Yukari. */}
          {showShortRecordBanner && (
            <div className="wrtdip-short-record-banner" role="alert">
              <span className="wrtdip-short-record-banner__icon" aria-hidden="true">⚠️</span>
              <span>
                <strong>Limited data:</strong> this station has only{" "}
                {fddRecordYears} usable {fddRecordYears === 1 ? "season" : "seasons"} of
                records — fewer than the {SHORT_RECORD_YEARS} years needed to reliably
                assess long-term climate trends. Interpret these graphs with caution.
              </span>
            </div>
          )}
          <div className="wrtdip-map-modal__data-badge">
            <Typography variant="caption" sx={{ display: "block", lineHeight: 1.4 }}>
              Datasource from <strong>CanHomT V4</strong>, Canada's gold-standard climate record. It's carefully corrected for station moves and equipment changes, so you get the most accurate picture of how the climate is changing.
            </Typography>
          </div>
          <section className="wrtdip-map-modal__section">
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
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`wrtdip-toggle-btn${showAdvanced ? " wrtdip-toggle-btn--active" : ""}`}
              >
                <span className="wrtdip-toggle-btn__icon">{showAdvanced ? "▾" : "▸"}</span>
                Advanced Options
              </button>
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

          <section className="wrtdip-map-modal__section">
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
                  <label className="wrtdip-precip-control">
                    <span className="wrtdip-precip-control__label">Dataset</span>
                    <select
                      className="wrtdip-precip-select"
                      value={precipSources.length > 0 ? "canhomp-v2" : ""}
                      onChange={() => {}}
                      disabled={precipSources.length === 0}
                    >
                      {precipSources.length > 0 ? (
                        <option value="canhomp-v2">CanHomP V2 (Homogenized Precipitation)</option>
                      ) : (
                        <option value="">No dataset for this station</option>
                      )}
                    </select>
                  </label>
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
                  {precipLoading ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                      Loading precipitation data...
                    </Typography>
                  ) : precipData && precipData.labels.length > 0 ? (
                    <div>
                      <div className="wrtdip-series-toggles">
                        <label className={`wrtdip-series-toggle${precipShowMax ? " wrtdip-series-toggle--on" : ""}`}>
                          <input
                            type="checkbox"
                            className="wrtdip-series-toggle__input"
                            checked={precipShowMax}
                            onChange={(e) => setPrecipShowMax(e.target.checked)}
                          />
                          <span className="wrtdip-series-toggle__dot" style={{ background: "#e53935" }} />
                          Max
                        </label>
                        <label className={`wrtdip-series-toggle${precipShowAvg ? " wrtdip-series-toggle--on" : ""}`}>
                          <input
                            type="checkbox"
                            className="wrtdip-series-toggle__input"
                            checked={precipShowAvg}
                            onChange={(e) => setPrecipShowAvg(e.target.checked)}
                          />
                          <span className="wrtdip-series-toggle__dot" style={{ background: "#42a5f5" }} />
                          Avg
                        </label>
                        <label className={`wrtdip-series-toggle${precipShowMin ? " wrtdip-series-toggle--on" : ""}`}>
                          <input
                            type="checkbox"
                            className="wrtdip-series-toggle__input"
                            checked={precipShowMin}
                            onChange={(e) => setPrecipShowMin(e.target.checked)}
                          />
                          <span className="wrtdip-series-toggle__dot" style={{ background: "#66bb6a" }} />
                          Min
                        </label>
                      </div>
                      <BarChart
                        xAxis={[{
                          data: precipData.labels,
                          label: precipResolution === "monthly" ? "Month" : "Date",
                          scaleType: "band",
                          ...PRECIP_BAR_GAPS[precipResolution],
                        }]}
                        yAxis={[{ label: "Precipitation (mm)" }]}
                        series={[
                          ...(precipShowMax ? [{ data: precipData.maxs, label: "Max", color: "#e53935" }] : []),
                          ...(precipShowAvg ? [{ data: precipData.avgs, label: "Avg", color: "#42a5f5" }] : []),
                          ...(precipShowMin ? [{ data: precipData.mins, label: "Min", color: "#66bb6a" }] : []),
                        ]}
                        height={240}
                        margin={{ left: 50, right: 10, top: 10, bottom: 40 }}
                        grid={{ horizontal: true }}
                      />
                    </div>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                      No CanHomP V2 precipitation data available for this location.
                    </Typography>
                  )}
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
                  {snowfallLoading ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                      Loading snowfall data...
                    </Typography>
                  ) : snowfallData && snowfallData.labels.length > 0 ? (
                    <div>
                      <div className="wrtdip-series-toggles">
                        <label className={`wrtdip-series-toggle${snowShowMax ? " wrtdip-series-toggle--on" : ""}`}>
                          <input
                            type="checkbox"
                            className="wrtdip-series-toggle__input"
                            checked={snowShowMax}
                            onChange={(e) => setSnowShowMax(e.target.checked)}
                          />
                          <span className="wrtdip-series-toggle__dot" style={{ background: "#e53935" }} />
                          Max
                        </label>
                        <label className={`wrtdip-series-toggle${snowShowAvg ? " wrtdip-series-toggle--on" : ""}`}>
                          <input
                            type="checkbox"
                            className="wrtdip-series-toggle__input"
                            checked={snowShowAvg}
                            onChange={(e) => setSnowShowAvg(e.target.checked)}
                          />
                          <span className="wrtdip-series-toggle__dot" style={{ background: "#42a5f5" }} />
                          Avg
                        </label>
                        <label className={`wrtdip-series-toggle${snowShowMin ? " wrtdip-series-toggle--on" : ""}`}>
                          <input
                            type="checkbox"
                            className="wrtdip-series-toggle__input"
                            checked={snowShowMin}
                            onChange={(e) => setSnowShowMin(e.target.checked)}
                          />
                          <span className="wrtdip-series-toggle__dot" style={{ background: "#66bb6a" }} />
                          Min
                        </label>
                      </div>
                      <BarChart
                        xAxis={[{ data: snowfallData.labels, label: "Date", scaleType: "band" }]}
                        yAxis={[{ label: "Snowfall (cm)" }]}
                        series={[
                          ...(snowShowMax ? [{ data: snowfallData.maxs, label: "Max", color: "#e53935" }] : []),
                          ...(snowShowAvg ? [{ data: snowfallData.avgs, label: "Avg", color: "#42a5f5" }] : []),
                          ...(snowShowMin ? [{ data: snowfallData.mins, label: "Min", color: "#66bb6a" }] : []),
                        ]}
                        height={240}
                        margin={{ left: 50, right: 10, top: 10, bottom: 40 }}
                        grid={{ horizontal: true }}
                      />
                    </div>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                      No snowfall data available for this location.
                    </Typography>
                  )}
                </div>
              </>
            )}
          </section>

          <section className="wrtdip-map-modal__section">
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
                <div>
                  <div className="wrtdip-series-toggles">
                    <label className={`wrtdip-series-toggle${tempShowMax ? " wrtdip-series-toggle--on" : ""}`}>
                      <input
                        type="checkbox"
                        className="wrtdip-series-toggle__input"
                        checked={tempShowMax}
                        onChange={(e) => setTempShowMax(e.target.checked)}
                      />
                      <span className="wrtdip-series-toggle__dot" style={{ background: "#e53935" }} />
                      Max
                    </label>
                    <label className={`wrtdip-series-toggle${tempShowAvg ? " wrtdip-series-toggle--on" : ""}`}>
                      <input
                        type="checkbox"
                        className="wrtdip-series-toggle__input"
                        checked={tempShowAvg}
                        onChange={(e) => setTempShowAvg(e.target.checked)}
                      />
                      <span className="wrtdip-series-toggle__dot" style={{ background: "#42a5f5" }} />
                      Avg
                    </label>
                    <label className={`wrtdip-series-toggle${tempShowMin ? " wrtdip-series-toggle--on" : ""}`}>
                      <input
                        type="checkbox"
                        className="wrtdip-series-toggle__input"
                        checked={tempShowMin}
                        onChange={(e) => setTempShowMin(e.target.checked)}
                      />
                      <span className="wrtdip-series-toggle__dot" style={{ background: "#66bb6a" }} />
                      Min
                    </label>
                  </div>
                  <BarChart
                    xAxis={[{ data: tempData.labels, label: "Date", scaleType: "band" }]}
                    yAxis={[{ label: "Temperature (°C)" }]}
                    series={[
                      ...(tempShowMax ? [{ data: tempData.maxs, label: "Max", color: "#e53935" }] : []),
                      ...(tempShowAvg ? [{ data: tempData.avgs, label: "Avg", color: "#42a5f5" }] : []),
                      ...(tempShowMin ? [{ data: tempData.mins, label: "Min", color: "#66bb6a" }] : []),
                    ]}
                    height={240}
                    margin={{ left: 50, right: 10, top: 10, bottom: 40 }}
                    grid={{ horizontal: true }}
                  />
                </div>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                  No temperature data available for this location.
                </Typography>
              )}
            </div>
          </section>

          <section className="wrtdip-map-modal__section">
            <Typography variant="subtitle1" className="wrtdip-map-modal__section-title">
              3-Day Weather Forecast
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
              Current conditions and outlook for the next 3 days
            </Typography>
            <ForecastPanel lat={lat} lon={lon} />
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

         console.log("Get Climate City", getClimateCity("ON-1"))

        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.register("service-worker.js")
        }

        // Esri Canada "Canada Basemap" (topographic) — includes niche and
        // First Nations roads missing from the default streets basemap.
        // Replicates webmap 98652eb8458a464fa95feb9bd812b29a.
        const canadaTopoBasemap = new Basemap({
          title: "Canada Topographic",
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

        const map = new Map({ basemap: canadaTopoBasemap })

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
      outFields: ["*"],
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
        let activeBasemapId = "topographic"
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
