import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Form, Button, Spinner, Alert, Table } from "react-bootstrap";
import Papa from "papaparse";
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import "./styles.css";

const API_BASE = "https://dev-moh.wramp.ca/python-api";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const VARIABLES = [
  { id: "temperature", label: "Temperature", unit: "daily max / min / mean, °C" },
  { id: "precipitation", label: "Precipitation", unit: "daily total precip / rain, mm" },
  { id: "snowfall", label: "Snowfall", unit: "daily snowfall / snow on ground, cm" },
];

const PREVIEW_ROWS = 10;

// The portal only covers the three northern territories, so the station list is
// narrowed to them even though the API returns stations for all of Canada.
const TERRITORIES = ["YUKON TERRITORY", "NORTHWEST TERRITORIES", "NUNAVUT"];

const isTerritoryStation = (s) =>
  TERRITORIES.includes(String(s[2] || "").trim().toUpperCase());

/**
 * One numbered section of the download wizard. Sections stay visible but dim
 * until the steps above them are answered, so the whole flow reads at a glance.
 */
const Step = ({ number, title, hint, locked, complete, summary, children }) => (
  <section
    className={[
      "downloadStep",
      locked ? "isLocked" : "",
      complete ? "isComplete" : "",
    ].join(" ").trim()}
  >
    <div className="downloadStepHeader">
      <span className="downloadStepNumber">{complete ? "✓" : number}</span>
      <h3 className="downloadStepTitle">{title}</h3>
      {summary && <span className="downloadStepSummary">{summary}</span>}
    </div>
    {hint && <p className="downloadStepHint">{hint}</p>}
    <fieldset disabled={locked} style={{ border: 0, padding: 0, margin: 0 }}>
      {children}
    </fieldset>
  </section>
);

