import { BarChart } from "@mui/x-charts/BarChart";
import { Typography } from "@mui/material";
import SeriesToggles from "./SeriesToggles.jsx";
import { usePrecipChartModel } from "./model.js";

/* The wide layout, unchanged from the inline chart this was extracted from:
   full axis titles, a fixed 240px height, and one
   tick label per category. MUI's in-plot legend is off: the Max/Avg/Min
   switches above the chart already are the legend. The phone variant is the one that was redesigned. */
export default function PrecipChartDesktop(props) {
  const {
    visible, onVisibleChange, data, xAxisLabel, yAxisLabel, barGaps,
    loadingMessage, emptyMessage,
  } = props;

  const model = usePrecipChartModel(props);

  if (model.status === "loading") {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
        {loadingMessage}
      </Typography>
    );
  }
  if (model.status === "empty") {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <div data-variant="desktop">
      <SeriesToggles visible={visible} onVisibleChange={onVisibleChange} />
      <BarChart
        xAxis={[{
          data: data.labels,
          label: xAxisLabel,
          scaleType: "band",
          ...(barGaps || {}),
        }]}
        yAxis={[{ label: yAxisLabel }]}
        series={model.muiSeries}
        height={240}
        margin={{ left: 50, right: 10, top: 10, bottom: 40 }}
        slotProps={{ legend: { hidden: true } }}
        grid={{ horizontal: true }}
      />
    </div>
  );
}
