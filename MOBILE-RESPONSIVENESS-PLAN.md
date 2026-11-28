<!-- Done by Astra -->
# Mobile Responsiveness Plan

Status: planning complete; implementation not started by this task.
Updated: 2026-09-15. Checkout: `95e363e` on `mr/main/working`, with existing uncommitted changes.

## Goal And Scope

Make all existing portal workflows usable on phones and tablets without losing desktop functionality, branding, scientific calculations, or export formats. Substantial mobile layout changes are allowed. Keep the existing React 17, Ant Design, Bootstrap, MUI charts, and ArcGIS architecture; a framework rewrite or upgrade is not a prerequisite.

Cover navigation, map controls, road/station details, charts, data filtering/downloads, content pages, and existing account workflows. Do not invent dashboard functionality, change scientific algorithms, deploy, or make live account/data mutations as part of a responsive audit.

Implementation order: reproduce -> trustworthy tests -> shared layout -> parallel page fixes -> integrated release checks. Each fix gets a narrow behavioral check immediately after editing, before another area is changed.

## Evidence And Known Risks

Source findings below identify implementation risks, not proof that every corresponding interaction currently fails on a phone.

| Area | Evidence | Consequence To Test |
| --- | --- | --- |
| Global overflow | [Root styles](ui/src/index.css) hide horizontal body overflow. | Screenshots can conceal clipped content. Measure with the mask temporarily disabled; remove it permanently only after fixing causes. |
| Shared navigation | [NavigationBar](ui/src/components/Global/NavigationBar/index.jsx) disables automatic menu overflow; [Footer styles](ui/src/components/Global/Footer/styles.css) duplicate navbar selectors. | Links may become inaccessible at intermediate widths; validate actual computed styles in dev and production builds. |
| Dialog cascade | [Map styles](ui/src/components/Map/styles.css) include global Bootstrap modal selectors. | Map-specific sizing can affect account/content dialogs. Scope these rules before independent dialog changes. |
| Map sizing | [Map](ui/src/components/Map/Map.jsx) selects initial panel expansion from window width. | Test rotation and container resizing without losing selection or overriding the user's panel choices. |
| Chart gestures | [Gesture hook](ui/src/hooks/usePinchZoomYears.js) cancels touch events; the map chart uses `touch-action: none`. | Scrolling/browser zoom and chart manipulation need an explicit, tested interaction policy. |
| Audit gate | [Collector](ui/scripts/responsive-audit.mjs) audits initial routes in Chromium; [comparator](ui/scripts/audit-compare.mjs) primarily checks new selectors. | Missing cases, readiness failures, console errors, and worsening existing defects can evade the current gate. |

Historical [baseline](ui/audit/baseline/report.json) and [current report](ui/audit/current/report.json) exist. Their run provenance is unknown; preserve both. A sampled 360px homepage differs between reports, so neither establishes success for this checkout.

### Live Observation On 2026-09-15

The shared page at `http://localhost:3010/map` is accessible through this session's integrated browser tools. Its screenshot showed navigation and map controls but a blank map area. Browser events also reported a weather request ending in `undefined_e.json`, CORS/fetch failure, and a duplicate mobile-menu key warning. The weather failure is not yet established as the cause of the blank map.

A subsequent measurement at a 390x844 browser viewport returned a document client width of 375px and scroll width of 433px: 58px of horizontal overflow relative to the document's content area. A Vite client script was present. The browser reported zero touch points and a non-coarse pointer, so this confirms a narrow-layout defect, not mobile touch behavior. The canvas had a 300x150 bitmap displayed at 375x709 CSS pixels; canvas existence alone does not establish successful map rendering.

This is a limited observation, not a completed mobile audit. A two-viewport check was interrupted by navigation and yielded no completed comparison. Map readiness, desktop geometry, interactive dialogs, touch behavior, exact source/build identity, and cross-browser results still need verification. Browser access is no longer blocked; the separate Playwright MCP server's runtime status has not been established.

## Phase 0: Reproduce Reliably

