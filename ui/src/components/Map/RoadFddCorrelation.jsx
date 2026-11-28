import { useMemo } from "react"
import { ResponsiveChartContainer } from "@mui/x-charts/ResponsiveChartContainer"
import { ScatterPlot } from "@mui/x-charts/ScatterChart"
import { LinePlot } from "@mui/x-charts/LineChart"
import { ChartsXAxis } from "@mui/x-charts/ChartsXAxis"
import { ChartsYAxis } from "@mui/x-charts/ChartsYAxis"
import { ChartsGrid } from "@mui/x-charts/ChartsGrid"
import { ChartsTooltip } from "@mui/x-charts/ChartsTooltip"
import { Typography } from "@mui/material"
import roadFddOpening from "./roadFddOpening.json"

// Early-winter freezing degree days (Oct 1 to Dec 31) against the date each
// winter road opened, one point per season. The data is precomputed by
// ui/scripts/build-road-fdd.mjs from the portal API.

const POINT_COLOR = "#0ea5e9"
const LINE_COLOR = "#1e293b"
const SEASON_BASE_MS = Date.UTC(2001, 7, 1) // Aug 1, the start of a season

const STATUS_MESSAGES = {
  "no-closure-records": "No opening records are available for this road.",
  "too-few-openings": "Too few recorded openings to estimate a relationship.",
  "too-few-fdd-seasons": "Too few seasons with complete temperature records near this road.",
  error: "The FDD comparison could not be computed for this road.",
}

const openDayLabel = (day) =>
  new Date(SEASON_BASE_MS + day * 86400000).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })

const seasonLabel = (season) => `${season}–${String((season + 1) % 100).padStart(2, "0")}`

const formatP = (p) => (p < 0.001 ? "< 0.001" : p.toFixed(3))

const strengthOf = (rho) => {
  const size = Math.abs(rho)
  if (size < 0.1) return "None"
  if (size < 0.3) return "Weak"
  if (size < 0.5) return "Moderate"
  return "Strong"
}

const summaryOf = (road) => {
  const { rho, p } = road.spearman
  const days = Math.abs(road.slopeDaysPer100Fdd).toFixed(1)
  if (p >= 0.05) {
    return "No clear relationship in this record: colder early winters did not reliably bring earlier openings."
  }
  if (rho < 0) {
    return `Colder early winters were followed by earlier openings, about ${days} days earlier for every additional 100 °C·days.`
  }
  return `Colder early winters were followed by later openings, about ${days} days later for every additional 100 °C·days.`
}

const RoadFddCorrelation = ({ roadName, height = 320 }) => {
  const road = roadName ? roadFddOpening.roads[roadName] : undefined

  const chart = useMemo(() => {
    if (!road || road.status !== "ok") return null
    const xs = road.points.map((pt) => pt.fdd)
    const ys = road.points.map((pt) => pt.openDay)
    const xMin = Math.floor((Math.min(...xs) - 40) / 100) * 100
    const xMax = Math.ceil((Math.max(...xs) + 40) / 100) * 100
    const slope = road.slopeDaysPer100Fdd / 100
    const fitAt = (x) => road.intercept + slope * x
    const yMin = Math.floor(Math.min(...ys, fitAt(xMin), fitAt(xMax)) - 5)
    const yMax = Math.ceil(Math.max(...ys, fitAt(xMin), fitAt(xMax)) + 5)
    const bySeason = Object.fromEntries(road.points.map((pt) => [pt.season, pt]))
    return {
      xAxis: [{ id: "fdd", data: [xMin, xMax], scaleType: "linear", min: xMin, max: xMax, label: "Oct–Dec FDD (°C·days)" }],
      yAxis: [{ id: "open", min: yMin, max: yMax, valueFormatter: openDayLabel }],
      series: [
        {
          type: "scatter",
          id: "seasons",
          label: "Season",
          color: POINT_COLOR,
          markerSize: 4,
          data: road.points.map((pt) => ({ id: pt.season, x: pt.fdd, y: pt.openDay })),
          valueFormatter: (value) => {
            const pt = bySeason[value.id]
            return `${seasonLabel(pt.season)}: ${Math.round(pt.fdd)} °C·days, opened ${openDayLabel(pt.openDay)}`
          },
        },
        {
          type: "line",
          id: "fit",
          label: "Fitted trend",
          color: LINE_COLOR,
          data: [fitAt(xMin), fitAt(xMax)],
          showMark: false,
        },
      ],
    }
  }, [road])

  if (!road || road.status !== "ok") {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
        {STATUS_MESSAGES[road?.status] || "No FDD comparison is available for this road."}
      </Typography>
    )
  }

  const { rho, p } = road.spearman
  const [firstSeason, lastSeason] = road.seasonRange

  return (
    <div className="wrtdip-road-fdd">
      <p className="wrtdip-road-fdd__summary">{summaryOf(road)}</p>
      <dl className="wrtdip-road-fdd__stats">
        <div>
          <dt>Spearman ρ</dt>
          <dd>{rho.toFixed(2)}</dd>
        </div>
        <div>
          <dt>p-value</dt>
          <dd>{formatP(p)}</dd>
        </div>
        <div>
          <dt>Strength</dt>
          <dd>{strengthOf(rho)}{p < 0.05 ? ", significant" : ""}</dd>
        </div>
        <div>
          <dt>Days per 100 °C·days</dt>
          <dd>{road.slopeDaysPer100Fdd > 0 ? "+" : ""}{road.slopeDaysPer100Fdd.toFixed(1)}</dd>
        </div>
      </dl>
      <div className="wrtdip-road-fdd__chart" style={{ height }}>
        <ResponsiveChartContainer
          xAxis={chart.xAxis}
          yAxis={chart.yAxis}
          series={chart.series}
          margin={{ top: 12, right: 16, bottom: 52, left: 60 }}
        >
          <ChartsGrid horizontal vertical />
          <LinePlot />
          <ScatterPlot />
          <ChartsXAxis axisId="fdd" />
          <ChartsYAxis axisId="open" />
          {/* Lift the tooltip above the road popup (z-index 5000/6000). */}
          <ChartsTooltip trigger="item" slotProps={{ popper: { sx: { zIndex: 7000 } } }} />
        </ResponsiveChartContainer>
      </div>
      <p className="wrtdip-road-fdd__note">
        Each point is one season ({road.n} seasons, {seasonLabel(firstSeason)} to {seasonLabel(lastSeason)}).
        FDD is summed from October 1 to December 31 at {road.station.name} ({road.station.distanceKm} km from the
        road). The line is a Theil–Sen fit. Openings also depend on snow cover, ice testing and operations, so
        this shows association, not cause.
      </p>
    </div>
  )
}

export default RoadFddCorrelation
