from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import pandas as pd
import numpy as np
from statsmodels.nonparametric.smoothers_lowess import lowess

import os

conn=None

if len(os.getenv('POSTGRES_DB')) == 0:

    # Connect to your postgres DB
    conn = psycopg2.connect(
        dbname="wramp", 
        user="postgres", 
        password="password", 
        host=os.environ.get("DB_HOST", "localhost"), 
        port="5432"
    )

else:
    # Connect to your postgres DB using environment variables
    conn = psycopg2.connect(
        dbname=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        host="db",
        port=os.getenv('DB_PORT', '5432')
    )

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")

async def root():
    # Open a cursor to perform database operations
    cur = conn.cursor()

    # Execute a command
    cur.execute("SELECT * FROM public.weather_stations;")

    return {"data": cur.fetchall()}
    
@app.get("/stations")

async def stations():
    cur = conn.cursor()

    # Execute a command
    cur.execute("SELECT * FROM public.weather_stations;")

    return {"data": cur.fetchall()}

@app.get("/datasets")
async def datasets():
    cur = conn.cursor()
    cur.execute("SELECT id, name, resourcelink FROM public.datasets ORDER BY id;")
    rows = cur.fetchall()
    cur.close()
    return {"data": rows}

@app.get("/station-datasets")
async def station_datasets(stationid: int):
    cur = conn.cursor()
    cur.execute("""
        SELECT DISTINCT d.id, d.name
        FROM public.daily_data dd
        JOIN public.datasets d ON d.id = dd.dataset_id
        WHERE dd.station_id = %s
        ORDER BY d.id;
    """, (stationid,))
    rows = cur.fetchall()
    cur.close()
    return {"data": rows}

@app.get("/city-stations")
async def city_stations(name: str):
    """Return all stations whose name matches a city (case-insensitive prefix)."""
    cur = conn.cursor()
    cur.execute("""
        SELECT DISTINCT ws.station_id, ws.name
        FROM public.weather_stations ws
        JOIN public.daily_data dd ON dd.station_id = ws.station_id
        WHERE UPPER(ws.name) LIKE UPPER(%s) || '%%'
        ORDER BY ws.name, ws.station_id;
    """, (name,))
    rows = cur.fetchall()
    cur.close()
    return {"data": rows}

@app.get("/fdd")
async def FDD(fromyear: int, toyear: int, stationid: int, dataset_id: int = None):
    cur = conn.cursor()

    dataset_filter = ""
    params_alldata = [fromyear - 1, toyear, stationid]
    if dataset_id is not None:
        dataset_filter = "AND dataset_id = %s"
        params_alldata.append(dataset_id)

    cur.execute(
        f"""
        WITH alldata AS (
            SELECT id, station_id, obs_date, "year", "month", "day",
                   mean_temp_c,
                   -- September-May "winter year": Sept+ belongs to next year
                   CASE WHEN "month" >= 9 THEN "year" + 1
                        ELSE "year"
                   END AS fdd_year
            FROM public.daily_data
            WHERE "year" >= %s AND "year" <= %s AND station_id = %s
            {dataset_filter}
        ),

        -- Only keep months Sept-May (exclude Jun/Jul/Aug)
        filtered AS (
            SELECT * FROM alldata
            WHERE "month" NOT IN (6, 7, 8)
        ),

        -- Find months with missing data (within our date range)
        missingdays AS (
            SELECT * FROM filtered
            WHERE mean_temp_c IS NULL
        ),

        -- Months with 3 consecutive missing days
        missing3consecutivedays AS (
            SELECT DISTINCT m1.fdd_year, m1."year", m1."month"
            FROM missingdays m1
            JOIN missingdays m2
                ON m1."year" = m2."year"
                AND m1."month" = m2."month"
                AND m1."day" = m2."day" + 1
            JOIN missingdays m3
                ON m2."year" = m3."year"
                AND m2."month" = m3."month"
                AND m2."day" = m3."day" + 1
        ),

        -- Months with 5+ missing days
        missing5days AS (
            SELECT fdd_year, "year", "month"
            FROM missingdays
            GROUP BY fdd_year, "year", "month"
            HAVING count(*) >= 5
        ),

        -- Combine all violating months and get their fdd_years
        violating_years AS (
            SELECT DISTINCT fdd_year FROM missing3consecutivedays
            UNION
            SELECT DISTINCT fdd_year FROM missing5days
        ),

        -- Exclude entire fdd_years that have any violation
        validdays AS (
            SELECT f.*,
                   CASE WHEN f.mean_temp_c > 0 THEN 0
                        ELSE f.mean_temp_c
                   END AS adjusted_mean_temp_c
            FROM filtered f
            WHERE f.fdd_year NOT IN (SELECT fdd_year FROM violating_years)
              AND f.mean_temp_c IS NOT NULL
        ),

        -- Check that each fdd_year has all 9 months (Sep-May)
        year_month_counts AS (
            SELECT fdd_year, COUNT(DISTINCT "month") AS month_count
            FROM validdays
            GROUP BY fdd_year
        ),

        complete_years AS (
            SELECT fdd_year FROM year_month_counts
            WHERE month_count = 9
        ),

        -- Sum FDD per fdd_year
        fdd AS (
            SELECT vd.fdd_year,
                   SUM(ABS(vd.adjusted_mean_temp_c)) AS total_fdd
            FROM validdays vd
            WHERE vd.fdd_year IN (SELECT fdd_year FROM complete_years)
              AND vd.fdd_year >= %s AND vd.fdd_year <= %s
            GROUP BY vd.fdd_year
        )

        SELECT fdd_year, total_fdd FROM fdd ORDER BY fdd_year;
        """,
        (*params_alldata, fromyear, toyear)
    )

    rows = cur.fetchall()
    cur.close()
    
    return {"data": rows}   


