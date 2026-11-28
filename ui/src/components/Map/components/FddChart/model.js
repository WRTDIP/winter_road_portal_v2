import { useMemo } from "react";
import { lineElementClasses, areaElementClasses } from "@mui/x-charts/LineChart";

/* Everything both FDD layouts agree on: which stations are plottable, what the
   lines are made of, what they are called and what colour they are. The phone
   and desktop variants lay this out differently; they must never derive it
   differently, or the same station reads as two different records. */

/* A station needs at least this many usable seasons before its graph is drawn —
   one or two dots read as a trend when they aren't one. */
export const MIN_GRAPH_POINTS = 6;

export const FDD_COLORS = [
  "#2563eb", "#dc2626", "#16a34a", "#ea580c", "#7c3aed", "#0891b2",
];
export const FDD_LOWESS_COLORS = [
  "#f59e0b", "#9333ea", "#0d9488", "#e11d48", "#1d4ed8", "#78716c",
];

export const FDD_UNIT = "°C·days";

/* Station label: the plain city name normally, the full station name once the
   user has asked for detail. */
const labelFor = (station, cityName, showAdvanced) =>
  showAdvanced ? station.stationName : cityName || station.stationName;

/**
 * @returns {{
 *   status: "loading"|"insufficient"|"empty"|"ready",
 *   emptyRange: boolean,      // ready, but the chosen years hold no points
 *   chartSeries, chartLowess, filteredYears, dataMin, dataMax,
 *   muiSeries, chartSx, legend
 * }}
 */
export function buildFddChartModel({
  loading = false,
  series = [],
  lowessSeries = [],
  showLowess = false,
  showAdvanced = false,
  cityName = null,
  viewRange = [],
}) {
  const blank = {
    chartSeries: [], chartLowess: [], filteredYears: [],
    dataMin: null, dataMax: null, muiSeries: [], chartSx: {}, legend: [],
    emptyRange: false,
  };

  if (loading) return { ...blank, status: "loading" };

  // Only stations with enough seasons of data get plotted; the rest would
  // render as one or two floating dots.
  const chartSeries = series.filter((s) => s.years.length >= MIN_GRAPH_POINTS);
  if (series.length > 0 && chartSeries.length === 0) {
    return { ...blank, status: "insufficient" };
  }
  if (chartSeries.length === 0) return { ...blank, status: "empty" };

  // Only keep LOWESS curves for stations that are actually plotted.
  const chartLowess = lowessSeries.filter((ls) =>
    chartSeries.some((s) => s.stationId === ls.stationId)
  );

  const allYears = [...new Set(chartSeries.flatMap((s) => s.years))].sort((a, b) => a - b);
  const [from, to] = viewRange;
  const filteredYears = allYears.filter((y) => y >= from && y <= to);
  const dataMin = allYears[0];
  const dataMax = allYears[allYears.length - 1];

  // Align a station's values to the filtered x-axis (null for missing years).
  const alignTo = (years, values) => {
    const byYear = {};
    years.forEach((y, i) => { byYear[y] = values[i]; });
    return filteredYears.map((y) => byYear[y] ?? null);
  };

  // An area fill only reads cleanly under a single line.
  const singleSeries = chartSeries.length === 1;

  const muiSeries = chartSeries.map((s, idx) => ({
    id: `fdd-${s.stationId}`,
    data: alignTo(s.years, s.fdds),
    color: FDD_COLORS[idx % FDD_COLORS.length],
    showMark: false,
    curve: "monotoneX",
    label: labelFor(s, cityName, showAdvanced),
    connectNulls: true,
    area: singleSeries,
    valueFormatter: (v) => (v == null ? "No data" : `${Math.round(v)} ${FDD_UNIT}`),
  }));

  const legend = chartSeries.map((s, idx) => ({
    key: `fdd-${s.stationId}`,
    label: labelFor(s, cityName, showAdvanced),
    color: FDD_COLORS[idx % FDD_COLORS.length],
    kind: "line",
  }));

  if (showLowess && chartLowess.length > 0) {
    chartLowess.forEach((ls, idx) => {
      const match = chartSeries.find((s) => s.stationId === ls.stationId);
      const base = showAdvanced
        ? match?.stationName || `Station ${ls.stationId}`
        : cityName || match?.stationName || `Station ${ls.stationId}`;
      const color = FDD_LOWESS_COLORS[idx % FDD_LOWESS_COLORS.length];
      muiSeries.push({
        id: `lowess-${ls.stationId}`,
        data: alignTo(ls.years, ls.fdds),
        color,
        showMark: false,
        curve: "monotoneX",
        label: `${base} (LOWESS)`,
        connectNulls: true,
        valueFormatter: (v) => (v == null ? "" : `${Math.round(v)} ${FDD_UNIT}`),
      });
      legend.push({
        key: `lowess-${ls.stationId}`,
        label: `${base} (LOWESS)`,
        color,
        kind: "dash",
      });
    });
  }

  // Thick smooth data lines, dashed LOWESS trend lines, and a soft fill under a
  // single-station line.
  const chartSx = {
    [`.${lineElementClasses.root}`]: { strokeWidth: 2.5, strokeLinecap: "round" },
    [`.${areaElementClasses.root}`]: { fillOpacity: 0.12 },
  };
  if (showLowess && chartLowess.length > 0) {
    chartLowess.forEach((ls) => {
      chartSx[`.MuiLineElement-series-lowess-${ls.stationId}`] = {
        strokeWidth: 2,
        strokeDasharray: "6 5",
      };
    });
  }

  return {
    status: "ready",
    emptyRange: filteredYears.length === 0,
    chartSeries, chartLowess, filteredYears, dataMin, dataMax,
    muiSeries, chartSx, legend,
  };
}

export function useFddChartModel(props) {
  const {
    loading, series, lowessSeries, showLowess, showAdvanced, cityName, viewRange,
  } = props;
  return useMemo(
    () => buildFddChartModel({
      loading, series, lowessSeries, showLowess, showAdvanced, cityName, viewRange,
    }),
    [loading, series, lowessSeries, showLowess, showAdvanced, cityName, viewRange]
  );
}

/* The legend is drawn outside the plot in both variants, so the same entries
   can sit above a phone chart and below a desktop one. Only worth showing when
   there is more than one line to tell apart. */
export const legendIsUseful = (model) => model.legend.length > 1;
