import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ResponsiveVariantProvider } from "../../components/responsive";
import "../../components/Map/styles.css";
import "./harness.css";
import CASES from "./cases.jsx";

/* Dev-only viewport harness for responsive component variants.

   Reaching the FDD chart in the real app means loading ArcGIS, waiting for a
   basemap and clicking a city marker — none of which a screenshot matrix can
   do reliably. This route renders the same component, in the same dialog
   chrome, with frozen data, so a run at 320px and a run at 1440px differ only
   in the thing being tested.

   /dev/responsive?case=fdd-single&variant=mobile
   /dev/responsive?case=all&variant=auto

   variant: auto (let the width decide) | mobile | desktop (pin it).
   Pinning is what lets both layouts be photographed at one width. */

function CaseCard({ testCase }) {
  return (
    <section className="harness-case" data-case={testCase.id}>
      <header className="harness-case__meta">
        <h2>{testCase.title}</h2>
        <p>{testCase.note}</p>
      </header>
      {/* The real container: same classes, so the same min-width rules, padding
          and max-width apply as in the map dialog. */}
      <div className="wrtdip-map-modal">
        <div className="wrtdip-map-modal__content">
          <div className="wrtdip-map-modal__body">
            <div className="wrtdip-map-modal__section">
              <div className="wrtdip-map-modal__chart" data-harness-chart={testCase.id}>
                {testCase.render()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ResponsiveHarness() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const variant = params.get("variant") || "auto";
  const requested = params.get("case") || CASES[0].id;
  const shown =
    requested === "all" ? CASES : CASES.filter((c) => c.id === requested);

  return (
    <ResponsiveVariantProvider variant={variant}>
      <main className="harness" data-variant={variant} data-ready="true">
        <h1 className="harness__title">Responsive harness</h1>
        <p className="harness__hint">
          variant=<code>{variant}</code> · case=<code>{requested}</code> · dev build only
        </p>
        {shown.length === 0 ? (
          <p className="harness__hint">
            No case named <code>{requested}</code>. Known:{" "}
            {CASES.map((c) => c.id).join(", ")}
          </p>
        ) : (
          shown.map((testCase) => <CaseCard key={testCase.id} testCase={testCase} />)
        )}
      </main>
    </ResponsiveVariantProvider>
  );
}