1. Preserve the dirty worktree and existing audit artifacts. Confirm the server on port 3010 serves this checkout, its build mode, and its API targets. Some UI requests target remote services even when the UI runs locally.
2. Capture normal screenshots and separate unmasked overflow measurements at phone and desktop sizes. Use new run-specific output directories, never overwrite historical reports during investigation.
3. Record timestamp, commit plus dirty-source identity, URL, build mode, browser/version, viewport, touch/mobile flags, and data/fixture revision. Resizing a desktop browser is layout testing, not actual touch-device emulation.
4. Reproduce map readiness and the failing weather request separately. Distinguish network/data failures from CSS defects; never accept an empty map just because a canvas, SVG, or control exists.
5. Build a defect list with route, state, browser, dimensions, expected/actual behavior, screenshot, severity, and controlling component. Audit desktop at the same time to establish protection for current behavior.

Exit: repeatable reference evidence for navigation, map, and download journeys; blocked states recorded explicitly. A failed external service must not silently turn a required test into a pass.

## Phase 1: Tests And Shared Foundations

After reference capture, two owners can work in parallel with separate files.

### Owner A: Trustworthy Test Gate

- First implementation slice: add focused native Node test fixtures and strengthen the comparator. Hypothesis: an incomplete run or a known-selector regression can currently report success. Discriminating checks: remove an expected route, add a fatal page error, and increase overflow on an existing selector; each must fail the gate. Run these tests immediately after the first edit.
- Validate expected route/state/browser/viewport coverage, report schema and comparable run identities. Reject missing, unexpected, redirected, and unready required cases. Baseline creation/update must be a separate explicit review action.
- Check page-level overflow and severity changes, not just new selector names. Preserve selector telemetry, but confirm effective hit targets with browser hit testing and semantic locators instead of treating geometry heuristics as definitive accessibility results.
- Record console errors, uncaught exceptions, and relevant request failures. Separate application failures from narrowly documented third-party warnings; no broad ignore-all allowlist.
- Add Playwright Test and axe integration only after checking installed versions and the repository's dependency/lockfile practice. Reuse the current collector where practical.
- Use role/name locators, real readiness signals, deterministic API fixtures, and screenshot assertions alongside behavioral assertions. Do not use screenshots as the only gate or fixed sleeps as readiness.
- Add phone Chromium and WebKit, tablet touch, and desktop Chromium/Firefox projects. An iPhone user agent in Chromium is not Safari testing; desktop WebKit does not certify physical iPhone behavior.
- Cover menus, feature selection, normal/enlarged dialogs, chart range/reset controls, download completion, and form loading/validation/error states. Fixtures must not send real registration emails or mutate production data.

### Owner B: Shared Layout And Interaction

- Introduce a small shared token/utility layer, deterministic imports, and reactive breakpoint helpers. Preserve existing visual identity. Use semantic rem typography, not viewport-scaled fonts; verify text resizing separately.
- Prefer intrinsic layout: wrapping flex, `min-width: 0`, `minmax(0, 1fr)`, bounded widths, logical properties, and content-driven heights. Use container queries only where a component genuinely depends on its available space, with appropriate fallback.
- Centralize existing canonical thresholds: 576, 768, 992, 1200, 1400. Account for Ant Design's differing upper breakpoint instead of assuming all names map identically. Keep pointer/hover capability separate from width.
- Centralize dynamic/stable viewport-height scalars with fallbacks: dynamic height for dialogs/content, stable height for the map. Test browser chrome movement; do not scatter raw viewport units through components.
- Add safe-area padding where needed and test viewport-fit behavior. Keep native browser zoom enabled. Do not introduce global VisualViewport workarounds without reproducing a specific keyboard/occlusion defect.
- Target real 44x44 CSS-pixel boxes and nominal 8px clearance for standalone controls. This is a project usability target, not the universal WCAG AA minimum. Document inline-link and vendor exceptions; avoid overlapping pseudo-element hit areas.
- Provide visible keyboard focus, accessible names, touch/focus access to hover information, readable disabled explanations, and reduced-motion behavior. Reuse existing library controls and icons.
- Own NavigationBar and Footer together: resolve duplicated selectors, retain intended desktop appearance, make mobile menu open/close and route transitions reliable, and give the footer content-driven height. Check logo/text fit and keyboard focus restoration.
- Scope Map's global modal CSS as a coordinated shared fix. Verify a map dialog and a non-map dialog in both dev and built CSS before handing the map stylesheet to its next owner.

Exit: reliable test failures, shared conventions implemented, touched states pass phone and desktop checks. Do not remove the global overflow mask yet.

## Phase 2: Parallel Workflow Fixes

Start when shared styles are stable. Assign exclusive ownership; no simultaneous edits to Map, root styles, or test configuration.

