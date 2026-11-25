import { Typography } from "@mui/material";

/* The non-chart states. Shared so a phone and a desktop never explain the same
   missing data in two different ways. */
export default function ChartMessage({ children }) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ py: 2, textAlign: "center" }}
    >
      {children}
    </Typography>
  );
}

export const FDD_MESSAGES = {
  loading: "Loading FDD data...",
  insufficient: "Not enough data points.",
  empty: "No FDDs data available for this location.",
  emptyRange: "No data in the selected year range.",
};

/* Renders whatever the model says instead of a chart, or null when the model
   has an actual chart to draw. Both variants call this first.

   `variant` is only stamped on the DOM: the message is deliberately identical
   in both layouts, and without the attribute a test could not tell which
   variant produced it. */
export function FddChartFallback({ model, variant }) {
  if (model.status === "ready") return null;
  return (
    <div className="wrtdip-fdd-fallback u-fit-width" data-variant={variant}>
      <ChartMessage>{FDD_MESSAGES[model.status]}</ChartMessage>
    </div>
  );
}
