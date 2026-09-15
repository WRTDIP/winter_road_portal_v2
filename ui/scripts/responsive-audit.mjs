/**
 * Responsive audit harness.
 *
 * Substitutes for the missing test suite. Loads every route at phone widths and
 * reports overflowing elements, undersized/crowded tap targets, iOS zoom-on-focus
 * risks, touch-inert `title=` affordances, and hover-only CSS rules.
 *
 *   BASE_URL=http://127.0.0.1:3000   target (use https://dev-moh.wramp.ca for prod build)
 *   OUT=audit/phase0                 output dir
 *   UNMASK=1                         neutralise body{overflow-x:hidden} (default on)
 *   MODE=phone|boundary              360/390/414, or the 12 breakpoint boundaries
 *   SHOTS=1                          also capture screenshots
 *   ROUTES=/,/map                    comma-separated subset
 */
import { chromium, devices } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE   = process.env.BASE_URL || "http://127.0.0.1:3000";
const OUT    = process.env.OUT      || "audit/current";
const UNMASK = process.env.UNMASK !== "0";
const SHOTS  = process.env.SHOTS === "1";
const MODE   = process.env.MODE || "phone";
// Every route renders the navbar and footer outside <Routes>, so a page that
// painted at all has dozens of elements under #root. Anything under this is a
// page that never rendered, and recording its empty result as a clean route is
// how a hole gets into the net.
const BLANK_MIN = 20;

const ALL_ROUTES = [
  "/", "/projects", "/about", "/map", "/transportation", "/observation",
  "/login", "/register", "/resend-email-validation", "/validate-email",
  "/dashboard", "/fdd-test", "/api", "/download", "/references", "/blog",
];
const ROUTES = process.env.ROUTES ? process.env.ROUTES.split(",") : ALL_ROUTES;

const SIZES = MODE === "boundary"
  ? [575, 576, 600, 640, 767, 768, 899, 900, 991, 992, 1199, 1200].map((w) => ({ w, h: 900 }))
  : [{ w: 360, h: 780 }, { w: 390, h: 844 }, { w: 414, h: 896 }];

const TOL = 1;
const TAP_MIN = 44;
const TAP_GAP = 8;

