import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import { LineChart } from "@mui/x-charts/LineChart";
import "./styles.css";

const API_BASE = "https://dev-moh.wramp.ca/python-api";

// YELLOWKNIFE A, the station the map panel uses for Yellowknife.
const STATION_ID = 51058;
const STATION_NAME = "Yellowknife A";

const ANNUAL_COLOR = "#3f74c4";
const TREND_COLOR = "#d97706";

const fmt = (n) => Math.round(n).toLocaleString("en-CA");

/* A live freezing-degree-day series for one community, fetched the same way
   the map panel does it: the dataset with the most rows, annual values plus
   the LOWESS trend. The headline numbers are computed from that response. */
function FeaturedTrend() {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const getJson = (url) =>
      fetch(url).then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      });

    getJson(`${API_BASE}/station-datasets?stationid=${STATION_ID}`)
      .then((json) => {
        const datasets = json.data || [];
        if (!datasets.length) throw new Error("No dataset");
        const best = datasets.reduce((a, b) => (b[2] > a[2] ? b : a), datasets[0]);
        const query = `fromyear=1951&toyear=2023&stationid=${STATION_ID}&dataset_id=${best[0]}`;
        return Promise.all([
          getJson(`${API_BASE}/fdd?${query}`),
          getJson(`${API_BASE}/lowess?${query}`),
        ]).then(([fdd, lowess]) => ({ dataset: best[1], fdd: fdd.data || [], lowess: lowess.data || [] }));
      })
      .then(({ dataset, fdd, lowess }) => {
        if (cancelled) return;
        if (!fdd.length || !lowess.length) throw new Error("Empty series");
        setState({ status: "ready", dataset, fdd, lowess });
      })
      .catch(() => !cancelled && setState({ status: "error" }));

    return () => {
      cancelled = true;
    };
  }, []);

  const view = useMemo(() => {
    if (state.status !== "ready") return null;
    const trendByYear = new Map(state.lowess.map(([year, value]) => [year, Number(value)]));
    const years = state.fdd.map(([year]) => year);
    const annual = state.fdd.map(([, value]) => Number(value));
    const trend = years.map((year) => (trendByYear.has(year) ? trendByYear.get(year) : null));
    const first = state.lowess[0];
    const last = state.lowess[state.lowess.length - 1];
    const change = ((Number(last[1]) - Number(first[1])) / Number(first[1])) * 100;
    return { years, annual, trend, first, last, change };
  }, [state]);

  return (
    <section className="ui-section ui-section--tint featuredTrend" aria-labelledby="featured-trend-title">
      <div className="ui-container featuredTrend__grid">
        <div className="featuredTrend__copy">
          <span className="ui-eyebrow">Featured data</span>
          <h2 id="featured-trend-title">Freezing degree days at Yellowknife</h2>
          <p>
            Freezing degree days (FDDs) add up how far each day's mean temperature falls below
            0&nbsp;°C between September and May. Higher values mean a colder or longer winter,
            which is critical for ice road bearing capacity and construction scheduling.
          </p>

          {view && (
            <dl className="featuredTrend__stats">
              <div>
                <dt>Trend, {view.first[0]}</dt>
                <dd>{fmt(view.first[1])}</dd>
              </div>
              <div>
                <dt>Trend, {view.last[0]}</dt>
                <dd>{fmt(view.last[1])}</dd>
              </div>
              <div>
                <dt>Change</dt>
                <dd>
                  {view.change < 0 ? "−" : "+"}
                  {Math.abs(view.change).toFixed(0)}%
                </dd>
              </div>
            </dl>
          )}
          {view && (
            <p className="featuredTrend__note">
              Values in °C·days, read from the smoothed LOWESS trend.
            </p>
          )}

          <Link to="/map" className="ui-link">
            Explore any community on the map
            <ArrowRightOutlined aria-hidden="true" />
          </Link>
        </div>

        <figure className="featuredTrend__figure">
          <div className="featuredTrend__figureHead">
            <figcaption>Annual freezing degree days, September to May (°C·days)</figcaption>
            <ul className="featuredTrend__legend">
              <li>
                <span style={{ background: ANNUAL_COLOR }} aria-hidden="true" />
                Annual value
              </li>
              <li>
                <span style={{ background: TREND_COLOR }} aria-hidden="true" />
                LOWESS trend
              </li>
            </ul>
          </div>

          {state.status === "loading" && (
            <div className="featuredTrend__placeholder">Loading station data…</div>
          )}
          {state.status === "error" && (
            <div className="featuredTrend__placeholder">
              Station data is unavailable right now. The same series is on the map under
              Yellowknife.
            </div>
          )}
          {view && (
            <>
              <div className="featuredTrend__chart">
                <LineChart
                  height={300}
                  xAxis={[
                    {
                      data: view.years,
                      scaleType: "linear",
                      min: view.years[0],
                      max: view.years[view.years.length - 1],
                      valueFormatter: (year) => String(year),
                      tickMinStep: 10,
                    },
                  ]}
                  yAxis={[{ valueFormatter: (v) => `${(v / 1000).toFixed(1)}K` }]}
                  series={[
                    { id: "annual", data: view.annual, label: "Annual value", color: ANNUAL_COLOR, showMark: false },
                    {
                      id: "trend",
                      data: view.trend,
                      label: "LOWESS trend",
                      color: TREND_COLOR,
                      showMark: false,
                      connectNulls: true,
                    },
                  ]}
                  margin={{ left: 44, right: 12, top: 12, bottom: 28 }}
                  grid={{ horizontal: true }}
                  slotProps={{ legend: { hidden: true } }}
                  sx={{
                    "& .MuiLineElement-root": { strokeWidth: 2, strokeLinejoin: "round" },
                    "& .MuiChartsGrid-line": { stroke: "var(--c-border)" },
                    "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": { stroke: "var(--c-border)" },
                    "& .MuiChartsAxis-tickLabel": { fill: "var(--c-muted)" },
                  }}
                />
              </div>
              <p className="featuredTrend__source">
                Source: {state.dataset}, station {STATION_NAME} ({STATION_ID}), {view.years[0]}–
                {view.years[view.years.length - 1]}.
              </p>
              <details className="featuredTrend__table">
                <summary>Show the data as a table</summary>
                <div className="u-scroll-x">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Season</th>
                        <th scope="col">Annual (°C·days)</th>
                        <th scope="col">Trend (°C·days)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {view.years.map((year, i) => (
                        <tr key={year}>
                          <td>{year}</td>
                          <td>{fmt(view.annual[i])}</td>
                          <td>{view.trend[i] == null ? "—" : fmt(view.trend[i])}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          )}
        </figure>
      </div>
    </section>
  );
}

export default FeaturedTrend;
