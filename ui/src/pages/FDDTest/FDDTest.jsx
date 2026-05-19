import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { LineChart } from "@mui/x-charts/LineChart";
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";

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
          <Row>
            <Col>
              <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>
                Freezing Degree Days
                {stationName && ` — ${stationName}`}
                {` (${fddData.years[0]}–${fddData.years[fddData.years.length - 1]})`}
              </h4>
              <LineChart
                xAxis={[{ data: fddData.years, label: "Year", scaleType: "point" }]}
                series={[{ data: fddData.fdds, label: "FDDs", showMark: true }]}
                height={500}
              />
            </Col>
          </Row>
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

export default FDDTest;
