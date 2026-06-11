# Climate Data Importer

A single Python CLI (`climate_importer.py`) for downloading historical daily
climate data from Environment and Climate Change Canada (ECCC) and loading it
into PostgreSQL.

## What It Does

The tool handles two data sources and writes both into the same `daily_data`
table (each row tagged with a `dataset_id`):

1. **ECCC daily data** – one CSV per station containing every available year.
2. **CanHomT V4 homogenized daily temperature** – a single `.tar.gz` archive of
   per-station CSVs (max/min/mean temperature), downloaded, extracted, and
   loaded directly.

Commands:

| Command | Purpose |
|---------|---------|
| `list` | List stations for one or more provinces/territories. |
| `coverage` | Show the daily/hourly/monthly year ranges per station. |
| `download` | Bulk-download ECCC daily CSVs (one file per station). |
| `dbload` | Create tables, upsert station metadata, and load ECCC CSVs. |
| `ahccd` | Download + load CanHomT V4 daily temperature. |
| `populate` | One-shot: download ECCC data and load everything into the DB. |

> Database backup/restore lives in the separate `db_backup.py` utility.

### Data Sources

- Station inventory: `https://collaboration.cmc.ec.gc.ca/cmc/climate/Get_More_Data_Plus_de_donnees/Station%20Inventory%20EN.csv`
- ECCC bulk download: `https://climate.weather.gc.ca/climate_data/bulk_data_e.html`
- CanHomT V4 daily temperature: `https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/CanHomTV4/CanHomT_dlyV4.tar.gz`

> Note: ECCC retired the old per-variable AHCCD daily `.dm`/zip downloads. Daily
> temperature is now published as CanHomT V4, and bulk *daily* precipitation
> (rain/snow/total precip) is no longer offered — only monthly precipitation
> remains — so only temperature is imported here.

## Installation

```bash
cd climatedataimporter
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

| Package | Purpose |
|---------|---------|
| `requests` | HTTP requests to ECCC APIs |
| `tqdm` | Progress bars |
| `psycopg[binary]` | PostgreSQL adapter (needed for `dbload`, `ahccd`, `populate`) |

## Quick Start

Populate the database for NWT, Yukon and Nunavut in one command:

```bash
python climate_importer.py populate -p NT YT NU \
    --dbname wramp --user postgres --password password --drop

# Include CanHomT V4 daily temperature as well:
python climate_importer.py populate -p NT YT NU --ahccd \
    --dbname wramp --user postgres --password password --drop
```

## Database Connection

All DB commands accept `--host --port --dbname --user --password --schema`, or
you can use the standard PostgreSQL environment variables:

```bash
export PGHOST=localhost PGPORT=5432 PGDATABASE=wramp PGUSER=postgres PGPASSWORD=password
```

## Step-by-Step Usage

### 1. List stations

```bash
python climate_importer.py list -p NT YT NU
```

### 2. Show data coverage

```bash
python climate_importer.py coverage -p NT YT NU
```

### 3. Download ECCC daily data

```bash
# All stations for NWT, Yukon, Nunavut into ./data
python climate_importer.py download -p NT YT NU --out ./data

# Specific stations by ID
python climate_importer.py download --station-id 1706 51058 --out ./data

# More parallel workers / force re-download
python climate_importer.py download -p NU --out ./data --workers 8 --overwrite
```

Each station produces one file, e.g. `YELLOWKNIFE_A_1706_daily_1942-2013.csv`.

### 4. Load ECCC data into PostgreSQL

```bash
python climate_importer.py dbload -p NT YT NU --data-dir ./data \
    --dbname wramp --user postgres --password password --drop
```

| Flag | Description |
|------|-------------|
| `--data-dir` / `-d` | Directory of downloaded daily CSVs (default: `./data`) |
| `--province` / `-p` | Restrict station metadata to these provinces (default: all) |
| `--drop` | Drop and recreate tables before loading |
| `--skip-data` | Only create tables + station metadata; skip CSV import |

### 5. Download and load CanHomT V4 daily temperature

The `ahccd` command downloads the CanHomT V4 archive, extracts the per-station
CSVs, and upserts max/min/mean temperature into `daily_data`. Each file is named
`<climate_id>.csv`, so stations are matched to `weather_stations` by Climate ID
— run `dbload` first to populate the stations table. Stations whose Climate ID
isn't present (e.g. outside your selected provinces) are skipped.

```bash
# Download and load all CanHomT V4 temperature data
python climate_importer.py ahccd --dbname wramp --user postgres --password password

# Reuse already-downloaded files in ./ahccd instead of fetching
python climate_importer.py ahccd --no-download --out ./ahccd \
    --dbname wramp --user postgres --password password

# Force a fresh re-download
python climate_importer.py ahccd --overwrite \
    --dbname wramp --user postgres --password password
```

The loaded columns map to dataset id `2` (CanHomT V4):

| Source column | daily_data column |
|---------------|-------------------|
| `tmax` | max_temp_c (+ max_temp_flag) |
| `tmin` | min_temp_c (+ min_temp_flag) |
| `tmean` | mean_temp_c (+ mean_temp_flag) |

## Province Codes

Standard two-letter codes and common aliases are accepted:

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

## Database Schema

See `documentation/db_schema.sql` for the full schema. Summary:

- **`datasets`** – one row per data source (id 1 = ECCC daily, id 2 = CanHomT V4
  daily temperature; pre-seeded by the tool).
- **`weather_stations`** – one row per station (`station_id` primary key, plus
  Climate/WMO/TC IDs, location, and per-frequency year ranges).
- **`daily_data`** – one row per station per day. Each measurement column has a
  matching `_flag` column. A unique constraint on `(station_id, obs_date)`
  makes re-imports idempotent.

## Backup & Restore

```bash
# Export to a dated SQL dump
python db_backup.py export --output-dir ./backups

# Import a dump, skipping duplicates
python db_backup.py import --file 2026-05-19_wramp.sql
```
