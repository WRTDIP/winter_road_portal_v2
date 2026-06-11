"""
Environment and Climate Change Canada (ECCC) Historical Climate Data Importer.

This script lets you:
  1. List all stations available for a given province/territory.
  2. Show the daily-data year range available for each station.
  3. Download all daily data for one or more stations as CSV files.

Data sources:
  - Station inventory CSV (canonical):
        https://collaboration.cmc.ec.gc.ca/cmc/climate/Get_More_Data_Plus_de_donnees/Station%20Inventory%20EN.csv
  - Bulk data download endpoint:
        https://climate.weather.gc.ca/climate_data/bulk_data_e.html
        (params: format=csv, stationID, Year, Month, Day, timeframe=2 for daily)

Examples:
    # List stations in Yukon
    python climate_importer.py list --province YT

    # Show date coverage for stations in NWT
    python climate_importer.py coverage --province NT

    # Download all daily data for every station in NU into ./data
    python climate_importer.py download --province NU --out ./data

    # Download every station in NWT, YU and NU
    python climate_importer.py download --province NT YT NU --out ./data
"""

from __future__ import annotations

import argparse
import csv
import io
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import requests
from tqdm import tqdm

STATION_INVENTORY_URL = (
    "https://collaboration.cmc.ec.gc.ca/cmc/climate/"
    "Get_More_Data_Plus_de_donnees/Station%20Inventory%20EN.csv"
)
BULK_DATA_URL = "https://climate.weather.gc.ca/climate_data/bulk_data_e.html"

# Map common short codes / aliases -> the province name used inside the inventory CSV.
PROVINCE_ALIASES = {
    "AB": "ALBERTA",
    "BC": "BRITISH COLUMBIA",
    "MB": "MANITOBA",
    "NB": "NEW BRUNSWICK",
    "NL": "NEWFOUNDLAND",
    "NF": "NEWFOUNDLAND",
    "NS": "NOVA SCOTIA",
    "NT": "NORTHWEST TERRITORIES",
    "NWT": "NORTHWEST TERRITORIES",
    "NU": "NUNAVUT",
    "ON": "ONTARIO",
    "PE": "PRINCE EDWARD ISLAND",
    "PEI": "PRINCE EDWARD ISLAND",
    "QC": "QUEBEC",
    "SK": "SASKATCHEWAN",
    "YT": "YUKON TERRITORY",
    "YU": "YUKON TERRITORY",
}

USER_AGENT = "climate-data-importer/1.0 (+https://climate.weather.gc.ca)"


@dataclass
class Station:
    name: str
    province: str
    climate_id: str
    station_id: str  # numeric ID used by the bulk download API
    wmo_id: str
    tc_id: str
    latitude: str
    longitude: str
    elevation: str
    first_year: str
    last_year: str
    hly_first_year: str
    hly_last_year: str
    dly_first_year: str
    dly_last_year: str
    mly_first_year: str
    mly_last_year: str

    @property
    def has_daily(self) -> bool:
        return bool(self.dly_first_year) and bool(self.dly_last_year)


def _normalize_province(value: str) -> str:
    v = value.strip().upper()
    return PROVINCE_ALIASES.get(v, v)


def _make_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({"User-Agent": USER_AGENT})
    return s


def fetch_station_inventory(session: requests.Session | None = None) -> list[Station]:
    """Download the master station inventory CSV and parse it."""
    session = session or _make_session()
    resp = session.get(STATION_INVENTORY_URL, timeout=60)
    resp.raise_for_status()
    # The file has 3 header lines before the actual CSV header row.
    text = resp.content.decode("utf-8-sig", errors="replace")
    lines = text.splitlines()

    header_idx = next(
        (i for i, line in enumerate(lines) if line.lstrip().startswith('"Name"')),
        None,
    )
    if header_idx is None:
        raise RuntimeError("Could not locate header row in station inventory CSV.")

    reader = csv.DictReader(lines[header_idx:])
    stations: list[Station] = []
    for row in reader:
        if not row.get("Name"):
            continue
        stations.append(
            Station(
                name=row.get("Name", "").strip(),
                province=row.get("Province", "").strip(),
                climate_id=row.get("Climate ID", "").strip(),
                station_id=row.get("Station ID", "").strip(),
                wmo_id=row.get("WMO ID", "").strip(),
                tc_id=row.get("TC ID", "").strip(),
                latitude=row.get("Latitude (Decimal Degrees)", "").strip(),
                longitude=row.get("Longitude (Decimal Degrees)", "").strip(),
                elevation=row.get("Elevation (m)", "").strip(),
                first_year=row.get("First Year", "").strip(),
                last_year=row.get("Last Year", "").strip(),
                hly_first_year=row.get("HLY First Year", "").strip(),
                hly_last_year=row.get("HLY Last Year", "").strip(),
                dly_first_year=row.get("DLY First Year", "").strip(),
                dly_last_year=row.get("DLY Last Year", "").strip(),
                mly_first_year=row.get("MLY First Year", "").strip(),
                mly_last_year=row.get("MLY Last Year", "").strip(),
            )
        )
    return stations


def filter_by_provinces(
    stations: Iterable[Station], provinces: Iterable[str]
) -> list[Station]:
    wanted = {_normalize_province(p) for p in provinces}
    return [s for s in stations if s.province.upper() in wanted]


def _safe_filename(name: str) -> str:
    keep = "-_."
    return "".join(c if c.isalnum() or c in keep else "_" for c in name).strip("_")


