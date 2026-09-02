#!/usr/bin/env python3
"""
Climate data importer for the Winter Road Travel portal.

One script to download historical climate data from Environment and Climate
Change Canada (ECCC) and load it into PostgreSQL.

It handles two data sources:

  1. ECCC daily climate data  – one CSV per station, all years.
  2. AHCCD homogenized/adjusted daily data – fixed-width ".dm" files that are
     parsed in-memory (no intermediate CSV needed).

Both end up in the same `daily_data` table, tagged with a `dataset_id`.

Quick start (populate everything for NWT, Yukon, Nunavut):

    python climate_importer.py populate -p NT YT NU \
        --dbname wramp --user postgres --password password --drop

Individual steps:

    python climate_importer.py list      -p NT YT NU     # browse stations
    python climate_importer.py coverage  -p NT YT NU     # see year ranges
    python climate_importer.py download  -p NT YT NU      # ECCC daily -> ./data
    python climate_importer.py dbload    -p NT YT NU      # create tables + load
    python climate_importer.py ahccd                      # download + load AHCCD
    python climate_importer.py canhomp                    # CanHomP V2 precipitation
"""

from __future__ import annotations

import argparse
import csv
import io
import os
import re
import sys
import time
import tarfile
import unicodedata
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Iterable

import requests
from tqdm import tqdm

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

STATION_INVENTORY_URL = (
    "https://collaboration.cmc.ec.gc.ca/cmc/climate/"
    "Get_More_Data_Plus_de_donnees/Station%20Inventory%20EN.csv"
)
BULK_DATA_URL = "https://climate.weather.gc.ca/climate_data/bulk_data_e.html"
USER_AGENT = "climate-data-importer/2.0 (+https://climate.weather.gc.ca)"

# Short codes / aliases -> the province name used inside the inventory CSV.
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

# Dataset registry. id -> (name, source url).
DATASETS = {
    1: ("ECCC Daily Climate Data",
        "https://climate.weather.gc.ca/climate_data/bulk_data_e.html"),
    2: ("CanHomT V4 Homogenized Daily Temperature",
        "https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/CanHomTV4/CanHomT_dlyV4.tar.gz"),
    8: ("NWT Road Closures",
        "NWT_Roads_Combined_Full.csv"),
    9: ("GNWT Road Open/Close Dates (to 2025-26)",
        "GNWT Winter Road Open Closed_until 2025-26.xlsx; "
        "GNWT River Crossing TCWR Open Close_until 2025-26.xlsx"),
    10: ("CanHomP V2 Homogenized Daily Precipitation",
         "https://data-donnees.az.ec.gc.ca/api/file?path=%2Fclimate%2Fscientificknowledge"
         "%2Fadjusted-and-homogenized-canadian-climate-data-ahccd"
         "%2Fcanadian-homogenized-precipitation%2FCanHomPv2_Dly.zip"),
    11: ("CanHomP V2 Homogenized Monthly Precipitation",
         "https://data-donnees.az.ec.gc.ca/api/file?path=%2Fclimate%2Fscientificknowledge"
         "%2Fadjusted-and-homogenized-canadian-climate-data-ahccd"
         "%2Fcanadian-homogenized-precipitation%2FCanHomPv2_Mly.zip"),
}

DATASET_ECCC_DAILY = 1
DATASET_CANHOMT_TEMP = 2
DATASET_NWT_ROAD_CLOSURES = 8
DATASET_GNWT_ROAD_XLSX = 9
DATASET_CANHOMP_DAILY = 10
DATASET_CANHOMP_MONTHLY = 11

# CanHomT V4 homogenized daily temperature archive. It contains one CSV per
# station named "<climate_id>.csv" with columns:
#   time, tmax, tmax_flag, tmin, tmin_flag, tmean, tmean_flag
# (missing values are the string "NA"). This single source replaces the old
# per-variable AHCCD ".dm" downloads for max/min/mean temperature.
#
# Note: ECCC no longer publishes bulk *daily* adjusted precipitation; only
# monthly precipitation remains, so rain/snow/precip are not imported here.
CANHOMT_DAILY_URL = (
    "https://crd-data-donnees-rdc.ec.gc.ca/CDAS/products/CanHomTV4/CanHomT_dlyV4.tar.gz"
)

# CanHomP V2 homogenized precipitation. Two zip archives (daily and monthly),
# each holding one fixed-width "AdjTo_<climate_id>_dly.txt" / "_mly.txt" file
# per station inside a "CanHomPv2_{Dly,Mly}_Pub" folder.
CANHOMP_URLS = {
    "daily": DATASETS[DATASET_CANHOMP_DAILY][1],
    "monthly": DATASETS[DATASET_CANHOMP_MONTHLY][1],
}
CANHOMP_ARCHIVES = {"daily": "CanHomPv2_Dly.zip", "monthly": "CanHomPv2_Mly.zip"}
CANHOMP_SUBDIRS = {"daily": "CanHomPv2_Dly_Pub", "monthly": "CanHomPv2_Mly_Pub"}
CANHOMP_GLOBS = {"daily": "AdjTo_*_dly.txt", "monthly": "AdjTo_*_mly.txt"}
CANHOMP_DATASETS = {"daily": DATASET_CANHOMP_DAILY, "monthly": DATASET_CANHOMP_MONTHLY}

# Fixed-width column slices for the CanHomP V2 station files. Values are stored
# in tenths of a millimetre; -9999 marks a missing observation.
CANHOMP_SLICES = {
    "year": (0, 5), "month": (5, 9), "day": (9, 13),
    "homp": (13, 23), "homp_flag": (23, 27),
    "gfqcdp": (27, 37), "gfqcdp_flag": (37, 41),
    "adjp": (41, 51), "source_climate_id": (51, None),
}
CANHOMP_MISSING = -9999

# ECCC daily CSV header -> (db column, type). Order matters for the COPY.
_INT, _NUM, _TXT, _DATE = "int", "num", "txt", "date"
ECCC_COLUMNS: list[tuple[str, str, str]] = [
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

_FILENAME_STATION_RE = re.compile(r"_(\d+)_daily_\d+-\d+\.csv$")


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------

def _session() -> requests.Session:
    s = requests.Session()
    s.headers.update({"User-Agent": USER_AGENT})
    return s


def _get(session: requests.Session, url: str, **kwargs) -> requests.Response:
    """GET with up to 3 retries and exponential backoff."""
    for attempt in range(3):
        try:
            r = session.get(url, timeout=kwargs.pop("timeout", 60), **kwargs)
            r.raise_for_status()
            return r
        except requests.RequestException:
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)
    raise RuntimeError("unreachable")


def _normalize_province(value: str) -> str:
    return PROVINCE_ALIASES.get(value.strip().upper(), value.strip().upper())


def _normalize_name(name: str) -> str:
    """Uppercase, collapse non-alphanumerics to single underscores."""
    return re.sub(r"_+", "_", re.sub(r"[^A-Z0-9]+", "_", name.upper())).strip("_")


def _safe_filename(name: str) -> str:
    return "".join(c if c.isalnum() or c in "-_." else "_" for c in name).strip("_")


def _opt_int(value: str | None) -> int | None:
    value = (value or "").strip()
    try:
        return int(float(value)) if value else None
    except ValueError:
        return None


def _opt_num(value: str | None) -> str | None:
    value = (value or "").strip()
    if not value:
        return None
    try:
        float(value)
    except ValueError:
        return None
    return value


def _opt_txt(value: str | None) -> str | None:
    return (value or "").strip() or None


# ---------------------------------------------------------------------------
# Station inventory
# ---------------------------------------------------------------------------

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
        return bool(self.dly_first_year and self.dly_last_year)