@app.get("/lowess")
async def lowess_curve(fromyear: int, toyear: int, stationid: int, dataset_id: int = None, frac: float = 0.3):
    """Return a LOWESS smoothed curve for FDD data."""
    cur = conn.cursor()

    dataset_filter = ""
    params_alldata = [fromyear - 1, toyear, stationid]
    if dataset_id is not None:
        dataset_filter = "AND dataset_id = %s"
        params_alldata.append(dataset_id)

    cur.execute(
        f"""
        WITH alldata AS (
            SELECT id, station_id, obs_date, "year", "month", "day",
                   mean_temp_c,
                   CASE WHEN "month" >= 9 THEN "year" + 1
                        ELSE "year"
                   END AS fdd_year
            FROM public.daily_data
            WHERE "year" >= %s AND "year" <= %s AND station_id = %s
            {dataset_filter}
        ),
        filtered AS (
            SELECT * FROM alldata
            WHERE "month" NOT IN (6, 7, 8)
        ),
        missingdays AS (
            SELECT * FROM filtered
            WHERE mean_temp_c IS NULL
        ),
        missing3consecutivedays AS (
            SELECT DISTINCT m1.fdd_year, m1."year", m1."month"
            FROM missingdays m1
            JOIN missingdays m2
                ON m1."year" = m2."year"
                AND m1."month" = m2."month"
                AND m1."day" = m2."day" + 1
            JOIN missingdays m3
                ON m2."year" = m3."year"
                AND m2."month" = m3."month"
                AND m2."day" = m3."day" + 1
        ),
        missing5days AS (
            SELECT fdd_year, "year", "month"
            FROM missingdays
            GROUP BY fdd_year, "year", "month"
            HAVING count(*) >= 5
        ),
        violating_years AS (
            SELECT DISTINCT fdd_year FROM missing3consecutivedays
            UNION
            SELECT DISTINCT fdd_year FROM missing5days
        ),
        validdays AS (
            SELECT f.*,
                   CASE WHEN f.mean_temp_c > 0 THEN 0
                        ELSE f.mean_temp_c
                   END AS adjusted_mean_temp_c
            FROM filtered f
            WHERE f.fdd_year NOT IN (SELECT fdd_year FROM violating_years)
              AND f.mean_temp_c IS NOT NULL
        ),
        year_month_counts AS (
            SELECT fdd_year, COUNT(DISTINCT "month") AS month_count
            FROM validdays
            GROUP BY fdd_year
        ),
        complete_years AS (
            SELECT fdd_year FROM year_month_counts
            WHERE month_count = 9
        ),
        fdd AS (
            SELECT vd.fdd_year,
                   SUM(ABS(vd.adjusted_mean_temp_c)) AS total_fdd
            FROM validdays vd
            WHERE vd.fdd_year IN (SELECT fdd_year FROM complete_years)
              AND vd.fdd_year >= %s AND vd.fdd_year <= %s
            GROUP BY vd.fdd_year
        )
        SELECT fdd_year, total_fdd FROM fdd ORDER BY fdd_year;
        """,
        (*params_alldata, fromyear, toyear)
    )

    rows = cur.fetchall()
    cur.close()

    if len(rows) < 3:
        return {"data": []}

    years = np.array([r[0] for r in rows], dtype=float)
    fdds = np.array([float(r[1]) for r in rows], dtype=float)

    # Clamp frac to valid range
    frac_clamped = max(2.0 / len(years), min(frac, 1.0))

    smoothed = lowess(fdds, years, frac=frac_clamped, return_sorted=True)

    result = [[int(row[0]), round(float(row[1]), 2)] for row in smoothed]
    return {"data": result}

