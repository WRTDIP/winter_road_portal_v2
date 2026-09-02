# Climate Data Importer

A single Python CLI (`climate_importer.py`) for downloading historical daily
climate data from Environment and Climate Change Canada (ECCC) and loading it
into PostgreSQL.

## What It Does

The tool handles three data sources. ECCC daily data and CanHomT V4 temperature
both write into `daily_data`; CanHomP V2 precipitation writes into
`precip_daily_data` / `precip_monthly_data` (each row tagged with a
`dataset_id`):

1. **ECCC daily data** – one CSV per station containing every available year.
2. **CanHomT V4 homogenized daily temperature** – a single `.tar.gz` archive of
   per-station CSVs (max/min/mean temperature), downloaded, extracted, and
   loaded directly.
3. **CanHomP V2 homogenized precipitation** – two zip archives (daily and
   monthly) of fixed-width per-station text files, downloaded, extracted, and
   loaded directly.

Commands:

| Command | Purpose |
|---------|---------|
| `list` | List stations for one or more provinces/territories. |
| `coverage` | Show the daily/hourly/monthly year ranges per station. |
| `download` | Bulk-download ECCC daily CSVs (one file per station). |
| `dbload` | Create tables, upsert station metadata, and load ECCC CSVs. |
| `ahccd` | Download + load CanHomT V4 daily temperature. |
| `canhomp` | Download + load CanHomP V2 daily and monthly precipitation. |
| `populate` | One-shot: download ECCC data and load everything into the DB. |

> Database backup/restore lives in the separate `db_backup.py` utility.

### Data Sources

- Station inventory: `https://collaboration.cmc.ec.gc.ca/cmc/climate/Get_More_Data_Plus_de_donnees/Station%20Inventory%20EN.csv`
- ECCC bulk download: `https://climate.weather.gc.ca/climate_data/bulk_data_e.html`
- CanHomT V4 daily temperature: `https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/CanHomTV4/CanHomT_dlyV4.tar.gz`
- CanHomP V2 precipitation (`CanHomPv2_Dly.zip`, `CanHomPv2_Mly.zip`):
  `https://data-donnees.az.ec.gc.ca/api/file?path=/climate/scientificknowledge/adjusted-and-homogenized-canadian-climate-data-ahccd/canadian-homogenized-precipitation/`

> Note: ECCC retired the old per-variable AHCCD daily `.dm`/zip downloads. Daily
> temperature is now published as CanHomT V4 and homogenized precipitation as
> CanHomP V2.

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

# Include CanHomP V2 daily + monthly precipitation as well:
python climate_importer.py populate -p NT YT NU --ahccd --canhomp \
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

### 6. Download and load CanHomP V2 precipitation

The `canhomp` command downloads the CanHomP V2 daily and monthly zip archives,
extracts the per-station fixed-width text files, and loads them into
`precip_daily_data` and `precip_monthly_data`. Files are named
`AdjTo_<climate_id>_dly.txt` / `AdjTo_<climate_id>_mly.txt`, so stations are
matched to `weather_stations` by Climate ID. Any Climate ID not yet in the
table is looked up in the ECCC station inventory and inserted automatically
(pass `--skip-new-stations` to skip those files instead).

```bash
# Download and load both daily and monthly precipitation
python climate_importer.py canhomp --dbname wramp --user postgres --password password

# Only one frequency
python climate_importer.py canhomp --kind monthly \
    --dbname wramp --user postgres --password password

# Reuse already-extracted files in ./canhomp instead of fetching
python climate_importer.py canhomp --no-download --out ./canhomp \
    --dbname wramp --user postgres --password password
```

Source values are stored in tenths of a millimetre with `-9999` for missing;
the importer converts them to millimetres and `NULL`. Dataset id `10` is the
daily archive, id `11` the monthly one.

| Source column | Table column |
|---------------|--------------|
| `HomP` / `flg` | homog_precip_mm (+ homog_precip_flag) |
| `GFQCdP` / `flg` | gapfill_precip_mm (+ gapfill_precip_flag) |
| `AdjP` | adj_precip_mm |
| `SourceClimID` | source_climate_id |

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
  daily temperature, id 10 = CanHomP V2 daily precipitation, id 11 = CanHomP V2
  monthly precipitation; pre-seeded by the tool).
- **`weather_stations`** – one row per station (`station_id` primary key, plus
  Climate/WMO/TC IDs, location, and per-frequency year ranges).
- **`daily_data`** – one row per station per day. Each measurement column has a
  matching `_flag` column. A unique constraint on `(station_id, obs_date)`
  makes re-imports idempotent.
- **`precip_daily_data`** – CanHomP V2 daily precipitation, unique on
  `(station_id, obs_date, dataset_id)`.
- **`precip_monthly_data`** – CanHomP V2 monthly precipitation, unique on
  `(station_id, year, month, dataset_id)`.

## Backup & Restore

```bash
# Export to a dated SQL dump
python db_backup.py export --output-dir ./backups

# Import a dump, skipping duplicates
python db_backup.py import --file 2026-05-19_wramp.sql
```
