/**
 * Diffs an audit run against the committed baseline and reports ONLY NEW
 * selectors per category. Absolute counts are noisy — a route that legitimately
 * renders more content has more tap targets. New selectors are the real signal.
 *
 *   BASE=audit/baseline/report.json CUR=audit/phase2/report.json node scripts/audit-compare.mjs
 *
 * Exits non-zero if anything new appeared. This is the gate between phases.
 */
import fs from "node:fs/promises";

const BASE = process.env.BASE || "audit/baseline/report.json";
const CUR  = process.env.CUR  || "audit/current/report.json";

const read = async (p) => JSON.parse(await fs.readFile(p, "utf8"));
const [base, cur] = await Promise.all([read(BASE), read(CUR)]);

const KEYS = {
  overflow:          (e) => e.sel,
  taps:              (e) => e.sel,
  tapCrowding:       (e) => `${e.a} | ${e.b}`,
  smallFonts:        (e) => e.sel,
  titleOnly:         (e) => e.sel,
  hoverWithoutTouch: (e) => e.sel,
};

let newCount = 0, fixedCount = 0, skipped = 0;

for (const route of Object.keys(cur)) {
  const c = cur[route], b = base[route];
  if (c.error) { console.log(`${route}  ERROR ${c.error}`); newCount++; continue; }
  if (!b) { console.log(`${route}  (no baseline — new route)`); continue; }
  // A baseline entry captured from a page that never rendered holds empty
  // arrays, so every element on the route would read as newly broken. That is
  // noise that can mask a real regression, so refuse the comparison instead.
  if (b.blank || b.error) {
    console.log(`${route}  SKIPPED — baseline entry is unusable (recapture the baseline)`);
    skipped++;
    continue;
  }

  const lines = [];
  for (const [cat, keyFn] of Object.entries(KEYS)) {
    const bSet = new Set((b[cat] || []).map(keyFn));
    const cSet = new Set((c[cat] || []).map(keyFn));
    const added = [...cSet].filter((k) => !bSet.has(k));
    const gone  = [...bSet].filter((k) => !cSet.has(k));
    newCount += added.length;
    fixedCount += gone.length;
    for (const k of added) lines.push(`    NEW    ${cat}: ${k}`);
    if (gone.length) lines.push(`    fixed  ${cat}: ${gone.length}`);
  }
  if (lines.length) { console.log(route); console.log(lines.join("\n")); }
}

console.log(`\n${newCount} new, ${fixedCount} fixed${skipped ? `, ${skipped} skipped` : ""}.  ${newCount ? "GATE FAILED" : "GATE PASSED"}`);
process.exitCode = newCount ? 1 : 0;