def download_station_daily(
    station: Station,
    out_dir: Path,
    session: requests.Session | None = None,
    overwrite: bool = False,
    sleep_between: float = 0.25,
) -> Path | None:
    """Download all available daily data for a station and write a single CSV file."""
    if not station.has_daily:
        return None

    session = session or _make_session()
    start = int(station.dly_first_year)
    end = int(station.dly_last_year)

    out_dir.mkdir(parents=True, exist_ok=True)
    fname = f"{_safe_filename(station.name)}_{station.station_id}_daily_{start}-{end}.csv"
    out_path = out_dir / fname

    if out_path.exists() and not overwrite:
        return out_path

    header_written = False
    with out_path.open("w", newline="", encoding="utf-8") as fh:
        writer: csv.writer | None = None
        for year in range(start, end + 1):
            params = {
                "format": "csv",
                "stationID": station.station_id,
                "Year": year,
                "Month": 1,
                "Day": 1,
                "timeframe": 2,  # 2 = daily
                "submit": "Download+Data",
            }
            for attempt in range(3):
                try:
                    r = session.get(BULK_DATA_URL, params=params, timeout=60)
                    r.raise_for_status()
                    break
                except requests.RequestException as exc:
                    if attempt == 2:
                        raise
                    time.sleep(2 ** attempt)
            else:  # pragma: no cover
                continue

            text = r.content.decode("utf-8-sig", errors="replace")
            if not text.strip():
                continue
            reader = csv.reader(io.StringIO(text))
            rows = list(reader)
            if not rows:
                continue
            header, data_rows = rows[0], rows[1:]
            if not header_written:
                writer = csv.writer(fh)
                writer.writerow(header)
                header_written = True
            if writer is not None:
                writer.writerows(data_rows)
            time.sleep(sleep_between)

    if not header_written:
        # No data ever returned; remove empty file.
        try:
            out_path.unlink()
        except OSError:
            pass
        return None
    return out_path


# ---------- CLI commands -----------------------------------------------------


def cmd_list(args: argparse.Namespace) -> int:
    stations = fetch_station_inventory()
    selected = filter_by_provinces(stations, args.province)
    selected.sort(key=lambda s: s.name)
    print(f"{'StationID':>10}  {'ClimateID':<10}  {'Province':<24}  Name")
    print("-" * 90)
    for s in selected:
        print(f"{s.station_id:>10}  {s.climate_id:<10}  {s.province:<24}  {s.name}")
    print(f"\nTotal: {len(selected)} stations")
    return 0


def cmd_coverage(args: argparse.Namespace) -> int:
    stations = fetch_station_inventory()
    selected = filter_by_provinces(stations, args.province)
    selected.sort(key=lambda s: s.name)
    print(
        f"{'StationID':>10}  {'Name':<40}  {'Daily':<13}  {'Hourly':<13}  {'Monthly':<13}"
    )
    print("-" * 100)
    for s in selected:
        d = f"{s.dly_first_year}-{s.dly_last_year}" if s.has_daily else "—"
        h = (
            f"{s.hly_first_year}-{s.hly_last_year}"
            if s.hly_first_year and s.hly_last_year
            else "—"
        )
        m = (
            f"{s.mly_first_year}-{s.mly_last_year}"
            if s.mly_first_year and s.mly_last_year
            else "—"
        )
        print(f"{s.station_id:>10}  {s.name[:40]:<40}  {d:<13}  {h:<13}  {m:<13}")
    daily_count = sum(1 for s in selected if s.has_daily)
    print(f"\n{daily_count}/{len(selected)} stations have daily data.")
    return 0


def cmd_download(args: argparse.Namespace) -> int:
    out_dir = Path(args.out)
    stations = fetch_station_inventory()

    if args.station_id:
        selected = [s for s in stations if s.station_id in set(args.station_id)]
    else:
        selected = filter_by_provinces(stations, args.province or [])

    selected = [s for s in selected if s.has_daily]
    if not selected:
        print("No matching stations with daily data.", file=sys.stderr)
        return 1

    print(f"Downloading daily data for {len(selected)} station(s) -> {out_dir}")
    session = _make_session()

    errors: list[tuple[str, str]] = []
    written: list[Path] = []

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {
            pool.submit(
                download_station_daily,
                s,
                out_dir,
                session,
                args.overwrite,
            ): s
            for s in selected
        }
        for fut in tqdm(as_completed(futures), total=len(futures), unit="station"):
            station = futures[fut]
            try:
                path = fut.result()
                if path:
                    written.append(path)
            except Exception as exc:  # noqa: BLE001
                errors.append((station.name, str(exc)))

    print(f"\nDone. Wrote {len(written)} CSV file(s).")
    if errors:
        print(f"{len(errors)} station(s) failed:", file=sys.stderr)
        for name, err in errors:
            print(f"  - {name}: {err}", file=sys.stderr)
        return 2
    return 0


# ---------- PostgreSQL loader ------------------------------------------------

DDL_DATASETS = """
CREATE TABLE IF NOT EXISTS {schema}.datasets (
    id               INTEGER PRIMARY KEY,
    name             VARCHAR,
    timecreated      INTEGER,
    timeupdated      INTEGER,
    resourcelink     VARCHAR
);
"""

DDL_STATIONS = """
CREATE TABLE IF NOT EXISTS {schema}.weather_stations (
    station_id       INTEGER PRIMARY KEY,
    name             TEXT NOT NULL,
    province         TEXT,
    climate_id       TEXT,
    wmo_id           TEXT,
    tc_id            TEXT,
    latitude         NUMERIC(9, 5),
    longitude        NUMERIC(9, 5),
    elevation_m      NUMERIC(8, 2),
    first_year       INTEGER,
    last_year        INTEGER,
    hly_first_year   INTEGER,
    hly_last_year    INTEGER,
    dly_first_year   INTEGER,
    dly_last_year    INTEGER,
    mly_first_year   INTEGER,
    mly_last_year    INTEGER
);
CREATE INDEX IF NOT EXISTS weather_stations_province_idx
    ON {schema}.weather_stations (province);
CREATE INDEX IF NOT EXISTS weather_stations_climate_id_idx
    ON {schema}.weather_stations (climate_id);
"""

