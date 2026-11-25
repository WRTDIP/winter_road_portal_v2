import { LineChart } from "@mui/x-charts/LineChart";
import YearRangeSlider from "../../../YearRangeSlider/YearRangeSlider.jsx";
import usePinchZoomYears from "../../../../hooks/usePinchZoomYears.js";
import { useFddChartModel, legendIsUseful } from "./model.js";
import ChartMessage, { FDD_MESSAGES, FddChartFallback } from "./ChartMessage.jsx";

/* The wide layout: full rotated axis labels, a tick per year, and both range
   sliders always open. Unchanged from the layout this component was extracted
   from — the phone variant is the one that had to be redesigned. */
export default function FddChartDesktop(props) {
  const {
    viewRange, onViewRangeChange, yRange, onYRangeChange, yBounds, allYears,
  } = props;

  const model = useFddChartModel(props);
  const pinchRef = usePinchZoomYears(
    viewRange,
    onViewRangeChange,
    allYears[0],
    allYears[allYears.length - 1],
    { range: yRange, setRange: onYRangeChange, min: yBounds.min, max: yBounds.max }
  );

  if (model.status !== "ready")
    return <FddChartFallback model={model} variant="desktop" />;

  const { filteredYears, dataMin, dataMax, muiSeries, chartSx, legend } = model;
  // Pad the plotted y-range a little beyond the slider values so the highest
  // and lowest seasons are not drawn on the plot edge and clipped.
  const yPad = Math.max(50, Math.round((yRange[1] - yRange[0]) * 0.06));
  const chartHeight = model.chartSeries.length > 1 ? 300 : 260;

  return (
    <div>
      <YearRangeSlider
        value={viewRange}
        onChange={onViewRangeChange}
        min={dataMin}
        max={dataMax}
      />
      <YearRangeSlider
        value={yRange}
        onChange={onYRangeChange}
        min={yBounds.min}
        max={yBounds.max}
        label="FDD Range (°C·days)"
      />
      <div ref={pinchRef} style={{ touchAction: "none", overflow: "hidden" }}>
        {model.emptyRange ? (
          <ChartMessage>{FDD_MESSAGES.emptyRange}</ChartMessage>
        ) : (
          <LineChart
            xAxis={[
              {
                data: filteredYears,
                // Pin the axis to the data so it doesn't round out to empty
                // decades (e.g. 1990-2030 for a 1998-2023 record).
                min: filteredYears[0],
                max: filteredYears[filteredYears.length - 1],
                valueFormatter: (year) => year.toString(),
                label: "Year",
                tickMinStep: 1,
              },
            ]}
            yAxis={[
              {
                min: yRange[0] - yPad,
                max: yRange[1] + yPad,
                label: "Freezing Degree Days (°C·days)",
                labelStyle: { transform: "rotate(270deg) translate(-94px, -176px)" },
              },
            ]}
            series={muiSeries}
            height={chartHeight}
            margin={{ left: 95, right: 20, top: 10, bottom: 50 }}
            grid={{ horizontal: true }}
            slotProps={{
              legend: { hidden: true },
              // The chart's hover tooltip renders in a Popper. Its default
              // z-index sits below the road-closure popup (5000/6000), so lift
              // it above the popup to keep the datapoint tooltip on top.
              popper: { sx: { zIndex: 7000 } },
            }}
            sx={chartSx}
          />
        )}
      </div>
      {legendIsUseful(model) && (
        <div
          style={{
            display: "flex", flexWrap: "wrap", gap: "12px",
            justifyContent: "center", padding: "8px 0",
          }}
        >
          {legend.map((item) => (
            <div
              key={item.key}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem" }}
            >
              <span
                style={
                  item.kind === "dash"
                    ? { width: 14, height: 0, borderTop: `2px dashed ${item.color}`, display: "inline-block" }
                    : { width: 14, height: 3, backgroundColor: item.color, display: "inline-block", borderRadius: 2 }
                }
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
