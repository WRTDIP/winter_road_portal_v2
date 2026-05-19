#!/usr/bin/env python3
"""
Load AHCCD CSV files (Year, Mo, Day01..Day31 format) into PostgreSQL daily_data table.

This script handles the specific CSV format produced by dm_to_csv.py from AHCCD
data files. Each CSV has columns: Year, Mo, Day01, Day02, ..., Day31.

Usage:
    # Load mean temperature data from ahccd/upload/
    python csv_to_db.py --data-dir ./ahccd/upload --column mean_temp_c --dataset-id 2

    # Load max temperature data
    python csv_to_db.py --data-dir ./ahccd/max_temp --column max_temp_c --dataset-id 3

    # Load precipitation data
    python csv_to_db.py --data-dir ./ahccd/total_precip --column total_precip_mm --dataset-id 7
"""

import argparse
import calendar
import csv
import os
import re
import time
from pathlib import Path

import psycopg
from psycopg import sql
from tqdm import tqdm

# Dataset IDs (matching climate_importer.py)
DATASET_ECCC_DAILY = 1
DATASET_AHCCD_MEAN_TEMP = 2
DATASET_AHCCD_MAX_TEMP = 3
DATASET_AHCCD_MIN_TEMP = 4
DATASET_AHCCD_RAINFALL = 5
DATASET_AHCCD_SNOWFALL = 6
DATASET_AHCCD_TOTAL_PRECIP = 7

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
]

DDL_DATASETS = """
CREATE TABLE IF NOT EXISTS {schema}.datasets (
    id               INTEGER PRIMARY KEY,
    name             VARCHAR,
    timecreated      INTEGER,
    timeupdated      INTEGER,
    resourcelink     VARCHAR
);
"""


def ensure_datasets(cur, schema: str):
    """Create datasets table and insert pre-defined dataset entries."""
    cur.execute(DDL_DATASETS.format(schema=schema))
    now_epoch = int(time.time())
    for ds_id, ds_name, ds_link in DATASETS:
        cur.execute(sql.SQL("""
            INSERT INTO {schema}.datasets (id, name, timecreated, timeupdated, resourcelink)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """).format(schema=sql.Identifier(schema)),
            (ds_id, ds_name, now_epoch, now_epoch, ds_link))


def build_station_lookup(cur, schema: str) -> dict[str, int]:
    """Build a lookup dict mapping normalized station names to station_ids."""
    cur.execute(sql.SQL(
        "SELECT station_id, name FROM {}.weather_stations"
    ).format(sql.Identifier(schema)))
    rows = cur.fetchall()

    lookup: dict[str, int] = {}
    for sid, sname in rows:
        norm = re.sub(r'[^A-Z0-9]', '_', sname.upper()).strip('_')
        norm = re.sub(r'_+', '_', norm)
        lookup[norm] = sid
    return lookup


def find_station_id(filename_stem: str, station_lookup: dict[str, int]) -> int | None:
    """Extract station name from AHCCD filename and find its station_id."""
    # Filename format: STATIONNAME_PROV_STARTYEAR_ENDYEAR
    m = re.match(r'^(.+?)_([A-Z]{2,3})_(\d{4})_(\d{4})$', filename_stem)
    if not m:
        return None

    station_name_norm = m.group(1)

    # Direct match
    station_id = station_lookup.get(station_name_norm)
    if station_id:
        return station_id

    # Try with province
    prov_code = m.group(2)
    with_prov = f"{station_name_norm}_{prov_code}"
    station_id = station_lookup.get(with_prov)
    if station_id:
        return station_id

    # Prefix match
    for db_name, db_id in station_lookup.items():
        if db_name.startswith(station_name_norm):
            return db_id

    return None


def load_ahccd_csv(
    csv_path: Path,
    station_id: int,
    target_column: str,
    dataset_id: int,
    cur,
    schema: str,
) -> int:
    """Load a single AHCCD CSV file into daily_data. Returns number of rows inserted."""
    file_rows = 0
    with csv_path.open("r", encoding="utf-8", newline="") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            try:
                year = int(row["Year"])
                month = int(row["Mo"])
            except (ValueError, KeyError):
                continue

            mdays = calendar.monthrange(year, month)[1]

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

    return file_rows


def main():
    parser = argparse.ArgumentParser(
        description="Load AHCCD CSV files (Year,Mo,Day01..Day31) into PostgreSQL daily_data.",
    )
    parser.add_argument("--data-dir", "-d", default="./ahccd/upload",
                        help="Directory containing AHCCD CSV files.")
    parser.add_argument("--dataset-id", type=int, default=DATASET_AHCCD_MEAN_TEMP,
                        help="Dataset ID to assign (default: 2 = AHCCD mean temp).")
    parser.add_argument("--column", "-c", default="mean_temp_c",
                        choices=["mean_temp_c", "max_temp_c", "min_temp_c",
                                 "total_rain_mm", "total_snow_cm", "total_precip_mm"],
                        help="Target column in daily_data for the values.")
    parser.add_argument("--host", default=os.environ.get("PGHOST", "localhost"))
    parser.add_argument("--port", default=os.environ.get("PGPORT", "5432"))
    parser.add_argument("--dbname", default=os.environ.get("PGDATABASE", "wramp"))
    parser.add_argument("--user", default=os.environ.get("PGUSER", "postgres"))
    parser.add_argument("--password", default=os.environ.get("PGPASSWORD", "password"))
    parser.add_argument("--schema", default="public")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    if not data_dir.is_dir():
        print(f"Error: Data directory not found: {data_dir}")
        return 1

    csv_files = sorted(data_dir.glob("*.csv"))
    if not csv_files:
        print(f"No CSV files found in {data_dir}.")
        return 0

    conninfo = (
        f"host={args.host} port={args.port} dbname={args.dbname} "
        f"user={args.user} password={args.password}"
    )

    print(f"Connecting to {args.dbname}@{args.host}:{args.port}")
    print(f"Loading {len(csv_files)} AHCCD CSV file(s) from {data_dir}")
    print(f"  Dataset ID: {args.dataset_id}")
    print(f"  Target column: {args.column}")

    with psycopg.connect(conninfo) as conn:
        with conn.cursor() as cur:
            ensure_datasets(cur, args.schema)
        conn.commit()

        with conn.cursor() as cur:
            station_lookup = build_station_lookup(cur, args.schema)

        if not station_lookup:
            print("Error: No stations found in weather_stations table. "
                  "Run 'climate_importer.py dbload' first to populate stations.")
            return 1

        print(f"  Found {len(station_lookup)} stations in database.")

        total_rows = 0
        skipped_files = 0
        pbar = tqdm(csv_files, desc="Loading AHCCD CSVs", unit="file")

        for csv_path in pbar:
            station_id = find_station_id(csv_path.stem, station_lookup)
            if station_id is None:
                tqdm.write(f"  skip (station not found): {csv_path.name}")
                skipped_files += 1
                continue

            pbar.set_postfix_str(csv_path.stem[:30], refresh=True)

            with conn.cursor() as cur:
                file_rows = load_ahccd_csv(
                    csv_path, station_id, args.column,
                    args.dataset_id, cur, args.schema,
                )
                conn.commit()
                total_rows += file_rows

            pbar.set_postfix(rows=total_rows, skipped=skipped_files)

        pbar.close()
        print(f"\nDone. Inserted/updated {total_rows:,} daily rows from "
              f"{len(csv_files) - skipped_files} file(s) ({skipped_files} skipped).")

    return 0


if __name__ == "__main__":
    exit(main())