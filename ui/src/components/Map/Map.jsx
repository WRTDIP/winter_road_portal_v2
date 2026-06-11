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
          const openLabel = d.open_predicted ? "Predicted Opening" : "Opening"
          const closeLabel = d.close_predicted ? "Predicted Closure" : "Closure"
          html =
            `<div data-road-forecast>` +
            `<b>${openLabel} (${d.season}):</b> ${open || "N/A"}<br>` +
            `<b>${closeLabel} (${d.season}):</b> ${close || "N/A"}<br>` +
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
    if (fddSeries.length > 0) {
      // Combine all years from all series for the x-axis
      const allYears = [...new Set(fddSeries.flatMap((s) => s.years))].sort((a, b) => a - b)

      // Filter by view range
      const filteredYears = allYears.filter((y) => y >= fddViewRange[0] && y <= fddViewRange[1])
      const dataMin = allYears[0]
      const dataMax = allYears[allYears.length - 1]

      const colors = ["#2563eb", "#dc2626", "#16a34a", "#ea580c", "#7c3aed", "#0891b2"]
      const lowessColors = ["#f59e0b", "#9333ea", "#0d9488", "#e11d48", "#1d4ed8", "#78716c"]
      const cityName = getCityName()
      // Use an area fill only when a single station is shown (cleaner with one line)
      const singleSeries = fddSeries.length === 1
      const series = fddSeries.map((s, idx) => {
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
      if (showLowess && lowessSeries.length > 0) {
        lowessSeries.forEach((ls, idx) => {
          const yearMap = {}
          ls.years.forEach((y, i) => { yearMap[y] = ls.fdds[i] })
          const alignedData = filteredYears.map((y) => yearMap[y] ?? null)
          const matchingStation = fddSeries.find((s) => s.stationId === ls.stationId)
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
      if (showLowess && lowessSeries.length > 0) {
        lowessSeries.forEach((ls) => {
          chartSx[`.MuiLineElement-series-lowess-${ls.stationId}`] = {
            strokeWidth: 2,
            strokeDasharray: "6 5",
          }
        })
      }

      const chartHeight = fddSeries.length > 1 ? 300 : 260


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
                slotProps={{ legend: { hidden: true } }}
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
          {(fddSeries.length > 1 || (showLowess && lowessSeries.length > 0)) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", padding: "8px 0" }}>
              {fddSeries.map((s, idx) => {
                const displayLabel = showAdvanced ? s.stationName : (cityName || s.stationName)
                return (
                  <div key={s.stationId} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem" }}>
                    <span style={{ width: 14, height: 3, backgroundColor: colors[idx % colors.length], display: "inline-block", borderRadius: 2 }} />
                    <span>{displayLabel}</span>
                  </div>
                )
              })}
              {showLowess && lowessSeries.map((ls, idx) => {
                const matchingStation = fddSeries.find((s) => s.stationId === ls.stationId)
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
      {featurePopup && (
        <div
          className="wrtdip-feature-popup"
          style={{
            left: Math.min(featurePopup.screenX, (MapElement.current?.clientWidth || 600) - 300),
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
            <button
              className="wrtdip-feature-popup__close"
              onClick={() => setFeaturePopup(null)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          {featurePopup.content && (
            <div
              className="wrtdip-feature-popup__body"
              dangerouslySetInnerHTML={{ __html: featurePopup.content }}
            />
          )}
          <div className="wrtdip-feature-popup__arrow" />
        </div>
      )}
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
                  <div style={{ display: "flex", gap: "12px", marginBottom: "0.5rem", justifyContent: "center" }}>
                    <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                      <input type="checkbox" checked={snowShowMax} onChange={(e) => setSnowShowMax(e.target.checked)} />
                      <span style={{ color: "#e53935" }}>Max</span>
                    </label>
                    <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                      <input type="checkbox" checked={snowShowAvg} onChange={(e) => setSnowShowAvg(e.target.checked)} />
                      <span style={{ color: "#42a5f5" }}>Avg</span>
                    </label>
                    <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                      <input type="checkbox" checked={snowShowMin} onChange={(e) => setSnowShowMin(e.target.checked)} />
                      <span style={{ color: "#66bb6a" }}>Min</span>
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
                  <div style={{ display: "flex", gap: "12px", marginBottom: "0.5rem", justifyContent: "center" }}>
                    <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                      <input type="checkbox" checked={tempShowMax} onChange={(e) => setTempShowMax(e.target.checked)} />
                      <span style={{ color: "#e53935" }}>Max</span>
                    </label>
                    <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                      <input type="checkbox" checked={tempShowAvg} onChange={(e) => setTempShowAvg(e.target.checked)} />
                      <span style={{ color: "#42a5f5" }}>Avg</span>
                    </label>
                    <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                      <input type="checkbox" checked={tempShowMin} onChange={(e) => setTempShowMin(e.target.checked)} />
                      <span style={{ color: "#66bb6a" }}>Min</span>
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

        const map = new Map({ basemap: "streets-vector" })
        const view = new MapView({
          container: MapElement.current,
          map: map,
          center: [-110, 65.5], // Adjust longitude and latitude as needed
          zoom: 4.5,
          popupEnabled: true,
        })

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
              view.container.style.cursor = "pointer"
            } else {
              // Reset if we moved off all markers
              if (highlightedGraphic) {
                const prevSymbol = highlightedGraphic.symbol.clone()
                prevSymbol.size = NORMAL_SIZE
                highlightedGraphic.symbol = prevSymbol
                highlightedGraphic = null
              }
              view.container.style.cursor = "default"
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