function Download() {
  // Step 1 - station
  const [stations, setStations] = useState([]);
  const [stationFilter, setStationFilter] = useState("");
  const [stationId, setStationId] = useState("");

  // Step 2 - year and month
  const [months, setMonths] = useState([]);
  const [monthsLoading, setMonthsLoading] = useState(false);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  // Step 3 - variable
  const [variable, setVariable] = useState("");

  // Step 4 - dataset
  const [datasets, setDatasets] = useState([]);
  const [datasetsLoading, setDatasetsLoading] = useState(false);
  const [datasetId, setDatasetId] = useState("");

  // Step 5 - the data itself
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---- Step 1: load the territory stations once ---------------------------
  useEffect(() => {
    fetch(`${API_BASE}/stations`)
      .then((r) => r.json())
      .then((json) => setStations((json.data || []).filter(isTerritoryStation)))
      .catch((err) => setError("Failed to load stations: " + err.message));
  }, []);

  // ---- Step 2: which year/month pairs does this station actually have? -----
  useEffect(() => {
    setMonths([]);
    setYear("");
    setMonth("");
    if (!stationId) return;

    setMonthsLoading(true);
    setError(null);
    fetch(`${API_BASE}/station-months?stationid=${stationId}`)
      .then((r) => r.json())
      .then((json) => setMonths(json.data || []))
      .catch((err) => setError("Failed to load available dates: " + err.message))
      .finally(() => setMonthsLoading(false));
  }, [stationId]);

  // ---- Step 4: which datasets hold this variable for this month? -----------
  useEffect(() => {
    setDatasets([]);
    setDatasetId("");
    setResult(null);
    if (!stationId || !year || !month || !variable) return;

    setDatasetsLoading(true);
    setError(null);
    fetch(
      `${API_BASE}/monthly-datasets?stationid=${stationId}&year=${year}` +
        `&month=${month}&variable=${variable}`
    )
      .then((r) => r.json())
      .then((json) => {
        const ds = json.data || [];
        setDatasets(ds);
        // With a single source there is nothing to choose - pick it for them.
        if (ds.length === 1) setDatasetId(String(ds[0].id));
      })
      .catch((err) => setError("Failed to load datasets: " + err.message))
      .finally(() => setDatasetsLoading(false));
  }, [stationId, year, month, variable]);

  // A new dataset choice invalidates whatever was fetched before.
  useEffect(() => setResult(null), [datasetId]);

  const filteredStations = useMemo(() => {
    const q = stationFilter.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter(
      (s) =>
        String(s[1]).toLowerCase().includes(q) ||
        String(s[0]).includes(q) ||
        String(s[2] || "").toLowerCase().includes(q)
    );
  }, [stations, stationFilter]);

  const years = useMemo(
    () => [...new Set(months.map((m) => m.year))].sort((a, b) => b - a),
    [months]
  );

  const monthsForYear = useMemo(
    () => months.filter((m) => String(m.year) === String(year)),
    [months, year]
  );

  // Row counts for the chosen month, so each variable card can show its coverage.
  const selectedMonthCounts = useMemo(() => {
    const hit = monthsForYear.find((m) => String(m.month) === String(month));
    return hit ? hit.counts : null;
  }, [monthsForYear, month]);

  const station = useMemo(
    () => stations.find((s) => String(s[0]) === String(stationId)),
    [stations, stationId]
  );
  const stationName = station ? station[1] : "";

  const variableLabel =
    VARIABLES.find((v) => v.id === variable)?.label || "";

  const fileName = useMemo(() => {
    if (!stationId || !year || !month || !variable) return "";
    const slug = String(stationName || `station-${stationId}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const mm = String(month).padStart(2, "0");
    return `${slug}_${year}-${mm}_${variable}.csv`;
  }, [stationId, stationName, year, month, variable]);

  const ready = Boolean(stationId && year && month && variable && datasetId);

  const handleFetch = useCallback(() => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    setResult(null);

    fetch(
      `${API_BASE}/monthly-data?stationid=${stationId}&year=${year}` +
        `&month=${month}&variable=${variable}&dataset_id=${datasetId}`
    )
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.detail || `Request failed (${r.status})`);
        return json;
      })
      .then((json) => setResult(json))
      .catch((err) => setError("Failed to fetch data: " + err.message))
      .finally(() => setLoading(false));
  }, [ready, stationId, year, month, variable, datasetId]);

  // The CSV is built here in the browser from the JSON the API already returns,
  // so no export endpoint is needed.
  const handleDownload = useCallback(() => {
    if (!result || !result.rows.length) return;

    const csv = Papa.unparse({ fields: result.columns, data: result.rows });
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [result, fileName]);

  return (
    <div>
      <CoverBanner title="Download" />
      <Container fluid className="downloadPage">
        <div className="downloadInner">
          <p className="downloadIntro">
            Export a month of daily climate observations as a CSV file. Work through
            the steps below &mdash; pick a weather station, the month you want, and
            whether you need temperature, precipitation, or snowfall. The file is
            built in your browser from the portal database, so it downloads instantly.
          </p>

          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          {/* ---------------- Step 1: station ---------------- */}
          <Step
            number={1}
            title="Choose a weather station"
            hint="Stations in Yukon, the Northwest Territories, and Nunavut. Search by station name, territory, or station ID."
            complete={Boolean(stationId)}
            summary={stationId ? `${stationName} (${stationId})` : ""}
          >
            <Form.Control
              type="search"
              className="mb-2"
              placeholder="Filter stations…"
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
            />
            <Form.Select
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
            >
              <option value="">
                {stations.length
                  ? `Select a station… (${filteredStations.length} shown)`
                  : "Loading stations…"}
              </option>
              {filteredStations.map((s) => (
                <option key={s[0]} value={s[0]}>
                  {s[1]} ({s[0]})
                  {s[2] ? ` — ${s[2]}` : ""}
                </option>
              ))}
            </Form.Select>
          </Step>

          {/* ---------------- Step 2: year and month ---------------- */}
          <Step
            number={2}
            title="Choose a year and month"
            hint="Only periods this station recorded data for are listed."
            locked={!stationId}
            complete={Boolean(year && month)}
            summary={year && month ? `${MONTH_NAMES[month - 1]} ${year}` : ""}
          >
            {monthsLoading ? (
              <span>
                <Spinner animation="border" size="sm" /> Loading available dates…
              </span>
            ) : (
              <div className="d-flex flex-wrap gap-3">
                <Form.Group style={{ flex: "1 1 200px" }}>
                  <Form.Label>Year</Form.Label>
                  <Form.Select
                    value={year}
                    onChange={(e) => {
                      setYear(e.target.value);
                      setMonth("");
                    }}
                  >
                    <option value="">Select a year…</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group style={{ flex: "1 1 200px" }}>
                  <Form.Label>Month</Form.Label>
                  <Form.Select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    disabled={!year}
                  >
                    <option value="">Select a month…</option>
                    {monthsForYear.map((m) => (
                      <option key={m.month} value={m.month}>
                        {MONTH_NAMES[m.month - 1]}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            )}
            {stationId && !monthsLoading && years.length === 0 && (
              <Alert variant="warning" className="mt-3 mb-0">
                This station has no daily observations in the database.
              </Alert>
            )}
          </Step>

          {/* ---------------- Step 3: variable ---------------- */}
          <Step
            number={3}
            title="Choose the data to download"
            hint="The number of days on record for the selected month is shown on each option."
            locked={!month}
            complete={Boolean(variable)}
            summary={variableLabel}
          >
            <div className="downloadChoices">
              {VARIABLES.map((v) => {
                const count = selectedMonthCounts ? selectedMonthCounts[v.id] : 0;
                const empty = selectedMonthCounts != null && count === 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    className={[
                      "downloadChoice",
                      variable === v.id ? "isSelected" : "",
                    ].join(" ").trim()}
                    disabled={empty}
                    onClick={() => setVariable(v.id)}
                  >
                    <span className="downloadChoiceLabel">{v.label}</span>
                    <span className="downloadChoiceMeta">{v.unit}</span>
                    <br />
                    <span className="downloadChoiceMeta">
                      {empty
                        ? "no data for this month"
                        : `${count} day${count === 1 ? "" : "s"} on record`}
                    </span>
                  </button>
                );
              })}
            </div>
          </Step>

          {/* ---------------- Step 4: dataset ---------------- */}
          <Step
            number={4}
            title="Choose a dataset"
            hint="These are the sources holding this measurement for the month you picked."
            locked={!variable}
            complete={Boolean(datasetId)}
            summary={
              datasets.length === 1 && datasetId ? "only source available" : ""
            }
          >
            {datasetsLoading ? (
              <span>
                <Spinner animation="border" size="sm" /> Loading datasets…
              </span>
            ) : datasets.length === 0 ? (
              <p className="mb-0 downloadChoiceMeta">
                {variable
                  ? "No dataset holds this measurement for the selected month."
                  : "Choose a measurement first."}
              </p>
            ) : (
              <div className="downloadChoices">
                {datasets.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={[
                      "downloadChoice",
                      String(datasetId) === String(d.id) ? "isSelected" : "",
                    ].join(" ").trim()}
                    onClick={() => setDatasetId(String(d.id))}
                  >
                    <span className="downloadChoiceLabel">{d.name}</span>
                    <span className="downloadChoiceMeta">
                      {d.row_count} day{d.row_count === 1 ? "" : "s"} of data
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Step>

          {/* ---------------- Step 5: preview and download ---------------- */}
          <Step
            number={5}
            title="Preview and download"
            hint="Check the first few rows, then save the CSV."
            locked={!ready}
            complete={Boolean(result && result.rows.length)}
          >
            <Button variant="secondary" onClick={handleFetch} disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Loading…
                </>
              ) : result ? (
                "Refresh preview"
              ) : (
                "Preview data"
              )}
            </Button>

            {result && result.rows.length === 0 && (
              <Alert variant="warning" className="mt-3 mb-0">
                No rows were returned for this selection.
              </Alert>
            )}

            {result && result.rows.length > 0 && (
              <>
                <p className="mt-3 mb-2">
                  <strong>{result.rows.length}</strong> row
                  {result.rows.length === 1 ? "" : "s"} of {variableLabel.toLowerCase()}{" "}
                  data for {stationName}, {MONTH_NAMES[month - 1]} {year}.
                  {result.rows.length > PREVIEW_ROWS &&
                    ` Showing the first ${PREVIEW_ROWS}.`}
                </p>
                <div className="downloadPreviewWrapper">
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        {result.columns.map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.slice(0, PREVIEW_ROWS).map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j}>{cell === "" ? "—" : cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <div className="d-flex flex-wrap align-items-center gap-3 mt-3">
                  <Button variant="primary" onClick={handleDownload}>
                    Download CSV
                  </Button>
                  <span className="downloadFileName">{fileName}</span>
                </div>
              </>
            )}
          </Step>
        </div>
      </Container>
    </div>
  );
}

export default Download;