/* ------------------------------------------------------------------ in-page */
function collect({ TOL, TAP_MIN, TAP_GAP }) {
  // clientWidth, NOT innerWidth: innerWidth includes the scrollbar and produces
  // phantom ~15px overflows at desktop widths.
  const vw = document.documentElement.clientWidth;
  const out = {
    vw,
    pageScrollWidth: document.documentElement.scrollWidth,
    pageOverflows: document.documentElement.scrollWidth > vw + TOL,
    overflow: [], taps: [], tapCrowding: [], smallFonts: [],
    titleOnly: [], hoverWithoutTouch: [],
  };

  const label = (el) => {
    const bits = [];
    for (let n = el; n && n.nodeType === 1 && bits.length < 5; n = n.parentElement) {
      if (n.id) { bits.unshift(`${n.tagName.toLowerCase()}#${n.id}`); break; }
      let s = n.tagName.toLowerCase();
      if (n.classList.length) s += "." + [...n.classList].slice(0, 2).join(".");
      bits.unshift(s);
    }
    return bits.join(" > ");
  };

  // A wide child inside a horizontally clipping/scrolling ancestor is BY DESIGN
  // (see components/Map/styles.css:1553). Reporting it trains you to ignore the report.
  const inClipperX = (el) => {
    for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip") return true;
    }
    return false;
  };

  /* 1 — OVERFLOW */
  const flagged = new Set();
  for (const el of document.body.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;

    const overRight = r.right - vw;
    const overLeft = -r.left;
    if (overRight <= TOL && overLeft <= TOL) continue;
    if (inClipperX(el)) continue;

    // Report only the OUTERMOST offender in a chain — otherwise one bad container
    // yields hundreds of rows and the root cause is invisible.
    let redundant = false;
    for (let n = el.parentElement; n; n = n.parentElement) {
      if (flagged.has(n)) { redundant = true; break; }
    }
    flagged.add(el);
    if (redundant) continue;

    out.overflow.push({
      sel: label(el),
      left: +r.left.toFixed(1), right: +r.right.toFixed(1), width: +r.width.toFixed(1),
      overBy: +Math.max(overRight, overLeft).toFixed(1),
      position: cs.position,
      cssWidth: cs.width, minWidth: cs.minWidth, marginLeft: cs.marginLeft,
      fontSize: cs.fontSize,
      text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
    });
  }

  /* 2 — TAP TARGETS */
  const INTERACTIVE = [
    "a[href]", "button", "input:not([type=hidden])", "select", "textarea", "summary",
    "[role=button]", "[role=link]", "[role=checkbox]", "[role=tab]",
    "[role=menuitem]", "[role=slider]", "[role=switch]",
    '[tabindex]:not([tabindex="-1"])',
    ".ant-select-selector", ".ant-menu-item", ".ant-menu-submenu-title",
    ".MuiSlider-thumb", ".MuiIconButton-root",
  ].join(",");

  // .u-tap expands the hit area with an absolutely-positioned ::after that
  // getBoundingClientRect() cannot see. Without this, correctly-fixed targets
  // keep failing and the metric never reaches zero.
  const pseudoBox = (el, which) => {
    const p = getComputedStyle(el, which);
    if (!p || p.content === "none" || p.position !== "absolute") return null;
    const w = parseFloat(p.width), h = parseFloat(p.height);
    return Number.isFinite(w) && Number.isFinite(h) ? { w, h } : null;
  };

  const hitboxes = [];
  for (const el of document.querySelectorAll(INTERACTIVE)) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.pointerEvents === "none") continue;
    if (el.disabled) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    let w = r.width, h = r.height;
    for (const which of ["::after", "::before"]) {
      const p = pseudoBox(el, which);
      if (p) { w = Math.max(w, p.w); h = Math.max(h, p.h); }
    }
    const rec = {
      sel: label(el), w: +w.toFixed(1), h: +h.toFixed(1),
      x: Math.round(r.x), y: Math.round(r.y + window.scrollY),
      name: (el.getAttribute("aria-label") || el.textContent || el.value || "")
        .trim().replace(/\s+/g, " ").slice(0, 40),
    };
    hitboxes.push({ rec, r, w, h });
    if (w + 0.5 < TAP_MIN || h + 0.5 < TAP_MIN) out.taps.push(rec);
  }

  /* 2b — CROWDING. Two 44px targets 8px apart still fight each other; this is
     what catches the case where expanding both makes things worse. */
  for (let i = 0; i < hitboxes.length; i++) {
    for (let j = i + 1; j < hitboxes.length; j++) {
      const A = hitboxes[i], B = hitboxes[j];
      if (A.r.right < B.r.left - 40 || B.r.right < A.r.left - 40) continue;
      const gapX = Math.max(B.r.left - A.r.right, A.r.left - B.r.right);
      const gapY = Math.max(B.r.top - A.r.bottom, A.r.top - B.r.bottom);
      const gap = Math.max(gapX, gapY);
      if (gap >= 0 && gap < TAP_GAP) {
        out.tapCrowding.push({ a: A.rec.sel, b: B.rec.sel, gap: +gap.toFixed(1) });
      }
    }
  }

  /* 3 — iOS ZOOM-ON-FOCUS */
  for (const el of document.querySelectorAll("input,select,textarea")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const fs = parseFloat(cs.fontSize);
    if (fs < 16) out.smallFonts.push({ sel: label(el), fontSize: fs });
  }

  /* 4 — title= AS THE ONLY AFFORDANCE (never fires on touch or for keyboard) */
  for (const el of document.querySelectorAll("[title]")) {
    if (el.getAttribute("aria-label") || el.getAttribute("aria-describedby")) continue;
    const t = (el.getAttribute("title") || "").trim();
    if (!t) continue;
    out.titleOnly.push({ sel: label(el), title: t.slice(0, 60) });
  }

  /* 5 — HOVER-ONLY CSS. Walks the CSSOM for :hover rules with no :active /
     :focus-visible counterpart. Measures Phase 8 progress directly.

     A rule is reported even when its selector is not currently in the DOM
     ("dormant"): the Map's hover rules live inside a closed modal, and
     requiring DOM presence made this metric read a false zero. Vendor
     selectors are excluded — the kits own their own touch states. */
  const VENDOR = /^\.?(ant-|Mui|esri-|calcite|btn|nav-|dropdown-|carousel-|page-|form-|list-group|accordion-|navbar|modal-|close|alert-|badge|breadcrumb|card-|offcanvas|pagination|popover|progress|spinner|table|toast|tooltip|link-|text-|bg-|border-|ratio|blockquote|figure-|input-|col-|row|container)/;
  // ANY vendor class in the compound makes it the kit's rule, not ours:
  // ".ant-menu-item a:hover" is antd's to own, even though the "a" token
  // carries no class of its own.
  const isVendor = (base) =>
    base.split(/[\s>+~]+/).filter(Boolean).some((tok) =>
      (tok.match(/\.[A-Za-z0-9_-]+/g) || []).some((c) => VENDOR.test(c.slice(1)))
    );

  const hovers = new Map(), touchables = new Set();
  const walk = (rules) => {
    // Index loop + length check, deliberately. Chrome's CSS Nesting support gives
    // every CSSStyleRule a `cssRules` property holding an EMPTY BUT TRUTHY list,
    // so `if (r.cssRules) { recurse; continue; }` skips every style rule in the
    // sheet and this metric silently reports zero. Recurse on length, and read
    // selectorText first — a nested rule legitimately has both.
    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      const s = r.selectorText;
      if (r.cssRules && r.cssRules.length) walk(r.cssRules);
      if (!s) continue;
      for (const part of s.split(",").map((x) => x.trim())) {
        const base = part.replace(/:(hover|active|focus-visible|focus)\b/g, "").trim();
        if (!base) continue;
        if (part.includes(":hover") && !hovers.has(base)) hovers.set(base, part);
        if (part.includes(":active") || part.includes(":focus-visible")) touchables.add(base);
      }
    }
  };
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; } // cross-origin
    if (rules) walk(rules);
  }
  for (const [base, sel] of hovers) {
    if (touchables.has(base)) continue;
    if (isVendor(base)) continue;
    if (!/[.#]/.test(base)) continue;   // bare element rules (a:hover) are reboot
    let present = false;
    try { present = !!document.querySelector(base); } catch { continue; } // invalid selector
    out.hoverWithoutTouch.push({ sel, dormant: !present });
  }

  return out;
}

/* ------------------------------------------------------------------- driver */
const settle = async (page, route) => {
  await page.waitForLoadState("load").catch(() => {});
  if (route === "/map" || route === "/fdd-test") {
    // ArcGIS comes from the esri-loader CDN; networkidle never fires reliably.
    await page.waitForSelector(".esri-view, canvas, svg", { timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(5000);
  } else {
    await page.waitForTimeout(1500);
  }
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  // Force below-the-fold layout, then return to top so rects stay viewport-relative.
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  });
};

const browser = await chromium.launch();
const report = {};

for (const { w, h } of SIZES) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
    // isMobile + hasTouch make (hover:none) and (pointer:coarse) evaluate TRUE,
    // so the touch branches of base.css are what actually get measured.
    isMobile: MODE === "phone",
    hasTouch: MODE === "phone",
    userAgent: MODE === "phone" ? devices["iPhone 12"].userAgent : undefined,
    ignoreHTTPSErrors: true,
  });
  for (const route of ROUTES) {
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on("pageerror", (e) => consoleErrors.push(String(e).slice(0, 200)));
    try {
      await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 45000 });
      // Neutralise src/index.css:8 body{overflow-x:hidden} WITHOUT editing source.
      // This is the sequencing device: the mask stays in the app until Phase 6,
      // but every measurement from Phase 0 onward reflects the truth.
      if (UNMASK) {
        await page.addStyleTag({ content: "html, body { overflow-x: visible !important; }" });
      }
      await settle(page, route);
      const countDom = () =>
        page.evaluate(() => document.querySelectorAll("#root *").length);
      let domCount = await countDom();
      if (domCount < BLANK_MIN) {
        // The first run against a cold container routinely catches the
        // data-driven routes before they paint. Retry once rather than
        // recording zeros that would read as "this route is clean" forever.
        await page.reload({ waitUntil: "domcontentloaded", timeout: 45000 });
        if (UNMASK) {
          await page.addStyleTag({ content: "html, body { overflow-x: visible !important; }" });
        }
        await settle(page, route);
        domCount = await countDom();
      }
      const res = await page.evaluate(collect, { TOL, TAP_MIN, TAP_GAP });
      res.consoleErrors = consoleErrors;
      res.domCount = domCount;
      if (domCount < BLANK_MIN) {
        res.blank = true;
        console.log(`  !! ${w}${route} rendered ${domCount} elements - RESULT NOT TRUSTWORTHY`);
      }
      report[`${w}${route}`] = res;
      if (SHOTS) {
        const file = path.join(OUT, "shots", `${w}${route.replace(/\//g, "_") || "_root"}.png`);
        await fs.mkdir(path.dirname(file), { recursive: true });
        await page.screenshot({ path: file, fullPage: route !== "/map" });
      }
    } catch (e) {
      report[`${w}${route}`] = { error: String(e).slice(0, 300) };
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();

await fs.mkdir(OUT, { recursive: true });
await fs.writeFile(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));

