import { createResponsiveComponent } from "../../../responsive";
import FddChartDesktop from "./FddChartDesktop.jsx";
import FddChartMobile from "./FddChartMobile.jsx";

/* Below 768px the phone layout renders; at or above it, the original wide one.
   Both take the same props — see ./model.js for what they share and
   src/components/responsive/README.md for the pattern. */
const FddChart = createResponsiveComponent({
  desktop: FddChartDesktop,
  mobile: FddChartMobile,
  at: "md",
  name: "FddChart",
});

export default FddChart;
export { FddChartDesktop, FddChartMobile };
export * from "./model.js";