| Owner | Files/Area | Work And Focused Verification |
| --- | --- | --- |
| Map and charts | [Map component](ui/src/components/Map/Map.jsx), [map styles](ui/src/components/Map/styles.css), [gesture hook](ui/src/hooks/usePinchZoomYears.js) | Bounded phone detail dialogs with reachable close/actions, focus trapping/restoration, and deliberate scrolling. Size charts from containers; adapt axes/legends without changing scientific meaning. Observe container/breakpoint changes with cleanup; do not recreate MapView on every resize. Preserve feature, range, and explicit panel state across rotation. Verify nonblank map rendering, layer readiness, canvas pixel variation, selection, pan/zoom, dialogs, and chart controls. |
| Download and data | [Download page](ui/src/pages/Download/index.jsx), [download styles](ui/src/pages/Download/styles.css) | Responsive filters and previews; preserve dependent selection resets and CSV behavior. Test long names, empty/loading/error states, filter changes, and downloaded filename/columns/rows. Keep legitimately wide tables in accessible local scroll containers. |
| Account forms | [Login components](ui/src/components/Login), route wrappers as needed | Bounded full-width forms, labels, autocomplete/input modes, readable input text, wrapping validation messages, visible submit controls, keyboard-safe layout, and status announcements. Preserve existing request and redirect behavior; do not add new dashboard functionality. |
| Content | [Pages](ui/src/pages), page-owned components | Content-driven grids/bands, fitting headings, responsive existing images with intrinsic dimensions, bounded embeds, accessible links, and usable article dialogs. Shared banners remain with the foundation owner until explicitly handed off. Cross-origin iframe internals cannot be repaired with local CSS. |

Chart gesture decision: preserve vertical reading scroll and native page zoom by default; offer explicit accessible range/zoom/reset controls. Evaluate Pointer Events and `touch-action` together. A CSS class alone cannot repair the existing canceling touch listeners. Any dedicated chart-manipulation mode needs an obvious exit and equivalent non-gesture controls. Test pointer cancellation, multitouch transitions, finite/clamped ranges, and cleanup.

Each owner: reproduce one failure -> smallest grounded edit -> immediate focused test -> next issue. The integrator verifies the combined changes after each ownership handoff. Test-only work may proceed in parallel with feature work using separate artifacts and browser contexts.

## Phase 3: Integrated Verification And Release Gates

- Run the complete matrix against local Vite and a production build of the same checkout. Check cascade-sensitive navigation/dialogs before claiming parity; staging is an additional integration check, not a substitute for testing the local build.
- Remove the body overflow mask only after the causes are fixed. Immediately recheck sticky layouts, navigation, map sizing, and modal scrolling, then rerun the full matrix.
- Phone widths: 360, 390, 414; add 320 CSS-pixel reflow. Tablets: 768x1024 and 1024x768. Desktop: 1280x800, 1440x900, 1920x1080. Include short-height landscape.
- Sweep just below/at 576, 768, 992, 1200, and 1400; retain checks around legacy breakpoints until their rules are reconciled.
- Test 200% text sizing, 400% browser zoom/reflow where applicable, keyboard-only operation, focus order, contrast, reduced motion, and accessible status/error messages. Device pixel ratio does not substitute for text or browser zoom.
- Follow up on physical iPhone Safari and Android Chrome for virtual keyboards, browser chrome, notches/safe areas, and multitouch. Hosted real devices are optional when physical devices are unavailable, not a prerequisite to initial fixes.
- Measure performance before optimizing: traces for slow data, CPU pressure, layout shifts, and unresponsive map/chart controls. Reserve media space, deliver appropriate image sizes, and defer noncritical work only where measurements justify it. Track LCP <=2.5s, INP <=200ms, and CLS <=0.1 in representative field data where available; a single lab run cannot certify these field outcomes.
- Add deterministic PR build/responsive/accessibility checks with screenshots, traces, and bounded artifact retention. Use a fast PR matrix and broader cross-browser/boundary checks nightly or before release. Required branch-protection checks require separate repository configuration.
- Smoke-test a confirmed staging URL/build with read-only actions. Keep credentials, auth state, and personal data out of source, screenshots, logs, and shared artifacts.
- Update the existing mobile-audit skill to the implemented token, gesture, and gate behavior. Consider a narrowly scoped always-applied UI instruction only if drift persists; do not maintain conflicting copies of the same guidance.

## Tools And Parallel Execution