DDL_DAILY = """
CREATE TABLE IF NOT EXISTS {schema}.daily_data (
    id                       BIGSERIAL PRIMARY KEY,
    station_id               INTEGER NOT NULL
        REFERENCES {schema}.weather_stations(station_id) ON DELETE CASCADE,
    obs_date                 DATE NOT NULL,
    year                     INTEGER,
    month                    INTEGER,
    day                      INTEGER,
    data_quality             TEXT,
    max_temp_c               NUMERIC(6, 2),
    max_temp_flag            TEXT,
    min_temp_c               NUMERIC(6, 2),
    min_temp_flag            TEXT,
    mean_temp_c              NUMERIC(6, 2),
    mean_temp_flag           TEXT,
    heat_deg_days_c          NUMERIC(6, 2),
    heat_deg_days_flag       TEXT,
    cool_deg_days_c          NUMERIC(6, 2),
    cool_deg_days_flag       TEXT,
    total_rain_mm            NUMERIC(7, 2),
    total_rain_flag          TEXT,
    total_snow_cm            NUMERIC(7, 2),
    total_snow_flag          TEXT,
    total_precip_mm          NUMERIC(7, 2),
    total_precip_flag        TEXT,
    snow_on_grnd_cm          NUMERIC(7, 2),
    snow_on_grnd_flag        TEXT,
    dir_of_max_gust_10s_deg  NUMERIC(5, 1),
    dir_of_max_gust_flag     TEXT,
    spd_of_max_gust_kmh      NUMERIC(6, 1),
    spd_of_max_gust_flag     TEXT,
    dataset_id               INTEGER
        REFERENCES {schema}.datasets(id) ON DELETE SET NULL,
    CONSTRAINT daily_data_station_date_uniq UNIQUE (station_id, obs_date)
);
CREATE INDEX IF NOT EXISTS daily_data_station_idx
    ON {schema}.daily_data (station_id);
CREATE INDEX IF NOT EXISTS daily_data_date_idx
    ON {schema}.daily_data (obs_date);
CREATE INDEX IF NOT EXISTS daily_data_dataset_idx
    ON {schema}.daily_data (dataset_id);
"""

DDL_ROAD_CLOSURES = """
CREATE TABLE IF NOT EXISTS {schema}.road_closures (
    id            BIGSERIAL PRIMARY KEY,
    dataset_id    INTEGER
        REFERENCES {schema}.datasets(id) ON DELETE SET NULL,
    dataset_name  TEXT,
    year          TEXT NOT NULL,
    road_name     TEXT NOT NULL,
    road_type     TEXT NOT NULL,
    open_date     DATE,
    close_date    DATE,
    CONSTRAINT road_closures_year_road_uniq UNIQUE (year, road_name)
);
CREATE INDEX IF NOT EXISTS road_closures_year_idx
    ON {schema}.road_closures (year);
CREATE INDEX IF NOT EXISTS road_closures_road_name_idx
    ON {schema}.road_closures (road_name);
CREATE INDEX IF NOT EXISTS road_closures_road_type_idx
    ON {schema}.road_closures (road_type);
CREATE INDEX IF NOT EXISTS road_closures_dataset_idx
    ON {schema}.road_closures (dataset_id);
"""

# Mapping of CSV column headers to (road_name, road_type).
# Category headers ("WINTER ROADS", "ICE ROADS", etc.) and "Year"/"Status"
# are excluded — they are not individual roads.
ROAD_COLUMNS: dict[str, tuple[str, str]] = {
    "Ft. Simpson - Wrigley (Highway #1)":
        ("Ft. Simpson - Wrigley (Highway #1)", "WINTER ROAD"),
    "Wrigley to Tulita Winter Road (Highway #1)":
        ("Wrigley to Tulita Winter Road (Highway #1)", "WINTER ROAD"),
    "Tulita to Norman Wells Winter Road (Highway #1)":
        ("Tulita to Norman Wells Winter Road (Highway #1)", "WINTER ROAD"),
    "Norman Wells to Fort Good Hope Winter Road (Highway #1)":
        ("Norman Wells to Fort Good Hope Winter Road (Highway #1)", "WINTER ROAD"),
    "Colville Lake Winter Road":
        ("Colville Lake Winter Road", "WINTER ROAD"),
    "Délįne Winter Road":
        ("Délįne Winter Road", "WINTER ROAD"),
    "Sambaa K'e Winter Road":
        ("Sambaa K\u2019e Winter Road", "WINTER ROAD"),
    "Nahanni Butte Winter Road":
        ("Nahanni Butte Winter Road", "WINTER ROAD"),
    "Wekwèètì Winter Road":
        ("Wekwèètì Winter Road", "WINTER ROAD"),
    "Whatì Winter Road":
        ("Whatì Winter Road", "WINTER ROAD"),
    "Gamètì Winter Road":
        ("Gamètì Winter Road", "WINTER ROAD"),
    "Aklavik Ice Road":
        ("Aklavik Ice Road", "ICE ROAD"),
    "Dettah Ice Road":
        ("Dettah Ice Road", "ICE ROAD"),
    "Tuktoyaktuk Ice Road":
        ("Tuktoyaktuk Ice Road", "ICE ROAD"),
    "Mackenzie River Crossing at Fort Providence":
        ("Mackenzie River Crossing at Fort Providence", "ICE CROSSING"),
    "Liard River Crossing at Fort Simpson":
        ("Liard River Crossing at Fort Simpson", "ICE CROSSING"),
    "Mackenzie River Crossing at Tsiigehtchic":
        ("Mackenzie River Crossing at Tsiigehtchic", "ICE CROSSING"),
    "Peel River Crossing":
        ("Peel River Crossing", "ICE CROSSING"),
    "Mackenzie River Crossing at Camsell Bend":
        ("Mackenzie River Crossing at Camsell Bend", "ICE CROSSING"),
    "Tibbitt-Contwoyto Winter Road":
        ("Tibbitt-Contwoyto Winter Road", "PRIVATE MINING ROAD"),
}

# Pre-defined dataset IDs
DATASET_ECCC_DAILY = 1
DATASET_AHCCD_MEAN_TEMP = 2
DATASET_AHCCD_MAX_TEMP = 3
DATASET_AHCCD_MIN_TEMP = 4
DATASET_AHCCD_RAINFALL = 5
DATASET_AHCCD_SNOWFALL = 6
DATASET_AHCCD_TOTAL_PRECIP = 7
DATASET_NWT_ROAD_CLOSURES = 8

DATASETS = [
    (DATASET_ECCC_DAILY, "ECCC Daily Climate Data",
     "https://climate.weather.gc.ca/climate_data/bulk_data_e.html"),
    (DATASET_AHCCD_MEAN_TEMP, "AHCCD Homogenized Daily Mean Temperature",
     "https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/AHCCD/Homog_daily_mean_temp_Gen3.zip"),
    (DATASET_AHCCD_MAX_TEMP, "AHCCD Homogenized Daily Max Temperature",
     "https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/AHCCD/Homog_daily_max_temp_Gen3.zip"),
    (DATASET_AHCCD_MIN_TEMP, "AHCCD Homogenized Daily Min Temperature",
     "https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/AHCCD/Homog_daily_min_temp_Gen3.zip"),
    (DATASET_AHCCD_RAINFALL, "AHCCD Adjusted Daily Rainfall",
     "https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/AHCCD/Adj_daily_rainfall_v2023.zip"),
    (DATASET_AHCCD_SNOWFALL, "AHCCD Adjusted Daily Snowfall",
     "https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/AHCCD/Adj_daily_snowfall_v2023.zip"),
    (DATASET_AHCCD_TOTAL_PRECIP, "AHCCD Adjusted Daily Total Precipitation",
     "https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/AHCCD/Adj_daily_total_precip_v2023.zip"),
    (DATASET_NWT_ROAD_CLOSURES, "NWT Road Closures",
     "NWT_Roads_Combined_Full.csv"),
]