def fetch_stations(session: requests.Session | None = None) -> list[Station]:
    """Download and parse the ECCC master station inventory."""
    session = session or _session()
    text = _get(session, STATION_INVENTORY_URL).content.decode("utf-8-sig", "replace")
    lines = text.splitlines()

    # The file has a few preamble lines before the real header row.
    header_idx = next(
        (i for i, line in enumerate(lines) if line.lstrip().startswith('"Name"')),
        None,
    )
    if header_idx is None:
        raise RuntimeError("Could not locate header row in station inventory CSV.")

    def f(row, key):
        return row.get(key, "").strip()

    stations: list[Station] = []
    for row in csv.DictReader(lines[header_idx:]):
        if not row.get("Name"):
            continue
        stations.append(Station(
            name=f(row, "Name"),
            province=f(row, "Province"),
            climate_id=f(row, "Climate ID"),
            station_id=f(row, "Station ID"),
            wmo_id=f(row, "WMO ID"),
            tc_id=f(row, "TC ID"),
            latitude=f(row, "Latitude (Decimal Degrees)"),
            longitude=f(row, "Longitude (Decimal Degrees)"),
            elevation=f(row, "Elevation (m)"),
            first_year=f(row, "First Year"),
            last_year=f(row, "Last Year"),
            hly_first_year=f(row, "HLY First Year"),
            hly_last_year=f(row, "HLY Last Year"),
            dly_first_year=f(row, "DLY First Year"),
            dly_last_year=f(row, "DLY Last Year"),
            mly_first_year=f(row, "MLY First Year"),
            mly_last_year=f(row, "MLY Last Year"),
        ))
    return stations


def filter_by_provinces(stations: Iterable[Station],
                        provinces: Iterable[str]) -> list[Station]:
    wanted = {_normalize_province(p) for p in provinces}
    return [s for s in stations if s.province.upper() in wanted]


def select_stations(stations: list[Station], args: argparse.Namespace) -> list[Station]:
    """Apply --station-id / --province filters from the CLI."""
    if getattr(args, "station_id", None):
        ids = set(args.station_id)
        return [s for s in stations if s.station_id in ids]
    if getattr(args, "province", None):
        return filter_by_provinces(stations, args.province)
    return stations


# ---------------------------------------------------------------------------
# ECCC daily download
# ---------------------------------------------------------------------------

def download_station_daily(station: Station, out_dir: Path,
                           session: requests.Session,
                           overwrite: bool = False) -> Path | None:
    """Download all daily years for one station into a single CSV file."""
    if not station.has_daily:
        return None

    start, end = int(station.dly_first_year), int(station.dly_last_year)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / (
        f"{_safe_filename(station.name)}_{station.station_id}_daily_{start}-{end}.csv"
    )
    if out_path.exists() and not overwrite:
        return out_path

    header_written = False
    with out_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        for year in range(start, end + 1):
            r = _get(session, BULK_DATA_URL, params={
                "format": "csv", "stationID": station.station_id,
                "Year": year, "Month": 1, "Day": 1,
                "timeframe": 2, "submit": "Download+Data",
            })
            rows = list(csv.reader(io.StringIO(
                r.content.decode("utf-8-sig", "replace"))))
            if not rows:
                continue
            if not header_written:
                writer.writerow(rows[0])
                header_written = True
            writer.writerows(rows[1:])
            time.sleep(0.25)

    if not header_written:
        out_path.unlink(missing_ok=True)
        return None
    return out_path


def download_eccc(stations: list[Station], out_dir: Path,
                  workers: int, overwrite: bool) -> int:
    """Download daily CSVs for every station that has daily data."""
    targets = [s for s in stations if s.has_daily]
    if not targets:
        print("No matching stations with daily data.", file=sys.stderr)
        return 0

    print(f"Downloading daily data for {len(targets)} station(s) -> {out_dir}")
    session = _session()
    written, errors = 0, []

    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {
            pool.submit(download_station_daily, s, out_dir, session, overwrite): s
            for s in targets
        }
        for fut in tqdm(as_completed(futures), total=len(futures), unit="station"):
            try:
                if fut.result():
                    written += 1
            except Exception as exc:  # noqa: BLE001
                errors.append((futures[fut].name, str(exc)))

    print(f"Done. Wrote {written} CSV file(s).")
    for name, err in errors:
        print(f"  - {name}: {err}", file=sys.stderr)
    return written


# ---------------------------------------------------------------------------
# CanHomT V4 homogenized daily temperature
# ---------------------------------------------------------------------------

def download_canhomt(out_dir: Path, session: requests.Session,
                     overwrite: bool = False) -> Path:
    """Download and extract the CanHomT V4 daily temperature archive.

    Returns the directory holding the per-station "<climate_id>.csv" files.
    Re-uses an existing extraction unless ``overwrite`` is set.
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    csv_dir = out_dir / "CanHomT_dlyV4"
    if csv_dir.is_dir() and any(csv_dir.glob("*.csv")) and not overwrite:
        return csv_dir

    archive = out_dir / "CanHomT_dlyV4.tar.gz"
    print(f"Downloading CanHomT V4 daily temperature: {CANHOMT_DAILY_URL}")
    r = _get(session, CANHOMT_DAILY_URL, timeout=300, stream=True)
    with archive.open("wb") as f:
        for chunk in r.iter_content(chunk_size=1 << 16):
            f.write(chunk)

    csv_dir.mkdir(parents=True, exist_ok=True)
    print(f"  Extracting to {csv_dir}/")
    with tarfile.open(archive, "r:gz") as tf:
        for member in tf.getmembers():
            if member.isfile() and member.name.endswith(".csv"):
                member.name = os.path.basename(member.name)  # flatten paths
                tf.extract(member, csv_dir)
    archive.unlink(missing_ok=True)
    return csv_dir


def parse_canhomt_csv(path: Path) -> list[tuple]:
    """Parse one CanHomT V4 station CSV.

    Returns rows of (date, tmax, tmax_flag, tmin, tmin_flag, tmean, tmean_flag)
    with "NA"/blank values normalized to None. Rows with no temperature at all
    are skipped.
    """
    rows: list[tuple] = []
    with path.open("r", encoding="utf-8", newline="") as fh:
        for row in csv.DictReader(fh):
            date = (row.get("time") or "").strip()
            if not date:
                continue
            tmax = _opt_num(row.get("tmax"))
            tmin = _opt_num(row.get("tmin"))
            tmean = _opt_num(row.get("tmean"))
            if tmax is None and tmin is None and tmean is None:
                continue
            rows.append((
                date,
                tmax, _opt_txt(row.get("tmax_flag")),
                tmin, _opt_txt(row.get("tmin_flag")),
                tmean, _opt_txt(row.get("tmean_flag")),
            ))
    return rows


# ---------------------------------------------------------------------------
# CanHomP V2 homogenized precipitation
# ---------------------------------------------------------------------------

def download_canhomp(kind: str, out_dir: Path, session: requests.Session,
                     overwrite: bool = False) -> Path:
    """Download and extract a CanHomP V2 archive ("daily" or "monthly").

    Returns the directory holding the per-station "AdjTo_<climate_id>_*.txt"
    files. Re-uses an existing extraction unless ``overwrite`` is set.
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    txt_dir = out_dir / CANHOMP_SUBDIRS[kind]
    if txt_dir.is_dir() and any(txt_dir.glob(CANHOMP_GLOBS[kind])) and not overwrite:
        return txt_dir

    url = CANHOMP_URLS[kind]
    archive = out_dir / CANHOMP_ARCHIVES[kind]
    print(f"Downloading CanHomP V2 {kind} precipitation: {CANHOMP_ARCHIVES[kind]}")
    r = _get(session, url, timeout=600, stream=True)
    with archive.open("wb") as f:
        for chunk in r.iter_content(chunk_size=1 << 16):
            f.write(chunk)

    txt_dir.mkdir(parents=True, exist_ok=True)
    print(f"  Extracting to {txt_dir}/")
    with zipfile.ZipFile(archive) as zf:
        for member in zf.infolist():
            if member.is_dir() or not member.filename.lower().endswith(".txt"):
                continue
            name = os.path.basename(member.filename)
            if not name.startswith("AdjTo_"):
                continue
            with zf.open(member) as src, (txt_dir / name).open("wb") as dst:
                dst.write(src.read())
    archive.unlink(missing_ok=True)
    return txt_dir


def _canhomp_field(line: str, key: str) -> str:
    start, end = CANHOMP_SLICES[key]
    return line[start:end if end is not None else len(line)].strip()