No additional MCP server is required to begin. Integrated browser tools now work; retain the existing [MCP configuration](.mcp.json) and diagnose its runtime only if that separate server is needed. Check versions before provisioning browser binaries and pin a tested configuration rather than assuming `latest` remains compatible.

Browser automation belongs in version-controlled Playwright tests for repeatability, with interactive browser tools for investigation. Add axe as a test dependency, not a new server. Lighthouse/browser traces are diagnostics. Paid device services, analytics vendors, PWA/offline support, and a framework migration are outside the initial scope.

Parallel schedule:

1. Evidence gathering: mobile investigator, desktop investigator, and read-only test/source review, each with a separate context or explicit shared-page ownership.
2. Foundation: test-gate owner and shared-layout owner with disjoint files.
3. Workflow repairs: map, download, account, and content owners after shared CSS handoff.
4. Integration: one owner combines changes, runs production-build checks, and reviews baseline changes. Browser/route jobs may be sharded with conservative worker counts for ArcGIS.

Never let two agents navigate/resize the same shared browser page or edit the same file concurrently. Do not auto-approve snapshots or replace failing baselines to make the gate green.

## Commands For The Existing Harness

Run from `ui/`, after confirming the target server and its build identity. Choose fresh output directories for every run:

```bash
BASE_URL=http://localhost:3010 ROUTES=/map MODE=phone UNMASK=1 SHOTS=1 OUT=audit/review-20260915-map-01 node scripts/responsive-audit.mjs
BASE_URL=http://localhost:3010 MODE=phone UNMASK=1 SHOTS=1 OUT=audit/review-20260915-phone-01 node scripts/responsive-audit.mjs
BASE_URL=http://localhost:3010 MODE=boundary UNMASK=1 OUT=audit/review-20260915-boundary-01 node scripts/responsive-audit.mjs
```

These are existing diagnostic commands, not proof of coverage beyond the current harness. Its present comparator is insufficient as the sole release gate. After gate tests and browser projects are implemented, run their focused tests after every touched slice. Before integration approval, build and serve a local production artifact on an unused port, then repeat the relevant checks against it.

## Definition Of Done

- Every required route/state/browser/viewport case executes or is explicitly reported blocked; no silent omissions or empty-page passes.
- No unintended page-level horizontal overflow greater than 1 CSS pixel or clipped essential controls; intentional map/table scrolling remains locally accessible.
- Primary app-owned controls meet the agreed touch policy, have accessible names, visible focus, and no overlapping hit regions. Existing serious/critical accessibility findings are triaged; no new attributable serious/critical axe violations are accepted.
- Map content is nonblank and interactive; feature details, charts, scrolling, closing, zoom, and rotation work without losing state or trapping page gestures.
- Downloads retain expected CSV output; forms and content dialogs remain usable in normal, loading, empty, and error states.
- Desktop functionality and reviewed composition are preserved; both dev and built CSS checks pass.
- Historical artifacts remain intact; baseline changes are reviewed, not automatically accepted. No new app runtime failures or unauthorized live writes.
- Staging and real-device checks not yet performed are disclosed, never marked passed. Performance claims distinguish lab measurements from field evidence.

## How You Can Help

1. Send two or three short phone recordings of the worst failures. Include device/browser, URL, portrait/landscape, action taken, and what you expected. Hide account details or private data. This helps prioritize, but is not a prerequisite to automated work.
2. Identify any desktop behavior that must remain visually unchanged, especially map panels, charts, and download steps.
3. Confirm the staging URL and expected build when staging checks begin. Supply a dedicated test account only if a protected flow needs it, through local/CI secrets, never chat.
4. Review the first proposed phone navigation and map-detail layouts. The key product choice is which actions stay immediately visible on a small screen.
5. Later, spend a short session on a physical iPhone and Android device checking menu taps, map details, chart scrolling, downloads, rotation, and keyboard visibility. Report problems with recordings; do not expose a dev server publicly just to test a phone.

## Change Attribution

Label hand-authored implementation blocks with the requested attribution, once per logical change:

- JavaScript: `//Done by Astra`
- JSX: `{/* Done by Astra */}`
- CSS: `/* Done by Astra */`
- HTML/Markdown: `<!-- Done by Astra -->`
- YAML: `# Done by Astra`

Do not insert comments into strict JSON, lockfiles, generated reports, or build output. Record their attribution in adjacent change notes instead. Preserve existing user edits and avoid unrelated cleanup, commits, or branch creation.
