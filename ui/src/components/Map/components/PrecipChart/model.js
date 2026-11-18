import { useMemo } from "react";

/* Everything both precipitation layouts agree on: which of Max/Avg/Min are
   showing, what they are called and what colour they are. The phone and
   desktop variants lay this out differently; they must never derive it
   differently. */

/* Order is load-bearing: it is the order of the bars in each group, of the
   toggles above the chart, and of the legend. */
/* One hue, three lightnesses: Max/Avg/Min are three amounts of the same
   thing, and lightness stays readable for colour-blind readers where the old
   red/blue/green did not. */
export const PRECIP_SERIES = [
  { key: "max", label: "Max", color: "#1e3a8a", field: "maxs" },
  { key: "avg", label: "Avg", color: "#2563eb", field: "avgs" },
  { key: "min", label: "Min", color: "#60a5fa", field: "mins" },
];

/* Bar geometry for the desktop chart. A monthly range is at most 12 bars, so
   they can be wide; a daily range is up to ~90, so they have to be thin.
   (categoryGapRatio: gap between categories, barGapRatio: gap between bars.) */
export const PRECIP_BAR_GAPS = {
  monthly: { categoryGapRatio: 0.15, barGapRatio: 0.05 },
  daily: { categoryGapRatio: 0.55, barGapRatio: 0.2 },
};

/* A bar narrower than this is not a bar, it is a hairline. Below it the phone
   layout stops compressing and scrolls instead — the same call the road-popup
   charts make, and the reason twelve monthly bars fit a phone while ninety
   daily ones cannot. Plus a little room between groups. */
const MIN_BAR_PX = 3;
const GROUP_GAP_PX = 2;

export const minSlotFor = (activeCount) =>
  MIN_BAR_PX * Math.max(activeCount, 1) + GROUP_GAP_PX;

/**
 * @returns {{
 *   status: "loading"|"empty"|"ready",
 *   categories: number, muiSeries: array, active: array
 * }}
 */
export function buildPrecipChartModel({ loading = false, data = null, visible = {} }) {
  if (loading) return { status: "loading", categories: 0, muiSeries: [], active: [] };
  if (!data || !data.labels || data.labels.length === 0) {
    return { status: "empty", categories: 0, muiSeries: [], active: [] };
  }

  const active = PRECIP_SERIES.filter((s) => visible[s.key]);
  const muiSeries = active.map((s) => ({
    data: data[s.field],
    label: s.label,
    color: s.color,
  }));

  return {
    status: "ready",
    categories: data.labels.length,
    muiSeries,
    active,
  };
}

export function usePrecipChartModel({ loading, data, visible }) {
  /* `visible` is rebuilt by the caller on every render, so memoise on its
     values rather than on its identity. */
  const { max, avg, min } = visible || {};
  return useMemo(
    () => buildPrecipChartModel({ loading, data, visible: { max, avg, min } }),
    [loading, data, max, avg, min]
  );
}
