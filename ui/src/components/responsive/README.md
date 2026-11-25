# Responsive component variants

CSS handles almost everything. Reach for this only when a phone needs a
component to be *shaped* differently, not just sized differently — a chart that
must drop its rotated axis label and re-thin its ticks, a toolbar that must
become a disclosure, a table that must become a list.

## The recipe

Three files per component, in the component's own folder:

```
FddChart/
  model.js              derivation shared by both variants — the numbers
  FddChartDesktop.jsx   the wide layout
  FddChartMobile.jsx    the narrow layout
  index.js              createResponsiveComponent({ desktop, mobile })
```

Shared sub-parts that both variants render go in the same folder — see
`PrecipChart/SeriesToggles.jsx`, which is how the two layouts cannot drift into
offering different series.

`index.js` is the whole wiring:

```js
import { createResponsiveComponent } from "../../../responsive";
import FddChartDesktop from "./FddChartDesktop.jsx";
import FddChartMobile from "./FddChartMobile.jsx";

export default createResponsiveComponent({
  desktop: FddChartDesktop,
  mobile: FddChartMobile,
  at: "md",            // mobile below 768px
  name: "FddChart",
});
```

Callers import the pair and never think about it again:

```jsx
<FddChart series={fddSeries} viewRange={range} onViewRangeChange={setRange} />
```

## Rules

**Put every calculation in `model.js`.** The two variants differ in layout, never
in what the numbers say. A value derived twice is a value that will disagree
with itself — and here that would mean two different answers to a scientific
question. `model.js` exports a pure builder plus a `useXModel` memo wrapper;
the variants only lay out what it returns.

**Lift all state to the caller.** Crossing the breakpoint unmounts one variant
and mounts the other, so any state held *inside* a variant is destroyed when the
phone rotates. Selected ranges, filters and toggles belong in the parent and
arrive as props. State that is genuinely presentational and variant-specific —
"is the mobile slider drawer open" — is fine to keep local, because the other
variant has no equivalent to preserve.

**Pick `at` from the canon.** `sm md lg xl xxl` = 576/768/992/1200/1400. `at`
means *mobile below this width*, matching `col-md-*`. Do not invent a value;
`useVariant` throws in dev if you do.

**Keep the prop contract identical.** Both variants take the same props, so the
caller is not aware of which one rendered. Diverging prop lists is how a
mobile-only bug gets in.

**Fit if you can, scroll locally if you cannot.** Fitting is the goal, but a
chart squeezed past legibility is worse than one the user swipes. See the
mobile-audit skill for the threshold. When a variant does scroll, the controls
belong outside the scroller, and the user gets a one-tap route to a view that
fits.

**A variant that fits the viewport must say so.** Wrappers in the map modal
force `min-width: 420px` on their chart child so wide desktop plots scroll
sideways instead of compressing. A mobile variant that has already laid itself
out for the screen carries `.u-fit-width` to opt out of that scroll.

## Testing both layouts

`ResponsiveVariantProvider` pins a subtree, so both layouts can be photographed
at one browser width and neither needs a real resize to reach:

```jsx
<ResponsiveVariantProvider variant="mobile">
  <FddChart {...props} />
</ResponsiveVariantProvider>
```

`FddChart.Mobile` and `FddChart.Desktop` are also exposed for rendering one
directly. The dev-only harness at `/dev/responsive` (see `src/dev/harness/`)
uses both, and `scripts/variant-shots.mjs` drives it across a viewport matrix.
