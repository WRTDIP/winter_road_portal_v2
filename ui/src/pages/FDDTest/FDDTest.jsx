import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { LineChart } from "@mui/x-charts/LineChart";
import useMediaQuery from "@mui/material/useMediaQuery";
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import YearRangeSlider from "../../components/YearRangeSlider/YearRangeSlider";
import usePinchZoomYears from "../../hooks/usePinchZoomYears";

const API_BASE = "https://dev-moh.wramp.ca/python-api";

function FDDTest() {
  const [stations, setStations] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [stationId, setStationId] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [fromYear, setFromYear] = useState(1951);
  const [toYear, setToYear] = useState(2023);
  const [fddData, setFddData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewRange, setViewRange] = useState([1951, 2023]);
  const [showLowess, setShowLowess] = useState(false);
  const [lowessData, setLowessData] = useState(null);
  const isMobile = useMediaQuery("(max-width:768px)");

  useEffect(() => {
    fetch(`${API_BASE}/stations`)
      .then((r) => r.json())
      .then((json) => {
        setStations(json.data || []);
      })
      .catch((err) => setError("Failed to load stations: " + err.message));
  }, []);

  useEffect(() => {
    if (!stationId) {
      setDatasets([]);
      setDatasetId("");
      return;
    }
    fetch(`${API_BASE}/station-datasets?stationid=${stationId}`)
      .then((r) => r.json())
      .then((json) => {
        setDatasets(json.data || []);
        setDatasetId("");
      })
      .catch((err) => setError("Failed to load datasets: " + err.message));
  }, [stationId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stationId) return;

    setLoading(true);
    setError(null);
    setFddData(null);
    setLowessData(null);

    let url = `${API_BASE}/fdd?fromyear=${fromYear}&toyear=${toYear}&stationid=${stationId}`;
    if (datasetId) {
      url += `&dataset_id=${datasetId}`;
    }

    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        const rows = json.data || [];
        // Data comes as [fdd_year, total_fdd] tuples
        const years = rows.map((row) => row[0]);
        const fdds = rows.map((row) => parseFloat(row[1]));

        setFddData({ years, fdds });

        // Fetch LOWESS curve
        let lowessUrl = `${API_BASE}/lowess?fromyear=${fromYear}&toyear=${toYear}&stationid=${stationId}`;
        if (datasetId) {
          lowessUrl += `&dataset_id=${datasetId}`;
        }
        return fetch(lowessUrl).then((r) => r.json());
      })
      .then((json) => {
        if (json && json.data) {
          const rows = json.data;
          setLowessData({
            years: rows.map((row) => row[0]),
            fdds: rows.map((row) => row[1]),
          });
        }
      })
      .catch((err) => setError("Failed to fetch FDD data: " + err.message))
      .finally(() => setLoading(false));
  };

  const stationName =
    stations.find((s) => String(s[0]) === String(stationId))?.[1] || "";

  return (
    <div>
      <CoverBanner title="FDD Test" />
      <Container fluid style={{ padding: "2rem" }}>
        <Row className="mb-4">
          <Col md={6}>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Station</Form.Label>
                <Form.Select
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                >
                  <option value="">Select a station...</option>
                  {stations.map((s) => (
                    <option key={s[0]} value={s[0]}>
                      {s[1]} ({s[0]}) 
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Dataset</Form.Label>
                <Form.Select
                  value={datasetId}
                  onChange={(e) => setDatasetId(e.target.value)}
                >
                  <option value="">All datasets</option>
                  {datasets.map((d) => (
                    <option key={d[0]} value={d[0]}>
                      {d[1]}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>From Year</Form.Label>
                    <Form.Control
                      type="number"
                      value={fromYear}
                      onChange={(e) => setFromYear(Number(e.target.value))}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>To Year</Form.Label>
                    <Form.Control
                      type="number"
                      value={toYear}
                      onChange={(e) => setToYear(Number(e.target.value))}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button type="submit" variant="primary" disabled={loading || !stationId}>
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Loading...
                  </>
                ) : (
                  "Get FDD Data"
                )}
              </Button>
            </Form>
          </Col>
        </Row>

        {error && (
          <Row>
            <Col>
              <div className="alert alert-danger">{error}</div>
            </Col>
          </Row>
        )}

        {fddData && fddData.years.length > 0 && (
          <>
            <Row className="mb-3">
              <Col>
                <Form.Check
                  type="switch"
                  id="lowess-toggle"
                  label="Show LOWESS trend curve"
                  checked={showLowess}
                  onChange={(e) => setShowLowess(e.target.checked)}
                />
              </Col>
            </Row>
            <FDDChartSection
              fddData={fddData}
              lowessData={showLowess ? lowessData : null}
              stationName={stationName}
              viewRange={viewRange}
              setViewRange={setViewRange}
              isMobile={isMobile}
            />
          </>
        )}

        {fddData && fddData.years.length === 0 && (
          <Row>
            <Col>
              <div className="alert alert-warning">
                No FDD data found for the selected station and year range.
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

function FDDChartSection({ fddData, lowessData, stationName, viewRange, setViewRange, isMobile }) {
  const dataMin = fddData.years[0];
  const dataMax = fddData.years[fddData.years.length - 1];

  const fddMin = useMemo(() => Math.floor(Math.min(...fddData.fdds)), [fddData.fdds]);
  const fddMax = useMemo(() => Math.ceil(Math.max(...fddData.fdds)), [fddData.fdds]);

  const [yRange, setYRange] = useState([fddMin, fddMax]);

  // Sync viewRange with loaded data bounds
  useEffect(() => {
    setViewRange([dataMin, dataMax]);
  }, [dataMin, dataMax, setViewRange]);

  // Sync yRange with data bounds
  useEffect(() => {
    setYRange([fddMin, fddMax]);
  }, [fddMin, fddMax]);

  const filteredData = useMemo(() => {
    const startIdx = fddData.years.findIndex((y) => y >= viewRange[0]);
    const endIdx = fddData.years.findLastIndex((y) => y <= viewRange[1]);
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
      return { years: [], fdds: [] };
    }
    return {
      years: fddData.years.slice(startIdx, endIdx + 1),
      fdds: fddData.fdds.slice(startIdx, endIdx + 1),
    };
  }, [fddData, viewRange]);

  const filteredLowess = useMemo(() => {
    if (!lowessData) return null;
    const yearMap = {};
    lowessData.years.forEach((y, i) => { yearMap[y] = lowessData.fdds[i]; });
    return filteredData.years.map((y) => yearMap[y] ?? null);
  }, [lowessData, filteredData]);

  const chartSeries = useMemo(() => {
    const series = [{ data: filteredData.fdds, label: "FDDs", showMark: true }];
    if (filteredLowess) {
      series.push({
        data: filteredLowess,
        label: "LOWESS Trend",
        showMark: false,
        curve: "monotoneX",
        color: "#d32f2f",
        connectNulls: true,
      });
    }
    return series;
  }, [filteredData, filteredLowess]);

  const pinchRef = usePinchZoomYears(viewRange, setViewRange, dataMin, dataMax, {
    range: yRange,
    setRange: setYRange,
    min: fddMin,
    max: fddMax,
  });

  return (
    <Row>
      <Col>
        <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Freezing Degree Days
          {stationName && ` — ${stationName}`}
          {filteredData.years.length > 0 &&
            ` (${filteredData.years[0]}–${filteredData.years[filteredData.years.length - 1]})`}
        </h4>
        <YearRangeSlider
          value={viewRange}
          onChange={setViewRange}
          min={dataMin}
          max={dataMax}
        />
        <YearRangeSlider
          value={yRange}
          onChange={setYRange}
          min={fddMin}
          max={fddMax}
          label="FDD Range (°C·days)"
        />
        <div ref={pinchRef} style={{ touchAction: "none", overflow: "hidden" }}>
          {filteredData.years.length > 0 && (
            <LineChart
              xAxis={[{ data: filteredData.years, label: "Year", scaleType: "point" }]}
              yAxis={[{ min: yRange[0], max: yRange[1], label: "FDDs (°C·days)" }]}
              series={chartSeries}
              height={500}
            />
          )}
        </div>
        {isMobile && (
          <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#888", marginTop: "0.5rem" }}>
            Pinch to zoom · Swipe to pan
          </p>
        )}
      </Col>
    </Row>
  );
}

export default FDDTest;