let totOverflow = 0, totTaps = 0;
for (const [k, v] of Object.entries(report)) {
  if (v.error) { console.log(`${k.padEnd(34)} ERROR ${v.error}`); continue; }
  totOverflow += v.overflow.length;
  totTaps += v.taps.length;
  console.log(
    `${k.padEnd(34)} overflow:${String(v.overflow.length).padStart(3)}` +
    `  taps<44:${String(v.taps.length).padStart(3)}` +
    `  crowded:${String(v.tapCrowding.length).padStart(3)}` +
    `  fs<16:${String(v.smallFonts.length).padStart(3)}` +
    `  title:${String(v.titleOnly.length).padStart(3)}` +
    `  hoverOnly:${String(v.hoverWithoutTouch.length).padStart(3)}` +
    (v.pageOverflows ? `  PAGE_SCROLL_X(${v.pageScrollWidth}>${v.vw})` : "")
  );
  for (const o of v.overflow.slice(0, 5)) {
    console.log(`    +${o.overBy}px  ${o.sel}  [w:${o.cssWidth} minw:${o.minWidth} fs:${o.fontSize}] "${o.text}"`);
  }
}
console.log(`\nTOTAL overflow:${totOverflow}  taps<44:${totTaps}   -> ${path.join(OUT, "report.json")}`);