def _canhomp_mm(raw: str) -> str | None:
    """Convert a CanHomP value in tenths of a mm to millimetres."""
    if not raw:
        return None
    try:
        value = int(raw)
    except ValueError:
        return None
    return None if value == CANHOMP_MISSING else f"{value / 10:.1f}"


def parse_canhomp_file(path: Path, monthly: bool = False) -> list[tuple]:
    """Parse one fixed-width CanHomP V2 station file.

    Returns rows of (year, month, day, homog_mm, homog_flag, gapfill_mm,
    gapfill_flag, adj_mm, source_climate_id). ``day`` is always 0 for monthly
    files. Rows with no precipitation value at all are skipped.
    """
    rows: list[tuple] = []
    with path.open("r", encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.rstrip("\n").rstrip("\r")
            if not line.strip() or line.startswith("#"):
                continue
            year = _opt_int(_canhomp_field(line, "year"))
            month = _opt_int(_canhomp_field(line, "month"))
            day = _opt_int(_canhomp_field(line, "day"))
            if year is None or month is None or not 1 <= month <= 12:
                continue
            if monthly:
                day = 0
            else:
                if not day:
                    continue
                try:
                    date(year, month, day)
                except ValueError:
                    continue
            homog = _canhomp_mm(_canhomp_field(line, "homp"))
            gapfill = _canhomp_mm(_canhomp_field(line, "gfqcdp"))
            adj = _canhomp_mm(_canhomp_field(line, "adjp"))
            if homog is None and gapfill is None and adj is None:
                continue
            rows.append((
                year, month, day,
                homog, _opt_txt(_canhomp_field(line, "homp_flag")),
                gapfill, _opt_txt(_canhomp_field(line, "gfqcdp_flag")),
                adj, _opt_txt(_canhomp_field(line, "source_climate_id")),
            ))
    return rows


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

DDL = """
CREATE TABLE IF NOT EXISTS {s}.datasets (
    id            INTEGER PRIMARY KEY,
    name          VARCHAR,
    timecreated   INTEGER,
    timeupdated   INTEGER,
    resourcelink  VARCHAR
);

CREATE TABLE IF NOT EXISTS {s}.weather_stations (
    station_id     INTEGER PRIMARY KEY,
    name           TEXT NOT NULL,
    province       TEXT,
    climate_id     TEXT,
    wmo_id         TEXT,
    tc_id          TEXT,
    latitude       NUMERIC(9, 5),
    longitude      NUMERIC(9, 5),
    elevation_m    NUMERIC(8, 2),
    first_year     INTEGER,
    last_year      INTEGER,
    hly_first_year INTEGER,
    hly_last_year  INTEGER,
    dly_first_year INTEGER,
    dly_last_year  INTEGER,
    mly_first_year INTEGER,
    mly_last_year  INTEGER
);
CREATE INDEX IF NOT EXISTS weather_stations_province_idx
    ON {s}.weather_stations (province);
CREATE INDEX IF NOT EXISTS weather_stations_climate_id_idx
    ON {s}.weather_stations (climate_id);

CREATE TABLE IF NOT EXISTS {s}.daily_data (
    id                      BIGSERIAL PRIMARY KEY,
    station_id              INTEGER NOT NULL
        REFERENCES {s}.weather_stations(station_id) ON DELETE CASCADE,
    obs_date                DATE NOT NULL,
    year                    INTEGER,
    month                   INTEGER,
    day                     INTEGER,
    data_quality            TEXT,
    max_temp_c              NUMERIC(6, 2),
    max_temp_flag           TEXT,
    min_temp_c              NUMERIC(6, 2),
    min_temp_flag           TEXT,
    mean_temp_c             NUMERIC(6, 2),
    mean_temp_flag          TEXT,
    heat_deg_days_c         NUMERIC(6, 2),
    heat_deg_days_flag      TEXT,
    cool_deg_days_c         NUMERIC(6, 2),
    cool_deg_days_flag      TEXT,
    total_rain_mm           NUMERIC(7, 2),
    total_rain_flag         TEXT,
    total_snow_cm           NUMERIC(7, 2),
    total_snow_flag         TEXT,
    total_precip_mm         NUMERIC(7, 2),
    total_precip_flag       TEXT,
    snow_on_grnd_cm         NUMERIC(7, 2),
    snow_on_grnd_flag       TEXT,
    dir_of_max_gust_10s_deg NUMERIC(5, 1),
    dir_of_max_gust_flag    TEXT,
    spd_of_max_gust_kmh     NUMERIC(6, 1),
    spd_of_max_gust_flag    TEXT,
    dataset_id              INTEGER REFERENCES {s}.datasets(id) ON DELETE SET NULL,
    CONSTRAINT daily_data_station_date_uniq UNIQUE (station_id, obs_date)
);
CREATE INDEX IF NOT EXISTS daily_data_station_idx ON {s}.daily_data (station_id);
CREATE INDEX IF NOT EXISTS daily_data_date_idx ON {s}.daily_data (obs_date);
CREATE INDEX IF NOT EXISTS daily_data_dataset_idx ON {s}.daily_data (dataset_id);

CREATE TABLE IF NOT EXISTS {s}.road_closures (
    id            BIGSERIAL PRIMARY KEY,
    dataset_id    INTEGER REFERENCES {s}.datasets(id) ON DELETE SET NULL,
    year          INTEGER NOT NULL,
    road_name     TEXT NOT NULL,
    road_type     TEXT NOT NULL,
    status        TEXT NOT NULL,
    month         INTEGER,
    day           INTEGER,
    CONSTRAINT road_closures_dataset_year_road_status_uniq
        UNIQUE (dataset_id, year, road_name, status)
);
CREATE INDEX IF NOT EXISTS road_closures_year_idx ON {s}.road_closures (year);
CREATE INDEX IF NOT EXISTS road_closures_road_name_idx ON {s}.road_closures (road_name);
CREATE INDEX IF NOT EXISTS road_closures_road_type_idx ON {s}.road_closures (road_type);
CREATE INDEX IF NOT EXISTS road_closures_dataset_idx ON {s}.road_closures (dataset_id);

CREATE TABLE IF NOT EXISTS {s}.precip_daily_data (
    id                    BIGSERIAL PRIMARY KEY,
    station_id            INTEGER NOT NULL
        REFERENCES {s}.weather_stations(station_id) ON DELETE CASCADE,
    obs_date              DATE NOT NULL,
    year                  INTEGER,
    month                 INTEGER,
    day                   INTEGER,
    homog_precip_mm       NUMERIC(8, 2),
    homog_precip_flag     TEXT,
    gapfill_precip_mm     NUMERIC(8, 2),
    gapfill_precip_flag   TEXT,
    adj_precip_mm         NUMERIC(8, 2),
    source_climate_id     TEXT,
    dataset_id            INTEGER REFERENCES {s}.datasets(id) ON DELETE SET NULL,
    CONSTRAINT precip_daily_data_station_date_dataset_uniq
        UNIQUE (station_id, obs_date, dataset_id)
);
CREATE INDEX IF NOT EXISTS precip_daily_data_station_idx
    ON {s}.precip_daily_data (station_id);
CREATE INDEX IF NOT EXISTS precip_daily_data_date_idx
    ON {s}.precip_daily_data (obs_date);
CREATE INDEX IF NOT EXISTS precip_daily_data_dataset_idx
    ON {s}.precip_daily_data (dataset_id);

CREATE TABLE IF NOT EXISTS {s}.precip_monthly_data (
    id                    BIGSERIAL PRIMARY KEY,
    station_id            INTEGER NOT NULL
        REFERENCES {s}.weather_stations(station_id) ON DELETE CASCADE,
    year                  INTEGER NOT NULL,
    month                 INTEGER NOT NULL,
    homog_precip_mm       NUMERIC(9, 2),
    homog_precip_flag     TEXT,
    gapfill_precip_mm     NUMERIC(9, 2),
    gapfill_precip_flag   TEXT,
    adj_precip_mm         NUMERIC(9, 2),
    source_climate_id     TEXT,
    dataset_id            INTEGER REFERENCES {s}.datasets(id) ON DELETE SET NULL,
    CONSTRAINT precip_monthly_data_station_ym_dataset_uniq
        UNIQUE (station_id, year, month, dataset_id)
);
CREATE INDEX IF NOT EXISTS precip_monthly_data_station_idx
    ON {s}.precip_monthly_data (station_id);
CREATE INDEX IF NOT EXISTS precip_monthly_data_year_idx
    ON {s}.precip_monthly_data (year);
CREATE INDEX IF NOT EXISTS precip_monthly_data_dataset_idx
    ON {s}.precip_monthly_data (dataset_id);
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
    "D\u00e9l\u012fne Winter Road":
        ("D\u00e9l\u012fne Winter Road", "WINTER ROAD"),
    "Sambaa K'e Winter Road":
        ("Sambaa K\u2019e Winter Road", "WINTER ROAD"),
    "Nahanni Butte Winter Road":
        ("Nahanni Butte Winter Road", "WINTER ROAD"),
    "Wekw\u00e8\u00e8t\u00ec Winter Road":
        ("Wekw\u00e8\u00e8t\u00ec Winter Road", "WINTER ROAD"),
    "What\u00ec Winter Road":
        ("What\u00ec Winter Road", "WINTER ROAD"),
    "Gam\u00e8t\u00ec Winter Road":
        ("Gam\u00e8t\u00ec Winter Road", "WINTER ROAD"),
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

# Column headers in the GNWT XLSX workbooks -> (canonical road_name, road_type).
# Canonical names match the ones already used by the CSV importer so the API
# can fall back between datasets per road. Headers are matched after
# strip() + NFC normalization (the workbooks have trailing spaces and a few
# spelling differences, e.g. "Tsiighetchic").
XLSX_ROAD_COLUMNS: dict[str, tuple[str, str]] = {
    # GNWT Winter Road Open Closed workbook
    "Ft. Simpson - Wrigley":
        ("Ft. Simpson - Wrigley (Highway #1)", "WINTER ROAD"),
    "Wrigley to Tulita Winter Road":
        ("Wrigley to Tulita Winter Road (Highway #1)", "WINTER ROAD"),
    "Tulita to Norman Wells Winter Road":
        ("Tulita to Norman Wells Winter Road (Highway #1)", "WINTER ROAD"),
    "Norman Wells to Fort Good Hope Winter Road":
        ("Norman Wells to Fort Good Hope Winter Road (Highway #1)", "WINTER ROAD"),
    "Colville Lake Winter Road":
        ("Colville Lake Winter Road", "WINTER ROAD"),
    "Délįne Winter Road":
        ("Délįne Winter Road", "WINTER ROAD"),
    "Sambaa K'e Winter Road":
        ("Sambaa K’e Winter Road", "WINTER ROAD"),
    "Nahanni Butte Winter Road":
        ("Nahanni Butte Winter Road", "WINTER ROAD"),
    "Wekweètì Winter Road":
        ("Wekweètì Winter Road", "WINTER ROAD"),
    "Whatì Winter Road":
        ("Whatì Winter Road", "WINTER ROAD"),
    "Gamètì Winter Road":
        ("Gamètì Winter Road", "WINTER ROAD"),
    "Dettah Ice Road":
        ("Dettah Ice Road", "ICE ROAD"),
    "Aklavik Ice Road":
        ("Aklavik Ice Road", "ICE ROAD"),
    # GNWT River Crossing TCWR workbook
    "Mackenzie River Crossing at Fort Providence":
        ("Mackenzie River Crossing at Fort Providence", "ICE CROSSING"),
    "Liard River Crossing at Fort Simpson":
        ("Liard River Crossing at Fort Simpson", "ICE CROSSING"),
    "Mackenzie River Crossing at Tsiighetchic":
        ("Mackenzie River Crossing at Tsiigehtchic", "ICE CROSSING"),
    "Peel River Crossing":
        ("Peel River Crossing", "ICE CROSSING"),
    "Mackenzie River Crossing at Camsell Bend":
        ("Mackenzie River Crossing at Camsell Bend", "ICE CROSSING"),
    "Tibbitt-Contwoyto Winter Road":
        ("Tibbitt-Contwoyto Winter Road", "PRIVATE MINING ROAD"),
}


def _import_psycopg():
    try:
        import psycopg
        from psycopg import sql
        return psycopg, sql
    except ImportError:
        sys.exit("psycopg is required. Install it with: pip install 'psycopg[binary]'")


def _conninfo(args: argparse.Namespace) -> str:
    return (f"host={args.host} port={args.port} dbname={args.dbname} "
            f"user={args.user} password={args.password}")


def _migrate_road_closures(cur, sql, schema: str) -> None:
    """Widen the road_closures unique key to include dataset_id.

    Older databases used UNIQUE (year, road_name, status), which prevents a
    second data source from storing the same road/season. Replace it with
    UNIQUE (dataset_id, year, road_name, status) when the old constraint is
    still present.
    """
    cur.execute(sql.SQL(
        "ALTER TABLE {s}.road_closures "
        "DROP CONSTRAINT IF EXISTS road_closures_year_road_status_uniq"
    ).format(s=sql.Identifier(schema)))
    cur.execute(
        "SELECT 1 FROM pg_constraint "
        "WHERE conname = 'road_closures_dataset_year_road_status_uniq'")
    if cur.fetchone() is None:
        cur.execute(sql.SQL(
            "ALTER TABLE {s}.road_closures "
            "ADD CONSTRAINT road_closures_dataset_year_road_status_uniq "
            "UNIQUE (dataset_id, year, road_name, status)"
        ).format(s=sql.Identifier(schema)))


def ensure_schema(conn, sql, schema: str, drop: bool = False) -> None:
    """Create the schema, tables and dataset registry rows."""
    with conn.cursor() as cur:
        cur.execute(sql.SQL("CREATE SCHEMA IF NOT EXISTS {}").format(
            sql.Identifier(schema)))
        if drop:
            print("Dropping existing tables...")
            for table in ("road_closures", "precip_daily_data", "precip_monthly_data",
                          "daily_data", "weather_stations", "datasets"):
                cur.execute(sql.SQL("DROP TABLE IF EXISTS {}.{} CASCADE").format(
                    sql.Identifier(schema), sql.Identifier(table)))
        cur.execute(DDL.format(s=schema))
        _migrate_road_closures(cur, sql, schema)

        now = int(time.time())
        for ds_id, (ds_name, ds_link) in DATASETS.items():
            cur.execute(sql.SQL("""
                INSERT INTO {s}.datasets (id, name, timecreated, timeupdated, resourcelink)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    timeupdated = EXCLUDED.timeupdated,
                    resourcelink = EXCLUDED.resourcelink
            """).format(s=sql.Identifier(schema)), (ds_id, ds_name, now, now, ds_link))
    conn.commit()


def upsert_stations(conn, sql, schema: str, stations: list[Station]) -> None:
    upsert = sql.SQL("""
        INSERT INTO {s}.weather_stations
            (station_id, name, province, climate_id, wmo_id, tc_id,
             latitude, longitude, elevation_m, first_year, last_year,
             hly_first_year, hly_last_year, dly_first_year, dly_last_year,
             mly_first_year, mly_last_year)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (station_id) DO UPDATE SET
            name = EXCLUDED.name, province = EXCLUDED.province,
            climate_id = EXCLUDED.climate_id, wmo_id = EXCLUDED.wmo_id,
            tc_id = EXCLUDED.tc_id, latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude, elevation_m = EXCLUDED.elevation_m,
            first_year = EXCLUDED.first_year, last_year = EXCLUDED.last_year,
            hly_first_year = EXCLUDED.hly_first_year, hly_last_year = EXCLUDED.hly_last_year,
            dly_first_year = EXCLUDED.dly_first_year, dly_last_year = EXCLUDED.dly_last_year,
            mly_first_year = EXCLUDED.mly_first_year, mly_last_year = EXCLUDED.mly_last_year
    """).format(s=sql.Identifier(schema))

    print(f"Upserting {len(stations)} station(s)...")
    with conn.cursor() as cur:
        for s in tqdm(stations, desc="Stations", unit="stn"):
            if not s.station_id:
                continue
            cur.execute(upsert, (
                int(s.station_id), s.name, s.province,
                s.climate_id or None, s.wmo_id or None, s.tc_id or None,
                _opt_num(s.latitude), _opt_num(s.longitude), _opt_num(s.elevation),
                _opt_int(s.first_year), _opt_int(s.last_year),
                _opt_int(s.hly_first_year), _opt_int(s.hly_last_year),
                _opt_int(s.dly_first_year), _opt_int(s.dly_last_year),
                _opt_int(s.mly_first_year), _opt_int(s.mly_last_year),
            ))
    conn.commit()


def _parse_eccc_row(row: dict[str, str]) -> tuple | None:
    out: list[object] = []
    for csv_key, _col, kind in ECCC_COLUMNS:
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


def load_eccc_csvs(conn, sql, schema: str, data_dir: Path,
                   valid_ids: set[int]) -> None:
    """Bulk-load ECCC daily CSVs via a temp staging table + ON CONFLICT merge."""
    csv_files = sorted(data_dir.glob("*_daily_*.csv"))
    if not csv_files:
        print(f"No daily CSV files found in {data_dir}.")
        return
    print(f"Loading {len(csv_files)} ECCC daily CSV file(s) from {data_dir}")

    columns = ["station_id"] + [c for _, c, _ in ECCC_COLUMNS] + ["dataset_id"]
    copy_sql = sql.SQL("COPY daily_stage ({cols}) FROM STDIN").format(
        cols=sql.SQL(", ").join(map(sql.Identifier, columns)))
    merge_sql = sql.SQL("""
        INSERT INTO {s}.daily_data ({cols})
        SELECT {cols} FROM daily_stage
        ON CONFLICT (station_id, obs_date) DO NOTHING
    """).format(s=sql.Identifier(schema),
                cols=sql.SQL(", ").join(map(sql.Identifier, columns)))

    total, skipped = 0, 0
    pbar = tqdm(csv_files, desc="ECCC CSVs", unit="file")
    for csv_path in pbar:
        m = _FILENAME_STATION_RE.search(csv_path.name)
        station_id = int(m.group(1)) if m else None
        if station_id is None or (valid_ids and station_id not in valid_ids):
            skipped += 1
            continue

        with conn.cursor() as cur:
            cur.execute("DROP TABLE IF EXISTS daily_stage")
            cur.execute(sql.SQL(
                "CREATE TEMP TABLE daily_stage (LIKE {}.daily_data INCLUDING ALL)"
            ).format(sql.Identifier(schema)))
            with csv_path.open("r", encoding="utf-8", newline="") as fh, \
                    cur.copy(copy_sql) as copy:
                for row in csv.DictReader(fh):
                    parsed = _parse_eccc_row(row)
                    if parsed is not None:
                        copy.write_row((station_id, *parsed, DATASET_ECCC_DAILY))
                        total += 1
            cur.execute(merge_sql)
            conn.commit()
        pbar.set_postfix(rows=total, skipped=skipped)
    pbar.close()
    print(f"Done. Inserted {total:,} ECCC daily row(s) "
          f"({skipped} file(s) skipped).")


def _station_lookup(conn, sql, schema: str) -> tuple[dict[str, int], dict[str, int]]:
    """Return (by_climate_id, by_normalized_name) lookups for AHCCD matching."""
    with conn.cursor() as cur:
        cur.execute(sql.SQL(
            "SELECT station_id, name, climate_id FROM {}.weather_stations"
        ).format(sql.Identifier(schema)))
        rows = cur.fetchall()
    by_climate = {cid.strip(): sid for sid, _name, cid in rows if cid}
    by_name = {_normalize_name(name): sid for sid, name, _cid in rows if name}
    return by_climate, by_name


def load_canhomt(conn, sql, schema: str, csv_dir: Path) -> None:
    """Load CanHomT V4 daily temperature CSVs into daily_data.

    Each file is named "<climate_id>.csv" and carries max/min/mean temperature
    for one station. Stations are matched to weather_stations by Climate ID.
    """
    files = sorted(csv_dir.glob("*.csv"))
    if not files:
        print(f"No CanHomT CSV files found in {csv_dir}.")
        return
    print(f"Loading {len(files)} CanHomT V4 temperature file(s) from {csv_dir}")

    by_climate, _ = _station_lookup(conn, sql, schema)
    upsert = sql.SQL("""
        INSERT INTO {s}.daily_data
            (station_id, obs_date, year, month, day,
             max_temp_c, max_temp_flag, min_temp_c, min_temp_flag,
             mean_temp_c, mean_temp_flag, dataset_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (station_id, obs_date) DO UPDATE SET
            max_temp_c = EXCLUDED.max_temp_c,
            max_temp_flag = EXCLUDED.max_temp_flag,
            min_temp_c = EXCLUDED.min_temp_c,
            min_temp_flag = EXCLUDED.min_temp_flag,
            mean_temp_c = EXCLUDED.mean_temp_c,
            mean_temp_flag = EXCLUDED.mean_temp_flag,
            dataset_id = COALESCE({s}.daily_data.dataset_id, EXCLUDED.dataset_id)
    """).format(s=sql.Identifier(schema))

    total, skipped = 0, 0
    pbar = tqdm(files, desc="CanHomT files", unit="file")
    for path in pbar:
        climate_id = path.stem.strip()
        station_id = by_climate.get(climate_id)
        rows = parse_canhomt_csv(path)
        if station_id is None or not rows:
            skipped += 1
            continue
        params = [
            (station_id, date, int(date[:4]), int(date[5:7]), int(date[8:10]),
             tmax, tmax_f, tmin, tmin_f, tmean, tmean_f, DATASET_CANHOMT_TEMP)
            for date, tmax, tmax_f, tmin, tmin_f, tmean, tmean_f in rows
        ]
        with conn.cursor() as cur:
            cur.executemany(upsert, params)
            conn.commit()
        total += len(params)
        pbar.set_postfix(rows=total, skipped=skipped)
    pbar.close()
    print(f"Done. Inserted/updated {total:,} temperature row(s) "
          f"({skipped} file(s) skipped).")


def _add_stations_by_climate_id(conn, sql, schema: str,
                                climate_ids: set[str]) -> dict[str, int]:
    """Insert weather_stations rows for climate IDs missing from the database.

    Station metadata comes from the ECCC master inventory. When several
    inventory entries share a Climate ID the one with the widest daily record
    is used. Returns the newly added {climate_id: station_id} mappings.
    """
    if not climate_ids:
        return {}
    print(f"Looking up {len(climate_ids)} unknown Climate ID(s) in the ECCC inventory...")
    best: dict[str, Station] = {}
    for s in fetch_stations():
        cid = (s.climate_id or "").strip()
        if cid not in climate_ids or not s.station_id:
            continue
        current = best.get(cid)
        if current is None or _coverage_span(s) > _coverage_span(current):
            best[cid] = s
    if not best:
        print("  No matching inventory entries found.")
        return {}
    upsert_stations(conn, sql, schema, list(best.values()))
    return {cid: int(s.station_id) for cid, s in best.items()}


def _coverage_span(s: Station) -> int:
    first = _opt_int(s.first_year) or 0
    last = _opt_int(s.last_year) or 0
    return max(last - first, 0)


def load_canhomp(conn, sql, schema: str, txt_dir: Path, kind: str,
                 add_missing_stations: bool = True) -> None:
    """Load CanHomP V2 precipitation files into precip_daily/monthly_data.

    ``kind`` is "daily" or "monthly". Files are matched to weather_stations by
    Climate ID; unknown stations are pulled from the ECCC inventory first when
    ``add_missing_stations`` is set.
    """
    monthly = kind == "monthly"
    files = sorted(txt_dir.glob(CANHOMP_GLOBS[kind]))
    if not files:
        print(f"No CanHomP {kind} files found in {txt_dir}.")
        return
    print(f"Loading {len(files)} CanHomP V2 {kind} precipitation file(s) from {txt_dir}")

    suffix = "_mly.txt" if monthly else "_dly.txt"
    by_file = {p: p.name[len("AdjTo_"):-len(suffix)] for p in files}
    by_climate, _ = _station_lookup(conn, sql, schema)
    if add_missing_stations:
        missing = {cid for cid in by_file.values() if cid not in by_climate}
        by_climate.update(_add_stations_by_climate_id(conn, sql, schema, missing))

    table = "precip_monthly_data" if monthly else "precip_daily_data"
    key_cols = ["station_id", "year", "month"] if monthly else ["station_id", "obs_date"]
    columns = (["station_id", "year", "month"] if monthly else
               ["station_id", "obs_date", "year", "month", "day"])
    columns += ["homog_precip_mm", "homog_precip_flag",
                "gapfill_precip_mm", "gapfill_precip_flag",
                "adj_precip_mm", "source_climate_id", "dataset_id"]
    update_cols = columns[len(key_cols) if monthly else 2:]

    copy_sql = sql.SQL("COPY precip_stage ({cols}) FROM STDIN").format(
        cols=sql.SQL(", ").join(map(sql.Identifier, columns)))
    merge_sql = sql.SQL("""
        INSERT INTO {s}.{t} ({cols})
        SELECT {cols} FROM precip_stage
        ON CONFLICT ({keys}, dataset_id) DO UPDATE SET {updates}
    """).format(
        s=sql.Identifier(schema), t=sql.Identifier(table),
        cols=sql.SQL(", ").join(map(sql.Identifier, columns)),
        keys=sql.SQL(", ").join(map(sql.Identifier, key_cols)),
        updates=sql.SQL(", ").join(
            sql.SQL("{c} = EXCLUDED.{c}").format(c=sql.Identifier(c))
            for c in update_cols if c != "dataset_id"),
    )

    dataset_id = CANHOMP_DATASETS[kind]
    total, skipped = 0, 0
    pbar = tqdm(files, desc=f"CanHomP {kind}", unit="file")
    for path in pbar:
        station_id = by_climate.get(by_file[path])
        rows = parse_canhomp_file(path, monthly=monthly)
        if station_id is None or not rows:
            skipped += 1
            continue
        with conn.cursor() as cur:
            cur.execute("DROP TABLE IF EXISTS precip_stage")
            cur.execute(sql.SQL(
                "CREATE TEMP TABLE precip_stage (LIKE {}.{} INCLUDING DEFAULTS)"
            ).format(sql.Identifier(schema), sql.Identifier(table)))
            with cur.copy(copy_sql) as copy:
                for (year, month, day, homog, homog_f,
                     gapfill, gapfill_f, adj, src) in rows:
                    lead = ((station_id, year, month) if monthly else
                            (station_id, f"{year:04d}-{month:02d}-{day:02d}",
                             year, month, day))
                    copy.write_row((*lead, homog, homog_f, gapfill, gapfill_f,
                                    adj, src, dataset_id))
                    total += 1
            cur.execute(merge_sql)
            conn.commit()
        pbar.set_postfix(rows=total, skipped=skipped)
    pbar.close()
    print(f"Done. Inserted/updated {total:,} CanHomP {kind} row(s) "
          f"({skipped} file(s) skipped).")


# ---------------------------------------------------------------------------
# CLI commands
# ---------------------------------------------------------------------------

def cmd_list(args: argparse.Namespace) -> int:
    stations = sorted(select_stations(fetch_stations(), args), key=lambda s: s.name)
    print(f"{'StationID':>10}  {'ClimateID':<10}  {'Province':<24}  Name")
    print("-" * 90)
    for s in stations:
        print(f"{s.station_id:>10}  {s.climate_id:<10}  {s.province:<24}  {s.name}")
    print(f"\nTotal: {len(stations)} stations")
    return 0


def cmd_coverage(args: argparse.Namespace) -> int:
    stations = sorted(select_stations(fetch_stations(), args), key=lambda s: s.name)
    print(f"{'StationID':>10}  {'Name':<40}  {'Daily':<13}  {'Hourly':<13}  {'Monthly':<13}")
    print("-" * 100)
    for s in stations:
        d = f"{s.dly_first_year}-{s.dly_last_year}" if s.has_daily else "—"
        h = f"{s.hly_first_year}-{s.hly_last_year}" if s.hly_first_year and s.hly_last_year else "—"
        m = f"{s.mly_first_year}-{s.mly_last_year}" if s.mly_first_year and s.mly_last_year else "—"
        print(f"{s.station_id:>10}  {s.name[:40]:<40}  {d:<13}  {h:<13}  {m:<13}")
    print(f"\n{sum(s.has_daily for s in stations)}/{len(stations)} stations have daily data.")
    return 0


def cmd_download(args: argparse.Namespace) -> int:
    stations = select_stations(fetch_stations(), args)
    download_eccc(stations, Path(args.out), args.workers, args.overwrite)
    return 0


def cmd_dbload(args: argparse.Namespace) -> int:
    psycopg, sql = _import_psycopg()
    print("Fetching station inventory...")
    all_stations = fetch_stations()
    stations = filter_by_provinces(all_stations, args.province) if args.province else all_stations

    with psycopg.connect(_conninfo(args)) as conn:
        ensure_schema(conn, sql, args.schema, drop=args.drop)
        upsert_stations(conn, sql, args.schema, stations)
        if args.skip_data:
            print("Skipping daily-data import (--skip-data).")
            return 0
        data_dir = Path(args.data_dir)
        if not data_dir.is_dir():
            print(f"Data directory not found: {data_dir}", file=sys.stderr)
            return 1
        valid_ids = {int(s.station_id) for s in stations if s.station_id}
        load_eccc_csvs(conn, sql, args.schema, data_dir, valid_ids)
    return 0


def cmd_ahccd(args: argparse.Namespace) -> int:
    """Download and load CanHomT V4 homogenized daily temperature data."""
    psycopg, sql = _import_psycopg()
    out_dir = Path(args.out)
    session = _session()

    if args.no_download:
        csv_dir = out_dir / "CanHomT_dlyV4"
        if not csv_dir.is_dir():
            print(f"No cached data in {csv_dir}; omit --no-download to fetch it.",
                  file=sys.stderr)
            return 1
    else:
        csv_dir = download_canhomt(out_dir, session, overwrite=args.overwrite)

    with psycopg.connect(_conninfo(args)) as conn:
        ensure_schema(conn, sql, args.schema)
        load_canhomt(conn, sql, args.schema, csv_dir)
    return 0


def cmd_canhomp(args: argparse.Namespace) -> int:
    """Download and load CanHomP V2 homogenized precipitation (daily/monthly)."""
    psycopg, sql = _import_psycopg()
    out_dir = Path(args.out)
    kinds = ["daily", "monthly"] if args.kind == "both" else [args.kind]
    session = _session()

    dirs: dict[str, Path] = {}
    for kind in kinds:
        if args.no_download:
            txt_dir = out_dir / CANHOMP_SUBDIRS[kind]
            if not txt_dir.is_dir():
                print(f"No cached data in {txt_dir}; omit --no-download to fetch it.",
                      file=sys.stderr)
                return 1
        else:
            txt_dir = download_canhomp(kind, out_dir, session, overwrite=args.overwrite)
        dirs[kind] = txt_dir

    with psycopg.connect(_conninfo(args)) as conn:
        ensure_schema(conn, sql, args.schema)
        for kind in kinds:
            load_canhomp(conn, sql, args.schema, dirs[kind], kind,
                         add_missing_stations=not args.skip_new_stations)
    return 0


def cmd_populate(args: argparse.Namespace) -> int:
    """One-shot: download ECCC daily data, then load everything into the DB."""
    psycopg, sql = _import_psycopg()
    print("Fetching station inventory...")
    all_stations = fetch_stations()
    stations = filter_by_provinces(all_stations, args.province) if args.province else all_stations
    data_dir = Path(args.data_dir)

    if not args.no_download:
        download_eccc(stations, data_dir, args.workers, args.overwrite)

    with psycopg.connect(_conninfo(args)) as conn:
        ensure_schema(conn, sql, args.schema, drop=args.drop)
        upsert_stations(conn, sql, args.schema, stations)
        valid_ids = {int(s.station_id) for s in stations if s.station_id}
        if data_dir.is_dir():
            load_eccc_csvs(conn, sql, args.schema, data_dir, valid_ids)

        if args.ahccd:
            session = _session()
            csv_dir = download_canhomt(Path(args.ahccd_dir), session,
                                       overwrite=args.overwrite)
            load_canhomt(conn, sql, args.schema, csv_dir)

        if args.canhomp:
            session = _session()
            for kind in ("daily", "monthly"):
                txt_dir = download_canhomp(kind, Path(args.canhomp_dir), session,
                                           overwrite=args.overwrite)
                load_canhomp(conn, sql, args.schema, txt_dir, kind)
    print("\nPopulate complete.")
    return 0


# ---------------------------------------------------------------------------
# NWT Road Closures loader
# ---------------------------------------------------------------------------

_MONTH_ABBR = {
    "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
    "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
}


def _parse_season_years(year_str: str) -> tuple[int, int] | None:
    """Parse a season year like '2024/25' into (2024, 2025).

    The lower year is used for the open date, the higher year for the close.
    Returns None if the string is not parseable.
    """
    year_parts = year_str.strip().split("/")
    if len(year_parts) != 2:
        return None
    try:
        first_year = int(year_parts[0])
    except ValueError:
        return None
    return first_year, first_year + 1


def _parse_road_md(date_str: str) -> tuple[int, int] | None:
    """Parse a date like '14-Dec' into (month, day).

    Returns None if the value is empty, N/A or not parseable.
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

    month = _MONTH_ABBR.get(parts[1].strip().capitalize())
    if month is None:
        return None

    return month, day


def cmd_roadload(args: argparse.Namespace) -> int:
    """Load NWT road closure data from CSV into road_closures table."""
    psycopg, sql = _import_psycopg()

    csv_path = Path(args.csv)
    if not csv_path.is_file():
        print(f"CSV file not found: {csv_path}", file=sys.stderr)
        return 1

    schema = args.schema

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
    year_data: dict[str, dict[str, dict[str, str]]] = {}  # year -> road_name -> {open, close, type}
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
    with psycopg.connect(_conninfo(args)) as conn:
        with conn.cursor() as cur:
            cur.execute(sql.SQL("CREATE SCHEMA IF NOT EXISTS {}").format(
                sql.Identifier(schema)))
            if args.drop:
                print("Dropping existing road_closures table...")
                cur.execute(sql.SQL(
                    "DROP TABLE IF EXISTS {}.road_closures CASCADE"
                ).format(sql.Identifier(schema)))
            cur.execute(DDL.format(s=schema))
            _migrate_road_closures(cur, sql, schema)

            # Ensure dataset entries exist
            now = int(time.time())
            for ds_id, (ds_name, ds_link) in DATASETS.items():
                cur.execute(sql.SQL("""
                    INSERT INTO {s}.datasets (id, name, timecreated, timeupdated, resourcelink)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """).format(s=sql.Identifier(schema)),
                    (ds_id, ds_name, now, now, ds_link))
        conn.commit()

        # Upsert road closure records
        upsert_sql = sql.SQL("""
            INSERT INTO {s}.road_closures
                (dataset_id, year, road_name, road_type, status, month, day)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (dataset_id, year, road_name, status) DO UPDATE SET
                road_type  = EXCLUDED.road_type,
                month      = EXCLUDED.month,
                day        = EXCLUDED.day
        """).format(s=sql.Identifier(schema))

        total_rows = 0
        skipped = 0
        with conn.cursor() as cur:
            for year_str in sorted(year_data.keys()):
                years = _parse_season_years(year_str)
                if years is None:
                    skipped += 1
                    continue
                first_year, second_year = years

                roads = year_data[year_str]
                for road_name, info in roads.items():
                    # Lower year goes with the open date, higher year with close
                    open_md = _parse_road_md(info["open"])
                    close_md = _parse_road_md(info["close"])

                    # Skip roads where both dates are N/A
                    if open_md is None and close_md is None:
                        skipped += 1
                        continue

                    if open_md is not None:
                        cur.execute(upsert_sql, (
                            DATASET_NWT_ROAD_CLOSURES,
                            first_year,
                            road_name,
                            info["type"],
                            "Open",
                            open_md[0],
                            open_md[1],
                        ))
                        total_rows += 1

                    if close_md is not None:
                        cur.execute(upsert_sql, (
                            DATASET_NWT_ROAD_CLOSURES,
                            second_year,
                            road_name,
                            info["type"],
                            "Closed",
                            close_md[0],
                            close_md[1],
                        ))
                        total_rows += 1
        conn.commit()

    print(f"\nDone. Upserted {total_rows} road closure records "
          f"({skipped} skipped due to N/A).")
    return 0


# Non-road header cells in the GNWT XLSX sheets.
_XLSX_SKIP_HEADERS = {
    "Open Operation Year",
    "Leap year as red",
    "Close Year - Leap year as red",
}


def _norm_header(value) -> str | None:
    if not isinstance(value, str):
        return None
    return unicodedata.normalize("NFC", value.strip())


def _xlsx_cell_md(value) -> tuple[int, int] | None:
    """Extract (month, day) from an XLSX cell holding a date, else None."""
    import datetime as _dt

    if isinstance(value, (_dt.datetime, _dt.date)):
        return value.month, value.day
    return None


def cmd_roadload_xlsx(args: argparse.Namespace) -> int:
    """Load GNWT road open/close dates from XLSX workbooks into road_closures.

    Each workbook has an "Open" sheet (column A is the season, e.g.
    "1983/1984") and a "Close" sheet (column A is the closing calendar year).
    Open records are stored under the season's first year and Closed records
    under the second year, matching the CSV importer's convention. Rows are
    tagged with DATASET_GNWT_ROAD_XLSX so they coexist with the older CSV
    dataset.
    """
    psycopg, sql = _import_psycopg()
    try:
        import openpyxl
    except ImportError:
        sys.exit("openpyxl is required. Install it with: pip install openpyxl")

    lookup = {_norm_header(k): v for k, v in XLSX_ROAD_COLUMNS.items()}
    skip = {_norm_header(h) for h in _XLSX_SKIP_HEADERS}

    # (year, road_name, road_type, status, month, day)
    records: list[tuple[int, str, str, str, int, int]] = []
    skipped = 0

    for path_str in args.xlsx:
        path = Path(path_str)
        if not path.is_file():
            print(f"XLSX file not found: {path}", file=sys.stderr)
            return 1

        print(f"Reading {path.name}")
        wb = openpyxl.load_workbook(path, data_only=True)

        for sheet_name, status in (("Open", "Open"), ("Close", "Closed")):
            if sheet_name not in wb.sheetnames:
                print(f"  No '{sheet_name}' sheet found, skipping.",
                      file=sys.stderr)
                continue
            ws = wb[sheet_name]
            rows = ws.iter_rows(values_only=True)
            headers = next(rows, None) or ()

            road_cols: list[tuple[int, str, str]] = []  # (idx, name, type)
            for idx, hdr in enumerate(headers):
                key = _norm_header(hdr)
                if key is None or key in skip:
                    continue
                if key in lookup:
                    road_name, road_type = lookup[key]
                    road_cols.append((idx, road_name, road_type))
                else:
                    print(f"  Warning: unrecognized column {hdr!r} ignored.",
                          file=sys.stderr)

            count = 0
            for row in rows:
                if not row or row[0] is None:
                    continue
                if status == "Open":
                    season = _parse_season_years(str(row[0]).strip())
                    if season is None:
                        continue
                    year = season[0]
                else:
                    try:
                        year = int(row[0])
                    except (TypeError, ValueError):
                        continue

                for idx, road_name, road_type in road_cols:
                    md = _xlsx_cell_md(row[idx]) if idx < len(row) else None
                    if md is None:
                        skipped += 1
                        continue
                    records.append(
                        (year, road_name, road_type, status, md[0], md[1]))
                    count += 1
            print(f"  {sheet_name}: {count} {status} records "
                  f"across {len(road_cols)} roads.")

    if not records:
        print("Error: no records parsed from the given XLSX files.",
              file=sys.stderr)
        return 1

    schema = args.schema
    with psycopg.connect(_conninfo(args)) as conn:
        with conn.cursor() as cur:
            cur.execute(sql.SQL("CREATE SCHEMA IF NOT EXISTS {}").format(
                sql.Identifier(schema)))
            cur.execute(DDL.format(s=schema))
            _migrate_road_closures(cur, sql, schema)

            now = int(time.time())
            for ds_id, (ds_name, ds_link) in DATASETS.items():
                cur.execute(sql.SQL("""
                    INSERT INTO {s}.datasets (id, name, timecreated, timeupdated, resourcelink)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """).format(s=sql.Identifier(schema)),
                    (ds_id, ds_name, now, now, ds_link))

            if args.replace:
                print("Deleting existing GNWT XLSX road records...")
                cur.execute(sql.SQL(
                    "DELETE FROM {s}.road_closures WHERE dataset_id = %s"
                ).format(s=sql.Identifier(schema)),
                    (DATASET_GNWT_ROAD_XLSX,))
        conn.commit()

        upsert_sql = sql.SQL("""
            INSERT INTO {s}.road_closures
                (dataset_id, year, road_name, road_type, status, month, day)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (dataset_id, year, road_name, status) DO UPDATE SET
                road_type  = EXCLUDED.road_type,
                month      = EXCLUDED.month,
                day        = EXCLUDED.day
        """).format(s=sql.Identifier(schema))

        with conn.cursor() as cur:
            for year, road_name, road_type, status, month, day in records:
                cur.execute(upsert_sql, (
                    DATASET_GNWT_ROAD_XLSX, year, road_name, road_type,
                    status, month, day,
                ))
        conn.commit()

    print(f"\nDone. Upserted {len(records)} road records from XLSX "
          f"({skipped} empty/N-A cells skipped).")
    return 0


# ---------------------------------------------------------------------------
# argparse
# ---------------------------------------------------------------------------

def _add_db_args(p: argparse.ArgumentParser) -> None:
    p.add_argument("--host", default=os.environ.get("PGHOST", "localhost"))
    p.add_argument("--port", default=os.environ.get("PGPORT", "5432"))
    p.add_argument("--dbname", default=os.environ.get("PGDATABASE", "postgres"))
    p.add_argument("--user", default=os.environ.get("PGUSER", "postgres"))
    p.add_argument("--password", default=os.environ.get("PGPASSWORD", ""))
    p.add_argument("--schema", default="public")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Download ECCC / AHCCD climate data and load it into PostgreSQL.")
    sub = p.add_subparsers(dest="command", required=True)

    p_list = sub.add_parser("list", help="List stations in the given province(s).")
    p_list.add_argument("--province", "-p", nargs="+", required=True,
                        help="Province codes (e.g. NT YT NU) or full names.")
    p_list.set_defaults(func=cmd_list)

    p_cov = sub.add_parser("coverage", help="Show daily/hourly/monthly year ranges.")
    p_cov.add_argument("--province", "-p", nargs="+", required=True)
    p_cov.set_defaults(func=cmd_coverage)

    p_dl = sub.add_parser("download", help="Download ECCC daily data as CSV.")
    p_dl.add_argument("--province", "-p", nargs="+")
    p_dl.add_argument("--station-id", nargs="+", help="Specific station ID(s).")
    p_dl.add_argument("--out", "-o", default="./data", help="Output dir (default: ./data).")
    p_dl.add_argument("--workers", "-w", type=int, default=4)
    p_dl.add_argument("--overwrite", action="store_true")
    p_dl.set_defaults(func=cmd_download)

    p_db = sub.add_parser("dbload",
                          help="Create tables and load station metadata + ECCC daily CSVs.")
    p_db.add_argument("--data-dir", "-d", default="./data")
    p_db.add_argument("--province", "-p", nargs="+",
                      help="Restrict stations to these provinces (default: all).")
    p_db.add_argument("--drop", action="store_true", help="Drop tables before creating.")
    p_db.add_argument("--skip-data", action="store_true",
                      help="Only load station metadata, skip daily CSVs.")
    _add_db_args(p_db)
    p_db.set_defaults(func=cmd_dbload)

    p_ah = sub.add_parser("ahccd",
                          help="Download and load CanHomT V4 daily temperature.")
    p_ah.add_argument("--out", "-o", default="./ahccd", help="Download/cache dir.")
    p_ah.add_argument("--no-download", action="store_true",
                      help="Use already-downloaded files in --out instead of fetching.")
    p_ah.add_argument("--overwrite", action="store_true",
                      help="Re-download even if cached files already exist.")
    _add_db_args(p_ah)
    p_ah.set_defaults(func=cmd_ahccd)

    p_cp = sub.add_parser(
        "canhomp",
        help="Download and load CanHomP V2 homogenized daily/monthly precipitation.")
    p_cp.add_argument("--kind", choices=("daily", "monthly", "both"), default="both",
                      help="Which CanHomP V2 archive(s) to import (default: both).")
    p_cp.add_argument("--out", "-o", default="./canhomp", help="Download/cache dir.")
    p_cp.add_argument("--no-download", action="store_true",
                      help="Use already-extracted files in --out instead of fetching.")
    p_cp.add_argument("--overwrite", action="store_true",
                      help="Re-download even if cached files already exist.")
    p_cp.add_argument("--skip-new-stations", action="store_true",
                      help="Do not add stations missing from weather_stations.")
    _add_db_args(p_cp)
    p_cp.set_defaults(func=cmd_canhomp)

    p_pop = sub.add_parser("populate",
                           help="One-shot: download ECCC data and load everything.")
    p_pop.add_argument("--province", "-p", nargs="+",
                       help="Restrict to these provinces (default: all).")
    p_pop.add_argument("--data-dir", "-d", default="./data")
    p_pop.add_argument("--workers", "-w", type=int, default=4)
    p_pop.add_argument("--overwrite", action="store_true")
    p_pop.add_argument("--no-download", action="store_true",
                       help="Skip downloading; load existing CSVs in --data-dir.")
    p_pop.add_argument("--drop", action="store_true", help="Drop tables before creating.")
    p_pop.add_argument("--ahccd", action="store_true",
                       help="Also download and load CanHomT V4 daily temperature.")
    p_pop.add_argument("--ahccd-dir", default="./ahccd", help="AHCCD download/cache dir.")
    p_pop.add_argument("--canhomp", action="store_true",
                       help="Also download and load CanHomP V2 daily+monthly precipitation.")
    p_pop.add_argument("--canhomp-dir", default="./canhomp",
                       help="CanHomP download/cache dir.")
    _add_db_args(p_pop)
    p_pop.set_defaults(func=cmd_populate)

    # Road closures load
    p_road = sub.add_parser(
        "roadload",
        help="Load NWT road closure data from CSV into road_closures table.",
    )
    p_road.add_argument("--csv", default="./NWT_Roads_Combined_Full.csv",
                        help="Path to NWT_Roads_Combined_Full.csv "
                             "(default: ./NWT_Roads_Combined_Full.csv).")
    p_road.add_argument("--drop", action="store_true",
                        help="Drop road_closures table before creating it.")
    _add_db_args(p_road)
    p_road.set_defaults(func=cmd_roadload)

    # GNWT XLSX road open/close load
    p_roadx = sub.add_parser(
        "roadload-xlsx",
        help="Load GNWT road open/close dates from XLSX workbooks "
             "(dataset 9, coexists with the CSV dataset).",
    )
    p_roadx.add_argument(
        "--xlsx", nargs="+",
        default=["./GNWT Winter Road Open Closed_until 2025-26.xlsx",
                 "./GNWT River Crossing TCWR Open Close_until 2025-26.xlsx"],
        help="Path(s) to the GNWT Open/Close XLSX workbooks.")
    p_roadx.add_argument("--replace", action="store_true",
                         help="Delete existing GNWT XLSX dataset rows first.")
    _add_db_args(p_roadx)
    p_roadx.set_defaults(func=cmd_roadload_xlsx)

    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
