from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import pandas as pd

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

@app.get("/fdd")
async def FDD(fromyear: int, toyear: int, stationid: int):
    cur = conn.cursor()

    cur.execute(
        """
        WITH alldata AS (
            SELECT id, station_id, obs_date, "year", "month", "day",
                   data_quality, max_temp_c, max_temp_flag, min_temp_c,
                   min_temp_flag, mean_temp_c, mean_temp_flag,
                   heat_deg_days_c, heat_deg_days_flag,
                   cool_deg_days_c, cool_deg_days_flag,
                   total_rain_mm, total_rain_flag,
                   total_snow_cm, total_snow_flag,
                   total_precip_mm, total_precip_flag,
                   snow_on_grnd_cm, snow_on_grnd_flag,
                   dir_of_max_gust_10s_deg, dir_of_max_gust_flag,
                   spd_of_max_gust_kmh, spd_of_max_gust_flag
            FROM public.daily_data
            WHERE "year" >= %s AND "year" <= %s AND station_id = %s
        ),

        missingdays AS (
            SELECT dd.*
            FROM public.daily_data dd
            WHERE dd.station_id = %s AND dd.mean_temp_c IS NULL
        ),

        missing3consecutivedays AS (
            SELECT m1."year", m1."month"
            FROM missingdays m1
            JOIN missingdays m2
                ON m1."year" = m2."year"
                AND m1."month" = m2."month"
                AND m1."day" = m2."day" + 1
            JOIN missingdays m3
                ON m2."year" = m3."year"
                AND m2."month" = m3."month"
                AND m2."day" = m3."day" + 1
            WHERE m1.station_id = %s
                AND m1.mean_temp_c IS NULL
                AND m2.mean_temp_c IS NULL
                AND m3.mean_temp_c IS NULL
            GROUP BY m1."year", m1."month"
        ),

        missing5days AS (
            SELECT md."year", md."month"
            FROM missingdays md
            WHERE md.station_id = %s AND md.mean_temp_c IS NULL
            GROUP BY md."year", md."month"
            HAVING count(id) >= 5
        ),

        validdays AS (
            SELECT ad.*,
                   CASE WHEN ad.mean_temp_c > 0 THEN 0
                        ELSE ad.mean_temp_c
                   END AS adjusted_mean_temp_c
            FROM alldata ad
            WHERE (ad."year", ad."month") NOT IN (
                    SELECT m3cd."year", m3cd."month"
                    FROM missing3consecutivedays m3cd
                  )
              AND (ad."year", ad."month") NOT IN (
                    SELECT m5d."year", m5d."month"
                    FROM missing5days m5d
                  )
        ),

        fdd AS (
            SELECT vd."year", vd."month",
                   SUM(vd.adjusted_mean_temp_c) AS total_adjusted_mean_temp
            FROM validdays vd
            WHERE true
            GROUP BY vd."year", vd."month"
        ),

        fdd_include_missing_months AS (
            SELECT DISTINCT ad."year", ad."month", fdd.total_adjusted_mean_temp
            FROM alldata ad
            JOIN fdd ON ad."month" = fdd."month" AND ad."year" = fdd."year"
        )

        SELECT * FROM fdd_include_missing_months;
        """,
        (fromyear, toyear, stationid, stationid, stationid, stationid)
    )

    rows = cur.fetchall()
    cur.close()
    
    return {"data": rows}   


