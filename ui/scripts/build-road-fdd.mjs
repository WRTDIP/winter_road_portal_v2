/**
 * Precompute, for every winter road on the map, how its recorded opening date
 * relates to early-winter cold.
 *
 * For each named road in the Winter Roads feature layers this script:
 *   1. finds the road's recorded opening dates (python-api /road-closure-trend),
 *      one per season, keyed by the season's starting year;
 *   2. picks a weather station: the closest one to any point on the road, within
 *      MAX_DISTANCE_KM, that has enough complete seasons (else the one with the
 *      most);
 *   3. sums October-December freezing degree days (FDD) at that station for each
 *      season: sum of max(0, -daily mean temperature) from Oct 1 to Dec 31 of the
 *      season's starting year;
 *   4. reports the Spearman and Pearson correlations between FDD and opening day,
 *      and the Theil-Sen slope in days per 100 degree-days.
 *
 * A month counts only if it has fewer than 5 missing days and no run of 3 or more
 * missing days, and a season only if all three months count: the same quality
 * rule the map's FDD calculation notes describe.
 *
 * Writes src/components/Map/roadFddOpening.json for the map. Re-run when new
 * station or road data is loaded:
 *
 *   node scripts/build-road-fdd.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API_BASE = "https://dev-moh.wramp.ca/python-api";
const ROAD_LAYERS = [
  "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Winter_Roads_v1/FeatureServer/4",
  "https://services1.arcgis.com/9NvE8jKNWWlDGsUJ/arcgis/rest/services/Winter_Roads_v1/FeatureServer/1",
];
const TERRITORIES = ["YUKON TERRITORY", "NORTHWEST TERRITORIES", "NUNAVUT"];
const MAX_DISTANCE_KM = 150;
const MAX_CANDIDATES = 5;
const ENOUGH_SEASONS = 15;
const CONCURRENCY = 4;

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, "../src/components/Map/roadFddOpening.json");

// --- requests ------------------------------------------------------------------

let active = 0;
const waiting = [];
async function limited(task) {
  if (active >= CONCURRENCY) await new Promise((resolve) => waiting.push(resolve));
  active += 1;
  try {
    return await task();
  } finally {
    active -= 1;
    waiting.shift()?.();
  }
}

async function getJson(url, attempts = 3) {
  for (let i = 1; ; i += 1) {
    try {
      const res = await limited(() =>
        fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; wramp-road-fdd-script)" },
          signal: AbortSignal.timeout(60000),
        })
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i >= attempts) throw new Error(`${url}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
}

// --- geometry and names --------------------------------------------------------

const toRad = (d) => (d * Math.PI) / 180;
function distanceKm(lat1, lon1, lat2, lon2) {
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lon2 - lon1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

// Road names differ between the map layer and the closures table in accents,
// quote marks and a "(Highway #1)" suffix; compare them in a normal form.
const normalizeName = (s) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/\(highway #?\d+\)/i, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

// --- statistics ------------------------------------------------------------------

function lgamma(x) {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x;
  const t = x + 5.5 - (x + 0.5) * Math.log(x + 5.5);
  let s = 1.000000000190015;
  for (const ci of c) s += ci / ++y;
  return -t + Math.log((2.5066282746310005 * s) / x);
}

function betacf(a, b, x) {
  let c = 1;
  let d = 1 - ((a + b) * x) / (a + 1);
  d = 1 / (Math.abs(d) < 1e-30 ? 1e-30 : d);
  let h = d;
  for (let m = 1; m <= 200; m += 1) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1 + aa * d; d = 1 / (Math.abs(d) < 1e-30 ? 1e-30 : d);
    c = 1 + aa / c; c = Math.abs(c) < 1e-30 ? 1e-30 : c;
    h *= d * c;
    aa = (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1 + aa * d; d = 1 / (Math.abs(d) < 1e-30 ? 1e-30 : d);
    c = 1 + aa / c; c = Math.abs(c) < 1e-30 ? 1e-30 : c;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 3e-12) break;
  }
  return h;
}

function incompleteBeta(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
}

function correlation(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i += 1) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  const r = sxy / Math.sqrt(sxx * syy);
  const df = n - 2;
  const t2 = (r * r * df) / Math.max(1e-12, 1 - r * r);
  const p = incompleteBeta(df / 2, 0.5, df / (df + t2));
  return { r: round(r, 3), p: round(p, 4) };
}

function ranks(values) {
  const order = values.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  const out = new Array(values.length);
  for (let i = 0; i < order.length; ) {
    let j = i;
    while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j += 1;
    const rank = (i + j) / 2 + 1;
    for (let k = i; k <= j; k += 1) out[order[k][1]] = rank;
    i = j + 1;
  }
  return out;
}

const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

function theilSen(xs, ys) {
  const slopes = [];
  for (let i = 0; i < xs.length; i += 1) {
    for (let j = i + 1; j < xs.length; j += 1) {
      if (xs[j] !== xs[i]) slopes.push((ys[j] - ys[i]) / (xs[j] - xs[i]));
    }
  }
  const slope = median(slopes);
  const intercept = median(ys.map((y, i) => y - slope * xs[i]));
  return { slope, intercept };
}

const round = (v, digits) => Math.round(v * 10 ** digits) / 10 ** digits;

// --- inputs ------------------------------------------------------------------------

async function loadRoads() {
  const roads = new Map();
  for (const layer of ROAD_LAYERS) {
    const q = `${layer}/query?where=1%3D1&outFields=STREET&returnGeometry=true&outSR=4326&f=json`;
    const { features = [] } = await getJson(q);
    for (const f of features) {
      const name = f.attributes?.STREET;
      if (!name) continue;
      const road = roads.get(name) || { name, vertices: [] };
      road.vertices.push(...(f.geometry?.paths || []).flat());
      roads.set(name, road);
    }
  }
  return [...roads.values()];
}

async function loadStations() {
  const { data } = await getJson(`${API_BASE}/stations`);
  return data
    .filter((s) => TERRITORIES.includes(String(s[2]).toUpperCase()))
    .filter((s) => Number.isFinite(s[6]) && Number.isFinite(s[7]))
    .map((s) => {
      const years = s.slice(9).filter(Number.isFinite);
      return {
        id: s[0], name: s[1], lat: s[6], lon: s[7],
        firstYear: Math.min(...years, 9999), lastYear: Math.max(...years, 0),
      };
    });
}

async function loadClosureNames() {
  const { data } = await getJson(`${API_BASE}/road-closures`);
  return [...new Set(data.map((r) => r.road_name))];
}

// --- October-December FDD for one station and season ------------------------------

function monthIsValid(daysInMonth, meanByDay) {
  let missing = 0;
  let run = 0;
  for (let d = 1; d <= daysInMonth; d += 1) {
    if (meanByDay.has(d)) {
      run = 0;
    } else {
      missing += 1;
      run += 1;
      if (run >= 3) return false;
    }
  }
  return missing < 5;
}

const seasonCache = new Map();
function stationSeasonFdd(stationId, season) {
  const key = `${stationId}:${season}`;
  if (!seasonCache.has(key)) seasonCache.set(key, computeStationSeason(stationId, season));
  return seasonCache.get(key);
}

async function computeStationSeason(stationId, season) {
  let total = 0;
  for (const month of [10, 11, 12]) {
    const url = `${API_BASE}/monthly-data?stationid=${stationId}&year=${season}&month=${month}&variable=temperature`;
    let payload;
    try {
      payload = await getJson(url);
    } catch {
      return null;
    }
    const { columns = [], rows = [] } = payload;
    const iDay = columns.indexOf("Day");
    const iMean = columns.indexOf("Mean Temp (C)");
    const iSet = columns.indexOf("Dataset");

    // A month can hold rows from several datasets; use the one with the most
    // valid daily means (ECCC on a tie) so no day is counted twice.
    const bySet = new Map();
    for (const r of rows) {
      const mean = r[iMean];
      if (mean === "" || mean === null || !Number.isFinite(Number(mean))) continue;
      const set = r[iSet] || "unknown";
      if (!bySet.has(set)) bySet.set(set, new Map());
      bySet.get(set).set(Number(r[iDay]), Number(mean));
    }
    const best = [...bySet.entries()].sort(
      (a, b) => b[1].size - a[1].size || (b[0].startsWith("ECCC") ? 1 : 0) - (a[0].startsWith("ECCC") ? 1 : 0)
    )[0];
    const meanByDay = best ? best[1] : new Map();
    if (!monthIsValid(new Date(season, month, 0).getDate(), meanByDay)) return null;
    for (const mean of meanByDay.values()) total += Math.max(0, -mean);
  }
  return round(total, 1);
}

// --- one road --------------------------------------------------------------------------

async function analyseRoad(road, stations, closureNames) {
  const target = normalizeName(road.name);
  const dbName = closureNames.find((n) => normalizeName(n) === target);
  if (!dbName) return { status: "no-closure-records" };

  const trend = (await getJson(`${API_BASE}/road-closure-trend?road_name=${encodeURIComponent(dbName)}`)).data;
  const openings = (trend.open_scatter || []).filter((p) => Number.isFinite(p.y));
  if (openings.length < 5) return { status: "too-few-openings", closureName: dbName, openings: openings.length };

  const seasons = openings.map((p) => p.x);
  const candidates = stations
    .map((s) => ({ ...s, km: Math.min(...road.vertices.map(([lon, lat]) => distanceKm(lat, lon, s.lat, s.lon))) }))
    .filter((s) => s.km <= MAX_DISTANCE_KM && s.lastYear >= Math.min(...seasons) && s.firstYear <= Math.max(...seasons))
    .sort((a, b) => a.km - b.km)
    .slice(0, MAX_CANDIDATES);

  let chosen = null;
  for (const s of candidates) {
    const fdds = await Promise.all(
      openings.map((p) => (s.firstYear <= p.x && s.lastYear >= p.x ? stationSeasonFdd(s.id, p.x) : null))
    );
    const points = openings
      .map((p, i) => ({ season: p.x, fdd: fdds[i], openDay: p.y }))
      .filter((p) => p.fdd !== null);
    if (!chosen || points.length > chosen.points.length) chosen = { station: s, points };
    if (points.length >= ENOUGH_SEASONS) break;
  }
  if (!chosen || chosen.points.length < 5) {
    return { status: "too-few-fdd-seasons", closureName: dbName, openings: openings.length };
  }

  const xs = chosen.points.map((p) => p.fdd);
  const ys = chosen.points.map((p) => p.openDay);
  const fit = theilSen(xs, ys);
  return {
    status: "ok",
    closureName: dbName,
    station: { id: chosen.station.id, name: chosen.station.name, distanceKm: Math.round(chosen.station.km) },
    n: xs.length,
    seasonRange: [Math.min(...chosen.points.map((p) => p.season)), Math.max(...chosen.points.map((p) => p.season))],
    spearman: (() => { const c = correlation(ranks(xs), ranks(ys)); return { rho: c.r, p: c.p }; })(),
    pearson: correlation(xs, ys),
    slopeDaysPer100Fdd: round(fit.slope * 100, 2),
    intercept: round(fit.intercept, 2),
    points: chosen.points.sort((a, b) => a.season - b.season),
  };
}

// --- main ------------------------------------------------------------------------------

const [roads, stations, closureNames] = await Promise.all([loadRoads(), loadStations(), loadClosureNames()]);
console.log(`${roads.length} roads, ${stations.length} territory stations, ${closureNames.length} closure road names`);

const results = {};
await Promise.all(
  roads.map(async (road) => {
    try {
      results[road.name] = await analyseRoad(road, stations, closureNames);
    } catch (err) {
      results[road.name] = { status: "error", message: err.message };
    }
    const r = results[road.name];
    console.log(
      `  ${road.name}: ${r.status}` +
        (r.status === "ok" ? ` n=${r.n} rho=${r.spearman.rho} p=${r.spearman.p} station=${r.station.name} (${r.station.distanceKm} km)` : "")
    );
  })
);

const output = {
  generatedAt: new Date().toISOString().slice(0, 10),
  source: API_BASE,
  fddPeriod: "October 1 to December 31 of the season's starting year",
  openDay: "days since August 1 of the season's starting year",
  units: "°C·days",
  maxDistanceKm: MAX_DISTANCE_KM,
  roads: Object.fromEntries(Object.entries(results).sort(([a], [b]) => a.localeCompare(b))),
};

await fs.writeFile(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(`wrote ${path.relative(process.cwd(), OUT)}`);
