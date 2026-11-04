import roadFddOpening from "./roadFddOpening.json"

// Map overlay that colours each winter road by how closely its opening date
// tracks early-winter freezing degree days (see RoadFddCorrelation.jsx).

export const ROAD_FDD_LAYER_TITLE = "Winter Roads - FDD Link"

export const ROAD_FDD_LAYER_URLS = [
  "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Winter_Roads_v1/FeatureServer/4",
  "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Winter_Roads_v1/FeatureServer/1",
]

const CLASSES = {
  strong: { label: "Colder Oct–Dec, earlier opening (p < 0.05)", color: "#0b3d91", width: 4 },
  weak: { label: "Same direction, not significant", color: "#5fa8e8", width: 3 },
  none: { label: "No link or opposite direction", color: "#a3a3a3", width: 3 },
}

const classOf = (road) => {
  if (!road || road.status !== "ok") return null
  const { rho, p } = road.spearman
  if (rho < 0 && p < 0.05) return "strong"
  if (rho < 0) return "weak"
  return "none"
}

const lineSymbol = ({ color, width }, style = "solid") => ({
  type: "simple-line",
  color,
  width,
  style,
})

const streetsIn = (key) =>
  Object.entries(roadFddOpening.roads)
    .filter(([, road]) => classOf(road) === key)
    .map(([street]) => street)

// Grouped classes give one legend row per class instead of one per road.
export const roadFddRenderer = {
  type: "unique-value",
  field: "STREET",
  legendOptions: { title: "Opening date vs Oct–Dec FDD" },
  defaultLabel: "No opening records",
  defaultSymbol: lineSymbol({ color: "#a3a3a3", width: 1.5 }, "short-dot"),
  uniqueValueGroups: [
    {
      classes: Object.entries(CLASSES).map(([key, cls]) => ({
        label: cls.label,
        symbol: lineSymbol(cls),
        values: streetsIn(key),
      })),
    },
  ],
}