# Mapping CSV header -> (db_column, parser).
_NUM = "num"
_INT = "int"
_TXT = "txt"
_DATE = "date"

CSV_TO_COLUMN: list[tuple[str, str, str]] = [
    ("Date/Time",                  "obs_date",                 _DATE),
    ("Year",                       "year",                     _INT),
    ("Month",                      "month",                    _INT),
    ("Day",                        "day",                      _INT),
    ("Data Quality",               "data_quality",             _TXT),
    ("Max Temp (\u00b0C)",         "max_temp_c",               _NUM),
    ("Max Temp Flag",              "max_temp_flag",            _TXT),
    ("Min Temp (\u00b0C)",         "min_temp_c",               _NUM),
    ("Min Temp Flag",              "min_temp_flag",            _TXT),
    ("Mean Temp (\u00b0C)",        "mean_temp_c",              _NUM),
    ("Mean Temp Flag",             "mean_temp_flag",           _TXT),
    ("Heat Deg Days (\u00b0C)",    "heat_deg_days_c",          _NUM),
    ("Heat Deg Days Flag",         "heat_deg_days_flag",       _TXT),
    ("Cool Deg Days (\u00b0C)",    "cool_deg_days_c",          _NUM),
    ("Cool Deg Days Flag",         "cool_deg_days_flag",       _TXT),
    ("Total Rain (mm)",            "total_rain_mm",            _NUM),
    ("Total Rain Flag",            "total_rain_flag",          _TXT),
    ("Total Snow (cm)",            "total_snow_cm",            _NUM),
    ("Total Snow Flag",            "total_snow_flag",          _TXT),
    ("Total Precip (mm)",          "total_precip_mm",          _NUM),
    ("Total Precip Flag",          "total_precip_flag",        _TXT),
    ("Snow on Grnd (cm)",          "snow_on_grnd_cm",          _NUM),
    ("Snow on Grnd Flag",          "snow_on_grnd_flag",        _TXT),
    ("Dir of Max Gust (10s deg)",  "dir_of_max_gust_10s_deg",  _NUM),
    ("Dir of Max Gust Flag",       "dir_of_max_gust_flag",     _TXT),
    ("Spd of Max Gust (km/h)",     "spd_of_max_gust_kmh",      _NUM),
    ("Spd of Max Gust Flag",       "spd_of_max_gust_flag",     _TXT),
]

_FILENAME_RE = re.compile(r"_(\d+)_daily_\d+-\d+\.csv$")


def _opt_int(value: str) -> int | None:
    value = (value or "").strip()
    if not value:
        return None
    try:
        return int(float(value))
    except ValueError:
        return None


def _opt_num(value: str) -> str | None:
    value = (value or "").strip()
    if not value:
        return None
    try:
        float(value)
    except ValueError:
        return None
    return value


def _opt_txt(value: str) -> str | None:
    value = (value or "").strip()
    return value or None


def _parse_row(row: dict[str, str]) -> tuple | None:
    out: list[object] = []
    for csv_key, _col, kind in CSV_TO_COLUMN:
        raw = row.get(csv_key, "")
        if kind == _DATE:
            raw = (raw or "").strip()
            if not raw:
                return None
            out.append(raw)
        elif kind == _INT:
            out.append(_opt_int(raw))
        elif kind == _NUM:
            out.append(_opt_num(raw))
        else:
            out.append(_opt_txt(raw))
    return tuple(out)


def _station_id_from_filename(path: Path) -> int | None:
    m = _FILENAME_RE.search(path.name)
    return int(m.group(1)) if m else None


