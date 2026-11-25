import { useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import YearRangeSlider from "../../../YearRangeSlider/YearRangeSlider.jsx";
import usePinchZoomYears from "../../../../hooks/usePinchZoomYears.js";
import useElementWidth from "../../../../hooks/useElementWidth.js";
import useIsTouch from "../../../../hooks/useIsTouch.js";
import { useFddChartModel, legendIsUseful, FDD_UNIT } from "./model.js";
import ChartMessage, { FDD_MESSAGES, FddChartFallback } from "./ChartMessage.jsx";
import "./styles.css";

/* The phone layout.

   The desktop chart spends 95px of its left margin on a rotated axis title and
   draws a tick per year. On a 360px screen that leaves the plot about 220px
   wide with forty labels fighting over it, which is why the wrapper used to
   force a 420px minimum and hand the user a sideways scroll. This variant
   instead fits the box it is given: the axis titles become one caption line,
   the ticks thin out to what the measured width can hold, and the two range
   sliders fold into a disclosure so the graph itself is what is on screen. */

/* Year labels are four digits; below this much room per label they collide. */
const YEAR_LABEL_SLOT = 44;
/* Gutters. Left clears a four-digit tick label at 10px, no axis title. */
const MARGIN = { left: 42, right: 14, top: 10, bottom: 26 };
/* Fallback until ResizeObserver reports — a 360px phone minus the dialog's
   padding. Only ever used for the first paint. */
const ASSUMED_WIDTH = 300;

/* Offer the spans that actually shorten the record in view. */
const SPANS = [30, 10];

export default function FddChartMobile(props) {
  const {
    viewRange, onViewRangeChange, yRange, onYRangeChange, yBounds, allYears,
  } = props;

  const model = useFddChartModel(props);
  const [rootRef, measuredWidth] = useElementWidth();
  const isTouch = useIsTouch();
  /* Purely presentational and mobile-only, so it is safe to keep local: the
     desktop variant has no drawer to preserve across a rotation. */
  const [rangeOpen, setRangeOpen] = useState(false);

  const pinchRef = usePinchZoomYears(
    viewRange,
    onViewRangeChange,
    allYears[0],
    allYears[allYears.length - 1],
    { range: yRange, setRange: onYRangeChange, min: yBounds.min, max: yBounds.max }
  );

  if (model.status !== "ready")
    return <FddChartFallback model={model} variant="mobile" />;

  const { filteredYears, dataMin, dataMax, muiSeries, chartSx, legend } = model;
  // Pad the plotted y-range a little beyond the slider values so the highest
  // and lowest seasons are not drawn on the plot edge and clipped.
  const yPad = Math.max(50, Math.round((yRange[1] - yRange[0]) * 0.06));

  const width = measuredWidth || ASSUMED_WIDTH;
  const plotWidth = Math.max(120, width - MARGIN.left - MARGIN.right);
  /* The chart is given an explicit width rather than left to measure its own
     container: we already have the number, and MUI warns (and renders once at
     the wrong size) when it measures a box that has not been laid out yet. */
  /* Keep labels off each other: show at most one per slot, then drop to every
     nth year. */
  const maxLabels = Math.max(2, Math.floor(plotWidth / YEAR_LABEL_SLOT));
  const labelEvery = Math.max(1, Math.ceil(filteredYears.length / maxLabels));
  /* A shape near 5:3 stays readable without pushing the controls off screen.
     Multiple lines get a little more room to separate. */
  const plotHeight = Math.round(
    Math.min(model.chartSeries.length > 1 ? 230 : 210, Math.max(170, width * 0.62))
  );

  /* Seasons, not gaps: a chip that says "Last 30 yr" must show thirty of them,
     so the window is inclusive of both ends. */
  const seasonsIn = (range) => range[1] - range[0] + 1;
  const totalSeasons = seasonsIn([dataMin, dataMax]);
  const isFullRange = viewRange[0] <= dataMin && viewRange[1] >= dataMax;
  const applySpan = (years) =>
    onViewRangeChange([Math.max(dataMin, dataMax - years + 1), dataMax]);
  const resetRanges = () => {
    onViewRangeChange([dataMin, dataMax]);
    onYRangeChange([yBounds.min, yBounds.max]);
  };
  const atFullY = yRange[0] <= yBounds.min && yRange[1] >= yBounds.max;

  return (
    <div className="wrtdip-fdd-m u-fit-width" data-variant="mobile" ref={rootRef}>
      {/* Carries what the rotated axis title says on desktop. The x axis needs
          no caption — the ticks are visibly years. */}
      <p className="wrtdip-fdd-m__unit">
        Freezing degree days ({FDD_UNIT}) ·{" "}
        <span className="wrtdip-fdd-m__unit-range">
          {viewRange[0]}–{viewRange[1]}
        </span>
      </p>

      {model.emptyRange ? (
        <ChartMessage>{FDD_MESSAGES.emptyRange}</ChartMessage>
      ) : (
        /* u-gesture-x (touch-action: pan-y) keeps the dialog scrollable through
           the plot: a vertical drag stays with the browser, and the pinch hook
           only claims the two-finger gesture. */
        <div
          ref={pinchRef}
          className="wrtdip-fdd-m__plot u-gesture-x"
          style={{ minHeight: plotHeight }}
        >
          <LineChart
            width={Math.floor(width)}
            xAxis={[
              {
                data: filteredYears,
                scaleType: "point",
                valueFormatter: (year) => String(year),
                tickInterval: (value, index) => index % labelEvery === 0,
                tickLabelStyle: { fontSize: 10 },
              },
            ]}
            yAxis={[
              {
                min: yRange[0] - yPad,
                max: yRange[1] + yPad,
                tickNumber: 4,
                tickLabelStyle: { fontSize: 10 },
              },
            ]}
            series={muiSeries}
            height={plotHeight}
            margin={MARGIN}
            grid={{ horizontal: true }}
            slotProps={{
              legend: { hidden: true },
              // Same z-index lift as the desktop chart: the tooltip Popper
              // otherwise renders under the map popup.
              popper: { sx: { zIndex: 7000 } },
            }}
            sx={chartSx}
          />
        </div>
      )}

      {/* Below the plot, not above it: on a phone the graph is what the user
          opened the dialog for, and six full station names would push it off
          the first screen. */}
      {legendIsUseful(model) && (
        <div className="wrtdip-popup-legend wrtdip-fdd-m__legend">
          {legend.map((item) => (
            <span key={item.key} className="wrtdip-popup-legend__item">
              <span
                className={`wrtdip-popup-legend__swatch wrtdip-popup-legend__swatch--${item.kind}`}
                style={{ color: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}

      {isTouch && !model.emptyRange && (
        <p className="wrtdip-fdd-m__hint">Pinch to zoom · Drag to pan</p>
      )}

      {/* Non-gesture equivalents for everything the pinch does, so the chart is
          operable by tap and by keyboard. */}
      <div className="wrtdip-fdd-m__spans" role="group" aria-label="Years shown">
        <button
          type="button"
          className={`wrtdip-fdd-m__chip${isFullRange ? " wrtdip-fdd-m__chip--on" : ""}`}
          aria-pressed={isFullRange}
          onClick={() => onViewRangeChange([dataMin, dataMax])}
        >
          All {totalSeasons} yr
        </button>
        {SPANS.filter((years) => years < totalSeasons).map((years) => {
          const on =
            !isFullRange && viewRange[1] >= dataMax && seasonsIn(viewRange) === years;
          return (
            <button
              key={years}
              type="button"
              className={`wrtdip-fdd-m__chip${on ? " wrtdip-fdd-m__chip--on" : ""}`}
              aria-pressed={on}
              onClick={() => applySpan(years)}
            >
              Last {years} yr
            </button>
          );
        })}
      </div>

      <div className="wrtdip-fdd-m__footer">
        <button
          type="button"
          className="wrtdip-fdd-m__link"
          aria-expanded={rangeOpen}
          aria-controls="fdd-mobile-range-sliders"
          onClick={() => setRangeOpen((open) => !open)}
        >
          <span className="wrtdip-fdd-m__caret" aria-hidden="true">
            {rangeOpen ? "▾" : "▸"}
          </span>
          Adjust range
        </button>
        <button
          type="button"
          className="wrtdip-fdd-m__link wrtdip-fdd-m__link--muted"
          onClick={resetRanges}
          disabled={isFullRange && atFullY}
        >
          Reset
        </button>
      </div>
      {rangeOpen && (
        <div className="wrtdip-fdd-m__sliders" id="fdd-mobile-range-sliders">
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
            label={`FDD Range (${FDD_UNIT})`}
          />
        </div>
      )}
    </div>
  );
}
