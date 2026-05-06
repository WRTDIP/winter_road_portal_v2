import { useEffect, useRef, useState } from "react"

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
  ChartDataFDD,
} from "./Data.js"
import { width } from "@fortawesome/free-regular-svg-icons/faAddressBook"
import { getClimateCity } from "../../services/meteo.service.js"
import { cities } from "../../utils/constants.js"
import { LineChart } from "@mui/x-charts/LineChart"
import { Icon, Typography } from "@mui/material"
import OpenInFullIcon from "@mui/icons-material/OpenInFull"
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen"
import IconButton from "@mui/material/IconButton"
import ForecastPanel from "./ForecastPanel.jsx"

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

  /**
   * Effect hook to load data when component mounts.
   */
  useEffect(() => {
    loadData(weatherData, MapElement)
  }, [])

  useEffect(() => {
    console.log("Print Mouse", mouse)
  }, [mouse])

  /**
   * Function to close the modal.
   */
  function closeModal() {
    setModalEnlarge(false)
    setModalIsOpen(false)
    setClimateData(null) // Clear climate forecast data when closing
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
    let cityName = getCityName()
    let fddData = ChartDataFDD[cityName] || null
    if (fddData) {
      return (
        <LineChart
          xAxis={[
            {
              data: fddData.x,
              valueFormatter: (year) => year.toString(),
              label: "Year",
            },
          ]}
          yAxis={[
            {
              label: "Freezing Degree Days (°C·days)",
              labelStyle: { transform: "rotate(270deg) translate(-94px, -176px)" },
            },
          ]}
          series={[
            {
              data: fddData.y,
              color: "#1976d2",
              showMark: false,
              curve: "monotoneX",
              label: "FDDs",
            },
          ]}
          height={260}
          margin={{ left: 95, right: 20, top: 20, bottom: 50 }}
          grid={{ horizontal: true }}
        />
      )
    } else {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          No FDDs data available for this location.
        </Typography>
      )
    }
  }

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
          <section className="wrtdip-map-modal__section">
            <Typography variant="subtitle1" className="wrtdip-map-modal__section-title">
              Freezing Degree Days (FDDs)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Annual cumulative freezing degree days, 1980–2019
            </Typography>
            <div className="wrtdip-map-modal__chart">{generateChart()}</div>
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
      popupTemplate: layer.popupTemplate,
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
          expanded: true,
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

        /**
         * Creates a graphic representing a city on the map. Also contains a click event that triggers a modal when that city is clicked
         * @param {number[]} coordinates - Array containing latitude and longitude of the city.
         * @param {string} color - Color of the marker representing the city.
         * @param {GraphicsLayer} layer - Graphics layer where the city graphic will be added.
         */
        async function createCityGraphic(coordinates, color, layer) {
          const pinCoordinates = {
            type: "point",
            longitude: coordinates[1],
            latitude: coordinates[0],
          }

          // Set marker style based on the layer (default marker style by ArcGIS API)
          let markerStyle = {
            type: "simple-marker",
            color: color,
            size: "5px",
          };

          // For the Climate Data, use the style below
          if (layer.title === "Weather and Climate Data") {
            markerStyle = {
              type: "simple-marker",
              color: "blue", // Change to your desired color
              size: "10px", // Change to your desired size
              outline: {
                color: "white",
                width: 1,
              },
            };
          }

          // For the Weather Forecast, use the style below
          if (layer.title === "Weather Forecast") {
            markerStyle = {
              type: "simple-marker",
              color: "orange", // Change to your desired color
              size: "10px",    // Change to your desired size
              outline: {
                color: "white",
                width: 1,
              },
            };
          }



          let newPointGraphic = new Graphic({
            symbol: markerStyle,
            geometry: pinCoordinates,
            attributes: {
              cityName: "City Name",
              weatherDetails: "Weather Details",
            },
          });
          layer.add(newPointGraphic);             
           
          //click event that triggers when a point on the map is clicked and checks to see if the point clicked contains any point located in the three territories
          view.on("click", (event) => {
            let uniqueKey = -1,
              territory = null
            let selectedCityName = null
            let selectedCoordinates = null
            const clickedPoint = event.mapPoint
            const latitude = clickedPoint.latitude,
              longitude = clickedPoint.longitude

            setMouse({ x: event.x, y: event.y })
            // Checks if area clicked is a point located at a lat/long point in yukonCoordinates
            Object.keys(yukonCoordinates).every((yukonKey) => {
              if (
                isWithinRange(
                  yukonCoordinates[yukonKey][1],
                  longitude - 0.07,
                  longitude + 0.07
                ) &&
                isWithinRange(
                  yukonCoordinates[yukonKey][0],
                  latitude - 0.07,
                  latitude + 0.07
                )
              ) {
                uniqueKey = yukonKey
                territory = "yt"
                selectedCoordinates = yukonCoordinates[yukonKey]
                selectedCityName = citiesOfYukon[yukonKey]
                let city = cities.find(
                  (c) => c.name_e == citiesOfYukon[uniqueKey]
                )
                console.log("Selected city:", city); //added for the province and stationCode
                if (city) {
                  // console.log(getClimateCity(city.key))
                  console.log(getClimateCity(city.province, city.stationCode))
                }
                //added for the province and stationCode
                if (city && city.province && city.stationCode) {
                  setClimateLoading(true)
                  setClimateData(null)
                  getClimateCity(city.province, city.stationCode) //added the province and station code to constants.js (only for Yukon as a test)
                    .then((data) => setClimateData(data))
                    .finally(() => setClimateLoading(false))
                } else if (city) {
                  setClimateData({ error: "No weather data available for this location." })
                  setClimateLoading(false)
                }               
                return false
              }
              return true
            })

            // Checks if area clicked is a point located at a lat/long point in northWestCoordinates
            Object.keys(northWestCoordinates).every((northKey) => {
              if (northKey === 1 || northKey === 24) {
                if (
                  isWithinRange(
                    northWestCoordinates[northKey][1],
                    longitude - 0.01,
                    longitude + 0.01
                  ) &&
                  isWithinRange(
                    northWestCoordinates[northKey][0],
                    latitude - 0.01,
                    latitude + 0.01
                  )
                ) {
                  uniqueKey = northKey
                  territory = "nt"
                  selectedCoordinates = northWestCoordinates[northKey]
                  selectedCityName = citiesOfNorthwestTerritories[northKey]
                  return false
                }
              } else if (
                isWithinRange(
                  northWestCoordinates[northKey][1],
                  longitude - 0.07,
                  longitude + 0.07
                ) &&
                isWithinRange(
                  northWestCoordinates[northKey][0],
                  latitude - 0.07,
                  latitude + 0.07
                )
              ) {
                uniqueKey = northKey
                territory = "nt"
                selectedCoordinates = northWestCoordinates[northKey]
                selectedCityName = citiesOfNorthwestTerritories[northKey]
                return false
              }
              return true
            })

            // Checks if area clicked is a point located at a lat/long point in nunavutCoordinates
            Object.keys(nunavutCoordinates).every((nunavutKey) => {
              if (
                isWithinRange(
                  nunavutCoordinates[nunavutKey][1],
                  longitude - 0.07,
                  longitude + 0.07
                ) &&
                isWithinRange(
                  nunavutCoordinates[nunavutKey][0],
                  latitude - 0.07,
                  latitude + 0.07
                )
              ) {
                uniqueKey = nunavutKey
                territory = "nu"
                selectedCoordinates = nunavutCoordinates[nunavutKey]
                selectedCityName = citiesOfNunavut[nunavutKey]
                return false
              }
              return true
            })

            miniForecastState.cityName = selectedCityName || ""
            renderCustomLayerList()

            if (territory != null && selectedCoordinates) {
              updateLayerPanelMiniForecast(
                selectedCoordinates[0],
                selectedCoordinates[1]
              )
            }
            setKey((prevKey) => uniqueKey)
            setTerritory((prevTerritory) => territory)
            setModalIsOpen(true)
            if (territory == null) {
              setModalIsOpen(false)
            }
          })
        }

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
          featureReduction: {
            type: "cluster",
          },
        })

        Object.keys(yukonCoordinates).forEach((key) => {
          createCityGraphic(yukonCoordinates[key], "blue", liveWeatherDataLayer)
        })
        Object.keys(northWestCoordinates).forEach((key) => {
          createCityGraphic(northWestCoordinates[key], "blue", liveWeatherDataLayer)
        })
        Object.keys(nunavutCoordinates).forEach((key) => {
          createCityGraphic(nunavutCoordinates[key], "blue", liveWeatherDataLayer)
        })
        map.add(liveWeatherDataLayer)

        // Create a new GraphicsLayer for the weather forecast
        const weatherForecastLayer = new GraphicsLayer({
          title: "Weather Forecast",
          featureReduction: {
            type: "cluster",
          },
          visible: false,
        })
                
        // Add Weather Forecast markers to the Weather Forecast layer
        Object.keys(yukonCoordinates).forEach((key) => {
          createCityGraphic(yukonCoordinates[key], "green", weatherForecastLayer)
        })
        Object.keys(northWestCoordinates).forEach((key) => {
          createCityGraphic(northWestCoordinates[key], "green", weatherForecastLayer)
        })
        Object.keys(nunavutCoordinates).forEach((key) => {
          createCityGraphic(nunavutCoordinates[key], "green", weatherForecastLayer)
        })
        
        map.add(weatherForecastLayer);      
        
      }
    )
  }

  function isWithinRange(number, min, max) {
    return number >= min && number <= max
  }
}

export default WeatherMap