def cmd_dbload(args: argparse.Namespace) -> int:
    try:
        import psycopg
        from psycopg import sql
    except ImportError:
        print(
            "psycopg is required for dbload. Install it with:\n"
            "    pip install 'psycopg[binary]'",
            file=sys.stderr,
        )
        return 1

    schema = args.schema
    conninfo = (
        f"host={args.host} port={args.port} dbname={args.dbname} "
        f"user={args.user} password={args.password}"
    )

    print("Fetching station inventory...")
    stations = fetch_station_inventory()
    if args.province:
        stations = filter_by_provinces(stations, args.province)
    print(f"  {len(stations)} stations to upsert.")

    with psycopg.connect(conninfo) as conn:
        with conn.cursor() as cur:
            cur.execute(sql.SQL("CREATE SCHEMA IF NOT EXISTS {}").format(
                sql.Identifier(schema)))
            if args.drop:
                print("Dropping existing tables...")
                cur.execute(sql.SQL("DROP TABLE IF EXISTS {}.road_closures CASCADE").format(
                    sql.Identifier(schema)))
                cur.execute(sql.SQL("DROP TABLE IF EXISTS {}.daily_data CASCADE").format(
                    sql.Identifier(schema)))
                cur.execute(sql.SQL("DROP TABLE IF EXISTS {}.weather_stations CASCADE").format(
                    sql.Identifier(schema)))
                cur.execute(sql.SQL("DROP TABLE IF EXISTS {}.datasets CASCADE").format(
                    sql.Identifier(schema)))
            cur.execute(DDL_DATASETS.format(schema=schema))
            cur.execute(DDL_STATIONS.format(schema=schema))
            cur.execute(DDL_DAILY.format(schema=schema))
            cur.execute(DDL_ROAD_CLOSURES.format(schema=schema))

            # Pre-create dataset entries
            import time as _time
            now_epoch = int(_time.time())
            for ds_id, ds_name, ds_link in DATASETS:
                cur.execute(sql.SQL("""
                    INSERT INTO {schema}.datasets (id, name, timecreated, timeupdated, resourcelink)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        timeupdated = EXCLUDED.timeupdated,
                        resourcelink = EXCLUDED.resourcelink
                """).format(schema=sql.Identifier(schema)),
                    (ds_id, ds_name, now_epoch, now_epoch, ds_link))
        conn.commit()

        # Upsert stations.
        upsert = sql.SQL("""
            INSERT INTO {schema}.weather_stations
                (station_id, name, province, climate_id, wmo_id, tc_id,
                 latitude, longitude, elevation_m,
                 first_year, last_year,
                 hly_first_year, hly_last_year,
                 dly_first_year, dly_last_year,
                 mly_first_year, mly_last_year)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (station_id) DO UPDATE SET
                name = EXCLUDED.name,
                province = EXCLUDED.province,
                climate_id = EXCLUDED.climate_id,
                wmo_id = EXCLUDED.wmo_id,
                tc_id = EXCLUDED.tc_id,
                latitude = EXCLUDED.latitude,
                longitude = EXCLUDED.longitude,
                elevation_m = EXCLUDED.elevation_m,
                first_year = EXCLUDED.first_year,
                last_year = EXCLUDED.last_year,
                hly_first_year = EXCLUDED.hly_first_year,
                hly_last_year = EXCLUDED.hly_last_year,
                dly_first_year = EXCLUDED.dly_first_year,
                dly_last_year = EXCLUDED.dly_last_year,
                mly_first_year = EXCLUDED.mly_first_year,
                mly_last_year = EXCLUDED.mly_last_year
        """).format(schema=sql.Identifier(schema))

        print("Upserting station metadata...")
        with conn.cursor() as cur:
            for s in tqdm(stations, desc="Stations", unit="stn"):
                if not s.station_id:
                    continue
                cur.execute(upsert, (
                    int(s.station_id),
                    s.name,
                    s.province,
                    s.climate_id or None,
                    s.wmo_id or None,
                    s.tc_id or None,
                    _opt_num(s.latitude),
                    _opt_num(s.longitude),
                    _opt_num(s.elevation),
                    _opt_int(s.first_year),
                    _opt_int(s.last_year),
                    _opt_int(s.hly_first_year),
                    _opt_int(s.hly_last_year),
                    _opt_int(s.dly_first_year),
                    _opt_int(s.dly_last_year),
                    _opt_int(s.mly_first_year),
                    _opt_int(s.mly_last_year),
                ))
        conn.commit()
        print(f"  ✓ {len(stations)} stations upserted.")

        if args.skip_data:
            print("Skipping daily-data import (--skip-data).")
            return 0

        data_dir = Path(args.data_dir)
        if not data_dir.is_dir():
            print(f"Data directory not found: {data_dir}", file=sys.stderr)
            return 1

        csv_files = sorted(data_dir.glob("*_daily_*.csv"))
        if not csv_files:
            print(f"No daily CSV files found in {data_dir}.")
            return 0

        print(f"Found {len(csv_files)} daily CSV file(s) in {data_dir}")
        # Restrict by station IDs in inventory subset (if --province given).
        valid_ids = {int(s.station_id) for s in stations if s.station_id}

        columns = ["station_id"] + [c for _, c, _ in CSV_TO_COLUMN] + ["dataset_id"]
        copy_sql = sql.SQL("COPY daily_stage ({cols}) FROM STDIN").format(
            cols=sql.SQL(", ").join(map(sql.Identifier, columns)),
        )
        # Use a temp staging table so we can ON CONFLICT-merge into daily_data.
        merge_sql = sql.SQL("""
            INSERT INTO {schema}.daily_data ({cols})
            SELECT {cols} FROM daily_stage
            ON CONFLICT (station_id, obs_date) DO NOTHING
        """).format(
            schema=sql.Identifier(schema),
            cols=sql.SQL(", ").join(map(sql.Identifier, columns)),
        )

        total_rows = 0
        skipped = 0
        pbar = tqdm(csv_files, desc="Loading CSVs", unit="file")
        for csv_path in pbar:
            station_id = _station_id_from_filename(csv_path)
            if station_id is None:
                tqdm.write(f"  skip (no station id in name): {csv_path.name}")
                skipped += 1
                continue
            if valid_ids and station_id not in valid_ids:
                skipped += 1
                continue

            pbar.set_postfix_str(csv_path.stem[:30], refresh=True)

            with conn.cursor() as cur:
                cur.execute("BEGIN")
                cur.execute("DROP TABLE IF EXISTS daily_stage")
                cur.execute(sql.SQL(
                    "CREATE TEMP TABLE daily_stage (LIKE {}.daily_data INCLUDING ALL)"
                ).format(sql.Identifier(schema)))

                file_rows = 0
                with csv_path.open("r", encoding="utf-8", newline="") as fh:
                    reader = csv.DictReader(fh)
                    with cur.copy(copy_sql) as copy:
                        for row in reader:
                            parsed = _parse_row(row)
                            if parsed is None:
                                continue
                            copy.write_row((station_id, *parsed, DATASET_ECCC_DAILY))
                            file_rows += 1
                cur.execute(merge_sql)
                conn.commit()
                total_rows += file_rows

            pbar.set_postfix(rows=total_rows, skipped=skipped)

        pbar.close()
        print(f"\nDone. Inserted {total_rows:,} daily rows from "
              f"{len(csv_files) - skipped} file(s) ({skipped} skipped).")
    return 0


# ---------- AHCCD download & load -------------------------------------------

AHCCD_DOWNLOADS = {
    "mean_temp": (
        "https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/AHCCD/Homog_daily_mean_temp_Gen3.zip",
        DATASET_AHCCD_MEAN_TEMP,
    ),
    "max_temp": (
        "https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/AHCCD/Homog_daily_max_temp_Gen3.zip",
        DATASET_AHCCD_MAX_TEMP,
    ),
    "min_temp": (
        "https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/AHCCD/Homog_daily_min_temp_Gen3.zip",
        DATASET_AHCCD_MIN_TEMP,
    ),
    "rainfall": (
        "https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/AHCCD/Adj_daily_rainfall_v2023.zip",
        DATASET_AHCCD_RAINFALL,
    ),
    "snowfall": (
        "https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/AHCCD/Adj_daily_snowfall_v2023.zip",
        DATASET_AHCCD_SNOWFALL,
    ),
    "total_precip": (
        "https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/AHCCD/Adj_daily_total_precip_v2023.zip",
        DATASET_AHCCD_TOTAL_PRECIP,
    ),
}


