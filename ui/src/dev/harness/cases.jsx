import { useState } from "react";
import FddChart from "../../components/Map/components/FddChart";
import PrecipChart from "../../components/Map/components/PrecipChart";
import fixtures from "./fixtures.js";
import precipFixtures from "./precipFixtures.js";
import { PRECIP_BAR_GAPS } from "../../components/Map/components/PrecipChart";

/* The harness case registry.

   One entry per state of a responsive component that is worth photographing.
   A case renders the real component with frozen data — no network, no ArcGIS,
   no clicking a city on a map to reach a dialog three layers down.

   Adding a mobile variant to another component? Add its cases here and the
   viewport matrix in scripts/variant-shots.mjs covers it for free. */

const YEARS = (series) => series.years;
const bounds = (list) => {
  const all = list.flatMap((s) => s.fdds).filter((v) => v != null && !isNaN(v));
  return { min: Math.floor(Math.min(...all)), max: Math.ceil(Math.max(...all)) };
};

/* Holds the ranges the chart normally gets from Map.jsx, so the harness
   exercises the same lifted-state contract the real caller does. */
function FddCase({ series, lowessSeries = [], showLowess = false, showAdvanced = false, cityName }) {
  const allYears = [...new Set(series.flatMap(YEARS))].sort((a, b) => a - b);
  const yBounds = series.length ? bounds(series) : { min: 0, max: 5000 };
  const [viewRange, setViewRange] = useState([
    allYears[0] ?? 1951,
    allYears[allYears.length - 1] ?? 2023,
  ]);
  const [yRange, setYRange] = useState([yBounds.min, yBounds.max]);

  return (
    <FddChart
      loading={false}
      series={series}
      lowessSeries={lowessSeries}
      showLowess={showLowess}
      showAdvanced={showAdvanced}
      cityName={cityName}
      viewRange={viewRange}
      onViewRangeChange={setViewRange}
      yRange={yRange}
      onYRangeChange={setYRange}
      yBounds={yBounds}
      allYears={allYears}
    />
  );
}


/* Holds the toggles and the resolution, so the phone layout's "show monthly
   instead" button actually changes the chart the way Map.jsx would. */
function PrecipCase({ start = "daily3mo", visible: initial, hasMonthly = true }) {
  const [which, setWhich] = useState(start);
  const [visible, setVisible] = useState(
    initial || { max: true, avg: true, min: true }
  );
  const data = which === null ? null : precipFixtures[which];
  const isDaily = which !== "monthly12";

  return (
    <PrecipChart
      loading={false}
      data={data}
      visible={visible}
      onVisibleChange={(key, on) => setVisible((v) => ({ ...v, [key]: on }))}
      xAxisLabel={isDaily ? "Date" : "Month"}
      yAxisLabel="Precipitation (mm)"
      barGaps={PRECIP_BAR_GAPS[isDaily ? "daily" : "monthly"]}
      loadingMessage="Loading precipitation data..."
      emptyMessage="No CanHomP V2 precipitation data available for this location."
      denseHint="Scroll sideways to see every day"
      onRequestCoarser={
        isDaily && hasMonthly ? () => setWhich("monthly12") : undefined
      }
      coarserLabel="Show monthly instead — fits the screen"
    />
  );
}

const CASES = [
  {
    id: "fdd-single",
    title: "FDD — one station, 73 seasons",
    note: "The common case: a city with one climate station and a filled area under the line.",
    render: () => <FddCase series={[fixtures.yellowknife]} cityName="Yellowknife" />,
  },
  {
    id: "fdd-lowess",
    title: "FDD — one station with LOWESS",
    note: "Adds the dashed trend curve, so the legend appears.",
    render: () => (
      <FddCase
        series={[fixtures.yellowknife]}
        lowessSeries={[fixtures.lowess.yellowknife]}
        showLowess
        cityName="Yellowknife"
      />
    ),
  },
  {
    id: "fdd-multi",
    title: "FDD — three stations, advanced labels",
    note: "Worst case for the legend: full station names, three lines, three trend curves.",
    render: () => (
      <FddCase
        series={[fixtures.yellowknife, fixtures.whitehorse, fixtures.dawson]}
        lowessSeries={[
          fixtures.lowess.yellowknife,
          fixtures.lowess.whitehorse,
          fixtures.lowess.dawson,
        ]}
        showLowess
        showAdvanced
        cityName="Yellowknife"
      />
    ),
  },
  {
    id: "fdd-short",
    title: "FDD — 8-season record",
    note: "Just above the 6-season floor. Few points, so tick thinning must not kick in.",
    render: () => <FddCase series={[fixtures.shortRecord]} cityName="Test Site" />,
  },
  {
    id: "fdd-insufficient",
    title: "FDD — below the plotting floor",
    note: "Two seasons: the chart is replaced by a message in both variants.",
    render: () => <FddCase series={[fixtures.fortSimpson]} cityName="Fort Simpson" />,
  },
  {
    id: "fdd-empty",
    title: "FDD — no data",
    note: "Nothing to plot at all.",
    render: () => <FddCase series={[]} cityName="Nowhere" />,
  },
  {
    id: "precip-monthly",
    title: "Precipitation — 12 monthly bars",
    note: "Fits a phone: twelve categories, three series, no scrolling at all.",
    render: () => <PrecipCase start="monthly12" />,
  },
  {
    id: "precip-daily-1mo",
    title: "Precipitation — 30 daily bars",
    note: "One month. Past the legibility floor, so it scrolls inside its own box.",
    render: () => <PrecipCase start="daily1mo" />,
  },
  {
    id: "precip-daily-3mo",
    title: "Precipitation — 92 daily bars",
    note: "The default month range. The worst density the panel can produce.",
    render: () => <PrecipCase start="daily3mo" />,
  },
  {
    id: "precip-avg-only",
    title: "Precipitation — 92 bars, Avg only",
    note: "Two series switched off; the bars get three times the room.",
    render: () => (
      <PrecipCase start="daily3mo" visible={{ max: false, avg: true, min: false }} />
    ),
  },
  {
    id: "precip-none-on",
    title: "Precipitation — every series off",
    note: "An empty plot rather than a crash.",
    render: () => (
      <PrecipCase start="daily3mo" visible={{ max: false, avg: false, min: false }} />
    ),
  },
  {
    id: "precip-empty",
    title: "Precipitation — no data",
    note: "Station with no CanHomP V2 precipitation.",
    render: () => <PrecipCase start={null} />,
  },
];

export default CASES;
