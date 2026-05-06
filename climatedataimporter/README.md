# Climate Data Importer

A Python CLI tool for downloading historical daily climate data from Environment and Climate Change Canada (ECCC) and optionally loading it into a PostgreSQL database.

## What It Does

- **List stations** – Query the ECCC station inventory and display all weather stations for one or more provinces/territories.
- **Show coverage** – Display the year ranges for which daily, hourly, and monthly data are available per station.
- **Download daily data** – Bulk-download daily climate observations as CSV files (one file per station, containing all available years).
- **Load into PostgreSQL** – Create a `weather_stations` metadata table and a `daily_data` observations table, then import downloaded CSVs.

### Data Source

All data comes from the Government of Canada's Historical Climate Data portal:

- Station inventory: `https://collaboration.cmc.ec.gc.ca/cmc/climate/Get_More_Data_Plus_de_donnees/Station%20Inventory%20EN.csv`
- Bulk download API: `https://climate.weather.gc.ca/climate_data/bulk_data_e.html`

## Installation

```bash
cd climatedataimporter
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Dependencies

| Package | Purpose |
|---------|---------|
| `requests` | HTTP requests to ECCC APIs |
| `tqdm` | Progress bars |
| `psycopg[binary]` | PostgreSQL adapter (only needed for `dbload`) |

## Usage

### 1. List Stations

```bash
python climate_importer.py list --province NT YT NU
```

Outputs a table of station IDs, Climate IDs, province, and station name.

### 2. Show Data Coverage

```bash
python climate_importer.py coverage --province NT YT NU
```

Displays per-station year ranges for daily, hourly, and monthly data.

### 3. Download Daily Data

```bash
# Download all daily CSVs for NWT, Yukon, and Nunavut
python climate_importer.py download --province NT YT NU --out ./data

# Download specific stations by ID
python climate_importer.py download --station-id 1706 51058 --out ./data

# Use more parallel workers (default: 4)
python climate_importer.py download --province NU --out ./data --workers 8

# Re-download even if files already exist
python climate_importer.py download --province NT --out ./data --overwrite
```

Each station produces one CSV file named like:
```
YELLOWKNIFE_A_1706_daily_1942-2013.csv
```

### 4. Load Into PostgreSQL

```bash
python climate_importer.py dbload \
    --data-dir ./data \
    --province NT YT NU \
    --host localhost \
    --port 5432 \
    --dbname climate \
    --user postgres \
    --password secret
```

#### Options

| Flag | Description |
|------|-------------|
| `--data-dir` / `-d` | Directory containing downloaded CSV files (default: `./data`) |
| `--province` / `-p` | Restrict station metadata to these provinces |
| `--host` | PostgreSQL host (default: `$PGHOST` or `localhost`) |
| `--port` | PostgreSQL port (default: `$PGPORT` or `5432`) |
| `--dbname` | Database name (default: `$PGDATABASE` or `postgres`) |
| `--user` | Database user (default: `$PGUSER` or `postgres`) |
| `--password` | Database password (default: `$PGPASSWORD` or empty) |
| `--schema` | Target schema (default: `public`) |
| `--drop` | Drop and recreate tables before loading |
| `--skip-data` | Only create tables and insert station metadata; skip CSV import |

#### Environment Variables

Instead of passing flags, you can set standard PostgreSQL env vars:

```bash
export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=climate
export PGUSER=postgres
export PGPASSWORD=secret
```

#### Database Schema

**`weather_stations`** – one row per station:

| Column | Type | Description |
|--------|------|-------------|
| station_id | INTEGER (PK) | ECCC station ID |
| name | TEXT | Station name |
| province | TEXT | Province / territory |
| climate_id | TEXT | Climate ID |
| wmo_id | TEXT | WMO identifier |
| tc_id | TEXT | Transport Canada ID |
| latitude | NUMERIC | Decimal degrees |
| longitude | NUMERIC | Decimal degrees |
| elevation_m | NUMERIC | Metres above sea level |
| first_year – last_year | INTEGER | Overall data range |
| hly_first_year – hly_last_year | INTEGER | Hourly data range |
| dly_first_year – dly_last_year | INTEGER | Daily data range |
| mly_first_year – mly_last_year | INTEGER | Monthly data range |

**`daily_data`** – one row per station per day:

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL (PK) | Auto-increment ID |
| station_id | INTEGER (FK) | References `weather_stations` |
| obs_date | DATE | Observation date |
| year, month, day | INTEGER | Date components |
| data_quality | TEXT | Quality flag |
| max_temp_c | NUMERIC | Maximum temperature (°C) |
| min_temp_c | NUMERIC | Minimum temperature (°C) |
| mean_temp_c | NUMERIC | Mean temperature (°C) |
| heat_deg_days_c | NUMERIC | Heating degree days |
| cool_deg_days_c | NUMERIC | Cooling degree days |
| total_rain_mm | NUMERIC | Total rainfall (mm) |
| total_snow_cm | NUMERIC | Total snowfall (cm) |
| total_precip_mm | NUMERIC | Total precipitation (mm) |
| snow_on_grnd_cm | NUMERIC | Snow on ground (cm) |
| dir_of_max_gust_10s_deg | NUMERIC | Direction of max gust (tens of degrees) |
| spd_of_max_gust_kmh | NUMERIC | Speed of max gust (km/h) |

Each numeric column has an associated `_flag` TEXT column. A unique constraint on `(station_id, obs_date)` ensures idempotent re-imports.

## Province Codes

The script accepts standard two-letter codes and common aliases:

| Code(s) | Province/Territory |
|---------|--------------------|
| NT, NWT | Northwest Territories |
| YT, YU | Yukon Territory |
| NU | Nunavut |
| AB | Alberta |
| BC | British Columbia |
| MB | Manitoba |
| NB | New Brunswick |
| NL, NF | Newfoundland |
| NS | Nova Scotia |
| ON | Ontario |
| PE, PEI | Prince Edward Island |
| QC | Quebec |
| SK | Saskatchewan |

## Full Workflow Example

```bash
# Install
pip install -r requirements.txt

# Check available stations
python climate_importer.py list --province NT YT NU

# Review date ranges
python climate_importer.py coverage --province NT YT NU

# Download everything
python climate_importer.py download --province NT YT NU --out ./data --workers 6

# Load into Postgres
python climate_importer.py dbload --province NT YT NU --data-dir ./data \
    --dbname climate --user postgres --password secret --drop
```