def cmd_ahccd_download(args: argparse.Namespace) -> int:
    """Download AHCCD daily data zip files and extract dm files."""
    import zipfile

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    session = _make_session()

    variables = args.variable or list(AHCCD_DOWNLOADS.keys())

    for var in variables:
        if var not in AHCCD_DOWNLOADS:
            print(f"Unknown variable: {var}. "
                  f"Choose from: {', '.join(AHCCD_DOWNLOADS.keys())}", file=sys.stderr)
            return 1

        url, _dataset_id = AHCCD_DOWNLOADS[var]
        zip_name = url.rsplit("/", 1)[-1]
        zip_path = out_dir / zip_name
        var_dir = out_dir / var

        print(f"Downloading {var}: {url}")
        for attempt in range(3):
            try:
                r = session.get(url, timeout=120, stream=True)
                r.raise_for_status()
                with zip_path.open("wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
                break
            except requests.RequestException as exc:
                if attempt == 2:
                    print(f"  Failed to download {var}: {exc}", file=sys.stderr)
                    continue
                time.sleep(2 ** attempt)

        if not zip_path.exists():
            continue

        print(f"  Extracting to {var_dir}/")
        var_dir.mkdir(parents=True, exist_ok=True)
        try:
            with zipfile.ZipFile(zip_path, "r") as zf:
                zf.extractall(var_dir)
        except zipfile.BadZipFile as e:
            print(f"  Bad zip file for {var}: {e}", file=sys.stderr)
            continue

        # Clean up zip
        zip_path.unlink()
        print(f"  Done: {var}")

    print("\nAHCCD download complete.")
    return 0


def cmd_ahccd_load(args: argparse.Namespace) -> int:
    """Load AHCCD CSV files (Year,Mo,Day01..Day31 format) into daily_data."""
    try:
        import psycopg
        from psycopg import sql
    except ImportError:
        print(
            "psycopg is required. Install with:\n    pip install 'psycopg[binary]'",
            file=sys.stderr,
        )
        return 1

    import calendar as _cal

    schema = args.schema
    conninfo = (
        f"host={args.host} port={args.port} dbname={args.dbname} "
        f"user={args.user} password={args.password}"
    )

    data_dir = Path(args.data_dir)
    if not data_dir.is_dir():
        print(f"Data directory not found: {data_dir}", file=sys.stderr)
        return 1

    # Determine which dataset this is
    dataset_id = args.dataset_id
    target_column = args.column

    # Find CSV files (output of dm_to_csv.py)
    csv_files = sorted(data_dir.glob("*.csv"))
    if not csv_files:
        print(f"No CSV files found in {data_dir}.")
        return 0

    print(f"Found {len(csv_files)} AHCCD CSV file(s) in {data_dir}")
    print(f"  Dataset ID: {dataset_id}, Target column: {target_column}")

    # AHCCD CSVs map station names to station_ids via weather_stations table
    with psycopg.connect(conninfo) as conn:
        # Ensure datasets table and entries exist
        with conn.cursor() as cur:
            cur.execute(DDL_DATASETS.format(schema=schema))
            import time as _time
            now_epoch = int(_time.time())
            for ds_id, ds_name, ds_link in DATASETS:
                cur.execute(sql.SQL("""
                    INSERT INTO {schema}.datasets (id, name, timecreated, timeupdated, resourcelink)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """).format(schema=sql.Identifier(schema)),
                    (ds_id, ds_name, now_epoch, now_epoch, ds_link))
        conn.commit()

        # Build station lookup by name (normalized)
        with conn.cursor() as cur:
            cur.execute(sql.SQL(
                "SELECT station_id, name, climate_id FROM {}.weather_stations"
            ).format(sql.Identifier(schema)))
            station_rows = cur.fetchall()

        station_by_name: dict[str, int] = {}
        for sid, sname, _cid in station_rows:
            norm = re.sub(r'[^A-Z0-9]', '_', sname.upper()).strip('_')
            norm = re.sub(r'_+', '_', norm)
            station_by_name[norm] = sid

        # Columns for the insert: we insert into mean_temp_c (or other column)
        # based on --column argument
        total_rows = 0
        skipped_files = 0
        pbar = tqdm(csv_files, desc="Loading AHCCD CSVs", unit="file")

        for csv_path in pbar:
            # Try to match station from filename
            # Filename format: STATIONNAME_PROV_STARTYEAR_ENDYEAR.csv
            fname_parts = csv_path.stem.rsplit('_', 2)
            # Remove year parts from end to get station+prov
            stem = csv_path.stem
            # Try to extract station name from filename (everything before _PROV_YEAR_YEAR)
            m = re.match(r'^(.+?)_([A-Z]{2,3})_(\d{4})_(\d{4})$', stem)
            if not m:
                tqdm.write(f"  skip (can't parse filename): {csv_path.name}")
                skipped_files += 1
                continue

            station_name_norm = m.group(1)
            prov_code = m.group(2)

            # Try to find station in DB
            station_id = station_by_name.get(station_name_norm)
            if station_id is None:
                # Try with province appended
                with_prov = f"{station_name_norm}_{prov_code}"
                station_id = station_by_name.get(with_prov)
            if station_id is None:
                # Try fuzzy: find best prefix match
                for db_name, db_id in station_by_name.items():
                    if db_name.startswith(station_name_norm):
                        station_id = db_id
                        break
            if station_id is None:
                tqdm.write(f"  skip (station not found): {csv_path.name}")
                skipped_files += 1
                continue

            pbar.set_postfix_str(csv_path.stem[:30], refresh=True)

            # Read the AHCCD CSV (Year, Mo, Day01..Day31)
            file_rows = 0
            with conn.cursor() as cur:
                with csv_path.open("r", encoding="utf-8", newline="") as fh:
                    reader = csv.DictReader(fh)
                    for row in reader:
                        try:
                            year = int(row["Year"])
                            month = int(row["Mo"])
                        except (ValueError, KeyError):
                            continue

                        mdays = _cal.monthrange(year, month)[1]

                        for day in range(1, mdays + 1):
                            day_key = f"Day{day:02d}"
                            val = row.get(day_key, "").strip()
                            if not val or val == "-9999.9":
                                continue

                            try:
                                float(val)
                            except ValueError:
                                continue

                            obs_date = f"{year:04d}-{month:02d}-{day:02d}"

                            cur.execute(sql.SQL("""
                                INSERT INTO {schema}.daily_data
                                    (station_id, obs_date, year, month, day, {col}, dataset_id)
                                VALUES (%s, %s, %s, %s, %s, %s, %s)
                                ON CONFLICT (station_id, obs_date) DO UPDATE SET
                                    {col} = EXCLUDED.{col},
                                    dataset_id = COALESCE({schema}.daily_data.dataset_id, EXCLUDED.dataset_id)
                            """).format(
                                schema=sql.Identifier(schema),
                                col=sql.Identifier(target_column),
                            ), (station_id, obs_date, year, month, day, val, dataset_id))
                            file_rows += 1

                conn.commit()
                total_rows += file_rows

            pbar.set_postfix(rows=total_rows, skipped=skipped_files)

        pbar.close()
        print(f"\nDone. Inserted/updated {total_rows:,} daily rows from "
              f"{len(csv_files) - skipped_files} file(s) ({skipped_files} skipped).")
    return 0


# ---------- NWT Road Closures loader -----------------------------------------

_MONTH_ABBR = {
    "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
    "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
}


def _resolve_road_date(date_str: str, year_str: str) -> str | None:
    """Resolve a date like '14-Dec' with a season year like '2024/25'.

    Oct-Dec -> first calendar year, Jan-Sep -> second calendar year.
    Returns ISO date string or None if not parseable.
    """
    date_str = (date_str or "").strip()
    if not date_str or date_str.upper() == "N/A":
        return None

    parts = date_str.split("-")
    if len(parts) != 2:
        return None

    try:
        day = int(parts[0])
    except ValueError:
        return None

    month_abbr = parts[1].strip().capitalize()
    month = _MONTH_ABBR.get(month_abbr)
    if month is None:
        return None

    # Parse the season year (e.g. "2024/25" -> first=2024, second=2025)
    year_parts = year_str.strip().split("/")
    if len(year_parts) != 2:
        return None
    try:
        first_year = int(year_parts[0])
    except ValueError:
        return None
    second_year = first_year + 1

    # Oct-Dec belong to the first year; Jan-Sep belong to the second year
    cal_year = first_year if month >= 10 else second_year

    return f"{cal_year:04d}-{month:02d}-{day:02d}"


def cmd_roadload(args: argparse.Namespace) -> int:
    """Load NWT road closure data from CSV into road_closures table."""
    try:
        import psycopg
        from psycopg import sql
    except ImportError:
        print(
            "psycopg is required for roadload. Install it with:\n"
            "    pip install 'psycopg[binary]'",
            file=sys.stderr,
        )
        return 1

    csv_path = Path(args.csv)
    if not csv_path.is_file():
        print(f"CSV file not found: {csv_path}", file=sys.stderr)
        return 1

    schema = args.schema
    conninfo = (
        f"host={args.host} port={args.port} dbname={args.dbname} "
        f"user={args.user} password={args.password}"
    )

    # Read and parse the CSV
    print(f"Reading road closure data from {csv_path}")
    with csv_path.open("r", encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        headers = reader.fieldnames or []
        rows = list(reader)

    # Build the mapping of CSV columns that are actual roads
    active_road_cols: list[tuple[str, str, str]] = []  # (csv_header, road_name, road_type)
    for hdr in headers:
        if hdr in ROAD_COLUMNS:
            road_name, road_type = ROAD_COLUMNS[hdr]
            active_road_cols.append((hdr, road_name, road_type))

    if not active_road_cols:
        print("Error: No matching road columns found in CSV headers.", file=sys.stderr)
        print(f"  CSV headers: {headers}", file=sys.stderr)
        return 1

    print(f"  Found {len(active_road_cols)} road columns in CSV.")

    # Group rows by year: collect Open and Closed dates
    # Skip average rows (year starts with "Last")
    year_data: dict[str, dict[str, dict[str, str]]] = {}  # year -> road_col -> {open, close}
    for row in rows:
        year_str = (row.get("Year") or "").strip()
        status = (row.get("Status") or "").strip().capitalize()

        if not year_str or year_str.startswith("Last"):
            continue

        # Normalize "Opend" typo in CSV
        if status.startswith("Open"):
            status = "Open"

        if year_str not in year_data:
            year_data[year_str] = {}

        for csv_hdr, road_name, road_type in active_road_cols:
            date_val = (row.get(csv_hdr) or "").strip()
            if road_name not in year_data[year_str]:
                year_data[year_str][road_name] = {"open": "", "close": "", "type": road_type}

            if status == "Open":
                year_data[year_str][road_name]["open"] = date_val
            elif status == "Closed":
                year_data[year_str][road_name]["close"] = date_val

    # Connect and load
    dataset_name = "NWT Road Closures"
    with psycopg.connect(conninfo) as conn:
        with conn.cursor() as cur:
            cur.execute(sql.SQL("CREATE SCHEMA IF NOT EXISTS {}").format(
                sql.Identifier(schema)))
            if args.drop:
                print("Dropping existing road_closures table...")
                cur.execute(sql.SQL(
                    "DROP TABLE IF EXISTS {}.road_closures CASCADE"
                ).format(sql.Identifier(schema)))
            cur.execute(DDL_DATASETS.format(schema=schema))
            cur.execute(DDL_ROAD_CLOSURES.format(schema=schema))

            # Ensure dataset entry exists
            import time as _time
            now_epoch = int(_time.time())
            for ds_id, ds_name, ds_link in DATASETS:
                cur.execute(sql.SQL("""
                    INSERT INTO {schema}.datasets (id, name, timecreated, timeupdated, resourcelink)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """).format(schema=sql.Identifier(schema)),
                    (ds_id, ds_name, now_epoch, now_epoch, ds_link))
        conn.commit()

        # Upsert road closure records
        upsert_sql = sql.SQL("""
            INSERT INTO {schema}.road_closures
                (dataset_id, dataset_name, year, road_name, road_type, open_date, close_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (year, road_name) DO UPDATE SET
                dataset_id   = EXCLUDED.dataset_id,
                dataset_name = EXCLUDED.dataset_name,
                road_type    = EXCLUDED.road_type,
                open_date    = EXCLUDED.open_date,
                close_date   = EXCLUDED.close_date
        """).format(schema=sql.Identifier(schema))

        total_rows = 0
        skipped = 0
        with conn.cursor() as cur:
            for year_str in sorted(year_data.keys()):
                roads = year_data[year_str]
                for road_name, info in roads.items():
                    open_date = _resolve_road_date(info["open"], year_str)
                    close_date = _resolve_road_date(info["close"], year_str)

                    # Skip roads where both dates are N/A
                    if open_date is None and close_date is None:
                        skipped += 1
                        continue

                    cur.execute(upsert_sql, (
                        DATASET_NWT_ROAD_CLOSURES,
                        dataset_name,
                        year_str,
                        road_name,
                        info["type"],
                        open_date,
                        close_date,
                    ))
                    total_rows += 1
        conn.commit()

    print(f"\nDone. Upserted {total_rows} road closure records "
          f"({skipped} skipped due to N/A).")
    return 0


# ---------- argparse ---------------------------------------------------------


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Download ECCC historical climate data by province/station.",
    )
    sub = p.add_subparsers(dest="command", required=True)

    p_list = sub.add_parser("list", help="List stations in the given province(s).")
    p_list.add_argument("--province", "-p", nargs="+", required=True,
                        help="Province codes (e.g. NT NWT YT YU NU) or full names.")
    p_list.set_defaults(func=cmd_list)

    p_cov = sub.add_parser(
        "coverage", help="Show daily/hourly/monthly year ranges for stations."
    )
    p_cov.add_argument("--province", "-p", nargs="+", required=True)
    p_cov.set_defaults(func=cmd_coverage)

    p_dl = sub.add_parser("download", help="Download all daily data as CSV.")
    p_dl.add_argument("--province", "-p", nargs="+",
                      help="Province code(s). Required unless --station-id is given.")
    p_dl.add_argument("--station-id", nargs="+",
                      help="Specific station ID(s) to download.")
    p_dl.add_argument("--out", "-o", default="./data",
                      help="Output directory (default: ./data).")
    p_dl.add_argument("--workers", "-w", type=int, default=4,
                      help="Parallel download workers (default: 4).")
    p_dl.add_argument("--overwrite", action="store_true",
                      help="Re-download even if the CSV already exists.")
    p_dl.set_defaults(func=cmd_download)

    p_db = sub.add_parser(
        "dbload",
        help="Create tables in PostgreSQL and load station metadata + daily CSV data.",
    )
    p_db.add_argument("--data-dir", "-d", default="./data",
                      help="Directory containing downloaded daily CSV files.")
    p_db.add_argument("--province", "-p", nargs="+",
                      help="Restrict stations table to these provinces. "
                           "Default: insert every station in the inventory.")
    p_db.add_argument("--host", default=os.environ.get("PGHOST", "localhost"))
    p_db.add_argument("--port", default=os.environ.get("PGPORT", "5432"))
    p_db.add_argument("--dbname", default=os.environ.get("PGDATABASE", "postgres"))
    p_db.add_argument("--user", default=os.environ.get("PGUSER", "postgres"))
    p_db.add_argument("--password", default=os.environ.get("PGPASSWORD", ""))
    p_db.add_argument("--schema", default="public")
    p_db.add_argument("--drop", action="store_true",
                      help="Drop existing tables before creating them.")
    p_db.add_argument("--skip-data", action="store_true",
                      help="Only create tables and load station metadata; "
                           "do not import any daily CSVs.")
    p_db.set_defaults(func=cmd_dbload)

    # AHCCD download
    p_ahccd_dl = sub.add_parser(
        "ahccd-download",
        help="Download AHCCD daily data zip files (dm format) from ECCC.",
    )
    p_ahccd_dl.add_argument("--variable", "-v", nargs="+",
                            choices=list(AHCCD_DOWNLOADS.keys()),
                            help="Variables to download. Default: all. "
                                 f"Options: {', '.join(AHCCD_DOWNLOADS.keys())}")
    p_ahccd_dl.add_argument("--out", "-o", default="./ahccd",
                            help="Output directory (default: ./ahccd).")
    p_ahccd_dl.set_defaults(func=cmd_ahccd_download)

    # AHCCD load
    p_ahccd_load = sub.add_parser(
        "ahccd-load",
        help="Load AHCCD CSV files (Year,Mo,Day01..Day31) into daily_data.",
    )
    p_ahccd_load.add_argument("--data-dir", "-d", default="./ahccd/upload",
                              help="Directory containing AHCCD CSV files.")
    p_ahccd_load.add_argument("--dataset-id", type=int, default=DATASET_AHCCD_MEAN_TEMP,
                              help="Dataset ID to assign. Default: 2 (mean temp).")
    p_ahccd_load.add_argument("--column", "-c", default="mean_temp_c",
                              choices=["mean_temp_c", "max_temp_c", "min_temp_c",
                                       "total_rain_mm", "total_snow_cm", "total_precip_mm"],
                              help="Target column in daily_data for the values.")
    p_ahccd_load.add_argument("--host", default=os.environ.get("PGHOST", "localhost"))
    p_ahccd_load.add_argument("--port", default=os.environ.get("PGPORT", "5432"))
    p_ahccd_load.add_argument("--dbname", default=os.environ.get("PGDATABASE", "postgres"))
    p_ahccd_load.add_argument("--user", default=os.environ.get("PGUSER", "postgres"))
    p_ahccd_load.add_argument("--password", default=os.environ.get("PGPASSWORD", ""))
    p_ahccd_load.add_argument("--schema", default="public")
    p_ahccd_load.set_defaults(func=cmd_ahccd_load)

    # Road closures load
    p_road = sub.add_parser(
        "roadload",
        help="Load NWT road closure data from CSV into road_closures table.",
    )
    p_road.add_argument("--csv", default="./NWT_Roads_Combined_Full.csv",
                        help="Path to NWT_Roads_Combined_Full.csv "
                             "(default: ./NWT_Roads_Combined_Full.csv).")
    p_road.add_argument("--host", default=os.environ.get("PGHOST", "localhost"))
    p_road.add_argument("--port", default=os.environ.get("PGPORT", "5432"))
    p_road.add_argument("--dbname", default=os.environ.get("PGDATABASE", "postgres"))
    p_road.add_argument("--user", default=os.environ.get("PGUSER", "postgres"))
    p_road.add_argument("--password", default=os.environ.get("PGPASSWORD", ""))
    p_road.add_argument("--schema", default="public")
    p_road.add_argument("--drop", action="store_true",
                        help="Drop road_closures table before creating it.")
    p_road.set_defaults(func=cmd_roadload)

    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
