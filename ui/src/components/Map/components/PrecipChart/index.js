import { createResponsiveComponent } from "../../../responsive";
import PrecipChartDesktop from "./PrecipChartDesktop.jsx";
import PrecipChartMobile from "./PrecipChartMobile.jsx";

/* Below 768px the phone layout renders; at or above it, the original wide one.
   Both take the same props — see ./model.js for what they share and
   src/components/responsive/README.md for the pattern.

   Not precipitation-specific despite the name: it draws any Max/Avg/Min bar
   series, which is also exactly what the snowfall panel beside it needs. */
const PrecipChart = createResponsiveComponent({
  desktop: PrecipChartDesktop,
  mobile: PrecipChartMobile,
  at: "md",
  name: "PrecipChart",
});

export default PrecipChart;
export { PrecipChartDesktop, PrecipChartMobile };
export * from "./model.js";
