import { BarChart } from "@mui/x-charts/BarChart";
import { Typography } from "@mui/material";
import useElementWidth from "../../../../hooks/useElementWidth.js";
import ChartScroller from "../ChartScroller.jsx";
import SeriesToggles from "./SeriesToggles.jsx";
import { usePrecipChartModel, minSlotFor } from "./model.js";
import "./styles.css";

/* The phone layout.

   Three things were wrong here on a phone. The wrapper forced the chart to
   420px and scrolled the whole thing sideways — including the Max/Avg/Min
   switches, so the Min switch sat off-screen and could not be reached. MUI's
   own legend rendered inside the plot on top of the bars, duplicating those
   same switches. And the rotated axis titles ate a fifth of an already narrow
   box.

   So: the switches move outside anything that scrolls, the in-plot legend is
   off (the switches are the legend), the axis titles become one caption line,
   and the plot sizes itself from its measured container.

   Density is the honest part. Twelve monthly bars fit a phone and are drawn
   with no scroll at all. Ninety daily bars cannot be squeezed into 280px
   without turning into a hairline comb, so past the legibility floor the plot
   keeps a readable bar width and scrolls inside its own box — and the user is
   offered a one-tap switch to the view that does fit. */

/* Gutters. Left clears a 3-digit tick label at 10px with no axis title. */
const MARGIN = { left: 36, right: 10, top: 8, bottom: 30 };
const PLOT_HEIGHT = 210;
/* Fallback until ResizeObserver reports; only ever used for the first paint. */
const ASSUMED_WIDTH = 286;

/* Room one tick label needs: the glyphs plus breathing space. "Aug 13" needs
   noticeably more than "Jan", so measure the labels rather than guess. */
const labelSlotFor = (labels) => {
  const longest = labels.reduce((max, l) => Math.max(max, String(l).length), 0);
  return 8 + longest * 6;
};

export default function PrecipChartMobile(props) {
  const {
    visible, onVisibleChange, data, yAxisLabel,
    loadingMessage, emptyMessage,
    onRequestCoarser, coarserLabel, denseHint,
  } = props;

  const model = usePrecipChartModel(props);
  const [rootRef, measuredWidth] = useElementWidth();

  /* Measured before the early returns so the hooks run unconditionally. */
  const boxWidth = measuredWidth || ASSUMED_WIDTH;

  if (model.status === "loading") {
    return (
      <div className="u-fit-width" data-variant="mobile" ref={rootRef}>
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          {loadingMessage}
        </Typography>
      </div>
    );
  }
  if (model.status === "empty") {
    return (
      <div className="u-fit-width" data-variant="mobile" ref={rootRef}>
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          {emptyMessage}
        </Typography>
      </div>
    );
  }

  const { categories, muiSeries, active } = model;
  const gutters = MARGIN.left + MARGIN.right;

  /* The width the bars would need to stay legible, against the width there
     actually is. */
  const legibleWidth = gutters + categories * minSlotFor(active.length);
  /* With every series switched off there are no bars to keep legible, so the
     empty plot fits by definition rather than scrolling to a phantom width. */
  const fits = active.length === 0 || legibleWidth <= boxWidth;
  const plotWidth = Math.max(boxWidth, fits ? boxWidth : legibleWidth);

  const labelSlot = labelSlotFor(data.labels);
  const maxLabels = Math.max(2, Math.floor((plotWidth - gutters) / labelSlot));
  const labelEvery = Math.max(1, Math.ceil(categories / maxLabels));

  const chart = (
    <BarChart
      width={Math.floor(plotWidth)}
      height={PLOT_HEIGHT}
      xAxis={[{
        data: data.labels,
        scaleType: "band",
        tickInterval: (value, index) => index % labelEvery === 0,
        tickLabelStyle: { fontSize: 10 },
        /* Bars this thin cannot spare a gap between them; at monthly widths
           they can. */
        categoryGapRatio: fits ? 0.25 : 0.1,
        barGapRatio: fits ? 0.1 : 0,
      }]}
      yAxis={[{ tickNumber: 4, tickLabelStyle: { fontSize: 10 } }]}
      series={muiSeries}
      margin={MARGIN}
      grid={{ horizontal: true }}
      slotProps={{
        /* The Max/Avg/Min switches above already are the legend; MUI's own
           renders on top of the bars at this width. */
        legend: { hidden: true },
        /* The tooltip Popper otherwise renders under the map popup, which
           sits at z-index 5000/6000. */
        popper: { sx: { zIndex: 7000 } },
      }}
    />
  );

  return (
    <div className="wrtdip-precip-m u-fit-width" data-variant="mobile" ref={rootRef}>
      {/* Outside the scroller. These were inside it before, which is how the
          Min switch ended up off the right edge of the screen. */}
      <SeriesToggles
        visible={visible}
        onVisibleChange={onVisibleChange}
        className="wrtdip-precip-m__toggles"
      />

      {/* Carries what the rotated y-axis title says on desktop. */}
      <p className="wrtdip-precip-m__unit">{yAxisLabel}</p>

      {fits ? (
        <div className="wrtdip-precip-m__plot">{chart}</div>
      ) : (
        <>
          <ChartScroller minWidth={Math.floor(plotWidth)} hint={denseHint}>
            {chart}
          </ChartScroller>
          {onRequestCoarser && (
            <button
              type="button"
              className="wrtdip-precip-m__switch"
              onClick={onRequestCoarser}
            >
              {coarserLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
