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
        SELECT d.id, d.name, COUNT(dd.id) AS row_count
        FROM public.daily_data dd
        JOIN public.datasets d ON d.id = dd.dataset_id
        WHERE dd.station_id = %s
        GROUP BY d.id, d.name
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


@app.get("/avg-snowfall")
async def avg_snowfall(stationid: int, month_start: int, month_end: int = None, dataset_id: int = None):
    """Return avg, max, and min historical daily snowfall (cm) for each day in a month range."""
    if month_end is None:
        month_end = month_start

    cur = conn.cursor()

    dataset_filter = ""
    params = [stationid, month_start, month_end]
    if dataset_id is not None:
        dataset_filter = "AND dataset_id = %s"
        params.append(dataset_id)

    cur.execute(
        f"""
        SELECT "month", "day",
               AVG(total_snow_cm) AS avg_snow_cm,
               MAX(total_snow_cm) AS max_snow_cm,
               MIN(total_snow_cm) AS min_snow_cm
        FROM public.daily_data
        WHERE station_id = %s
          AND "month" >= %s AND "month" <= %s
          AND total_snow_cm IS NOT NULL
          {dataset_filter}
        GROUP BY "month", "day"
        ORDER BY "month", "day";
        """,
        params
    )

    rows = cur.fetchall()
    cur.close()

    result = [[int(r[0]), int(r[1]), round(float(r[2]), 2), round(float(r[3]), 2), round(float(r[4]), 2)] for r in rows]
    return {"data": result}


@app.get("/avg-temperature")
async def avg_temperature(stationid: int, month_start: int, month_end: int = None, dataset_id: int = None):
    """Return avg, max, and min historical daily temperature (°C) for each day in a month range."""
    if month_end is None:
        month_end = month_start

    cur = conn.cursor()

    dataset_filter = ""
    params = [stationid, month_start, month_end]
    if dataset_id is not None:
        dataset_filter = "AND dataset_id = %s"
        params.append(dataset_id)

    cur.execute(
        f"""
        SELECT "month", "day",
               AVG(mean_temp_c) AS avg_mean_temp,
               MAX(max_temp_c) AS max_temp,
               MIN(min_temp_c) AS min_temp
        FROM public.daily_data
        WHERE station_id = %s
          AND "month" >= %s AND "month" <= %s
          AND mean_temp_c IS NOT NULL
          {dataset_filter}
        GROUP BY "month", "day"
        ORDER BY "month", "day";
        """,
        params
    )

    rows = cur.fetchall()
    cur.close()

    result = []
    for r in rows:
        avg_val = round(float(r[2]), 2) if r[2] is not None else None
        max_val = round(float(r[3]), 2) if r[3] is not None else None
        min_val = round(float(r[4]), 2) if r[4] is not None else None
        result.append([int(r[0]), int(r[1]), avg_val, max_val, min_val])
    return {"data": result}


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

## Road Closures

# Road open/close data can exist in two datasets: 8 = legacy combined CSV,
# 9 = GNWT Open/Close XLSX workbooks (longer record, through 2025-26). When
# the caller doesn't request a specific dataset, prefer the GNWT XLSX data
# for roads that have it and fall back to whatever else exists otherwise.
DATASET_GNWT_ROAD_XLSX = 9


def _preferred_road_dataset(cur, road_name: str):
    """Dataset_id to use for a road when the caller didn't specify one.

    Returns DATASET_GNWT_ROAD_XLSX if that dataset has records for the road,
    otherwise None (no dataset filter, i.e. use whatever data exists).
    """
    cur.execute(
        "SELECT 1 FROM public.road_closures "
        "WHERE road_name = %s AND dataset_id = %s LIMIT 1;",
        (road_name, DATASET_GNWT_ROAD_XLSX),
    )
    return DATASET_GNWT_ROAD_XLSX if cur.fetchone() else None


def _resolve_road_name(cur, road_name: str):
    """Resolve a (possibly partial) road name to a canonical DB road_name.

    Tries an exact case-insensitive match first, then a contains (ILIKE)
    match. Returns the matched road_name or None.
    """
    cur.execute(
        "SELECT road_name FROM public.road_closures WHERE LOWER(road_name) = LOWER(%s) LIMIT 1;",
        (road_name,),
    )
    row = cur.fetchone()
    if row:
        return row[0]

    cur.execute(
        "SELECT road_name FROM public.road_closures WHERE road_name ILIKE %s LIMIT 1;",
        (f"%{road_name}%",),
    )
    row = cur.fetchone()
    return row[0] if row else None


@app.get("/road-closures")
async def road_closures(road_name: str = None, road_type: str = None,
                        year: int = None, status: str = None,
                        dataset_id: int = None):
    """List road closure records with optional filters."""
    cur = conn.cursor()

    filters = []
    params = []
    if road_name is not None:
        filters.append("road_name = %s")
        params.append(road_name)
    if road_type is not None:
        filters.append("road_type = %s")
        params.append(road_type)
    if year is not None:
        filters.append("year = %s")
        params.append(year)
    if status is not None:
        filters.append("status = %s")
        params.append(status)
    if dataset_id is not None:
        filters.append("dataset_id = %s")
        params.append(dataset_id)

    where = ("WHERE " + " AND ".join(filters)) if filters else ""

    cur.execute(
        f"""
        SELECT road_name, road_type, year, status, month, day
        FROM public.road_closures
        {where}
        ORDER BY road_name, year, status;
        """,
        params,
    )

    rows = cur.fetchall()
    cur.close()

    result = [
        {
            "road_name": r[0],
            "road_type": r[1],
            "year": r[2],
            "status": r[3],
            "month": r[4],
            "day": r[5],
        }
        for r in rows
    ]
    return {"data": result}


@app.get("/road-closure-forecast")
async def road_closure_forecast(road_name: str, year: int = None,
                                dataset_id: int = None):
    """Expected open and closure dates for a road in a given season.

    Averages the historical open / close month-and-day across all years and
    maps them onto the requested season (``year`` = season start year). If no
    ``year`` is given, the current/upcoming season is used.
    """
    from datetime import date

    today = date.today()
    if year is None:
        # Aug onward -> upcoming season starts this year; otherwise the active
        # season started the previous year.
        year = today.year if today.month >= 8 else today.year - 1

    cur = conn.cursor()
    resolved = _resolve_road_name(cur, road_name)
    if resolved is None:
        cur.close()
        return {
            "data": {
                "road_name": road_name,
                "matched": None,
                "season": f"{year}/{str((year + 1) % 100).zfill(2)}",
                "expected_open": None,
                "open_predicted": False,
                "expected_close": None,
                "close_predicted": False,
                "open_samples": 0,
                "close_samples": 0,
            }
        }

    if dataset_id is None:
        dataset_id = _preferred_road_dataset(cur, resolved)

    filters = ["road_name = %s", "month IS NOT NULL", "day IS NOT NULL"]
    params = [resolved]
    if dataset_id is not None:
        filters.append("dataset_id = %s")
        params.append(dataset_id)
    where = " AND ".join(filters)

    cur.execute(
        f"SELECT year, status, month, day FROM public.road_closures WHERE {where};",
        params,
    )
    rows = cur.fetchall()
    cur.close()

    def avg_md(records):
        """Average a list of (month, day) handling the Dec/Jan winter wrap."""
        ref = 2001
        ordinals = []
        for m, d in records:
            # Months in the latter half of the year anchor to the reference
            # year; earlier months belong to the following calendar year so
            # December and January average together correctly.
            y = ref if m >= 8 else ref + 1
            try:
                ordinals.append(date(y, m, d).toordinal())
            except ValueError:
                continue
        if not ordinals:
            return None
        avg = date.fromordinal(round(sum(ordinals) / len(ordinals)))
        return avg.month, avg.day

    def to_iso(md, season_start):
        if md is None:
            return None
        m, d = md
        cal_year = season_start if m >= 8 else season_start + 1
        try:
            return date(cal_year, m, d).isoformat()
        except ValueError:
            return None

    # The importer stores the Open record under the season's first (lower)
    # year and the Closed record under the second (higher) year.
    actual_open = next(
        ((m, d) for y, s, m, d in rows if s == "Open" and y == year), None
    )
    actual_close = next(
        ((m, d) for y, s, m, d in rows if s == "Closed" and y == year + 1), None
    )

    opens = [(m, d) for y, s, m, d in rows if s == "Open"]
    closes = [(m, d) for y, s, m, d in rows if s == "Closed"]

    # Use the actual recorded date when present; otherwise predict from the
    # historical average of all seasons.
    if actual_open is not None:
        open_iso = to_iso(actual_open, year)
        open_predicted = False
    else:
        open_iso = to_iso(avg_md(opens), year)
        open_predicted = True

    if actual_close is not None:
        close_iso = to_iso(actual_close, year)
        close_predicted = False
    else:
        close_iso = to_iso(avg_md(closes), year)
        close_predicted = True

    return {
        "data": {
            "road_name": road_name,
            "matched": resolved,
            "season": f"{year}/{str((year + 1) % 100).zfill(2)}",
            "expected_open": open_iso,
            "open_predicted": open_predicted,
            "expected_close": close_iso,
            "close_predicted": close_predicted,
            "open_samples": len(opens),
            "close_samples": len(closes),
            "dataset_id": dataset_id,
        }
    }


@app.get("/road-closure-trend")
async def road_closure_trend(road_name: str, dataset_id: int = None,
                             frac: float = 0.5):
    """Scatter + LOWESS trend of open / close dates for a road over the years.

    The y value is the "day of season" — the number of days since Aug 1 of the
    season's starting year. This keeps the Dec→May winter period continuous and
    monotonic so opening (early season) plots below closing (late season).
    Both series share the season's starting year on the x axis.
    """
    from datetime import date

    cur = conn.cursor()
    resolved = _resolve_road_name(cur, road_name)
    if resolved is None:
        cur.close()
        return {
            "data": {
                "road_name": road_name,
                "matched": None,
                "years": [],
                "open_scatter": [],
                "close_scatter": [],
                "open_lowess": [],
                "close_lowess": [],
            }
        }

    if dataset_id is None:
        dataset_id = _preferred_road_dataset(cur, resolved)

    filters = ["road_name = %s", "month IS NOT NULL", "day IS NOT NULL"]
    params = [resolved]
    if dataset_id is not None:
        filters.append("dataset_id = %s")
        params.append(dataset_id)
    where = " AND ".join(filters)

    cur.execute(
        f"SELECT year, status, month, day FROM public.road_closures WHERE {where};",
        params,
    )
    rows = cur.fetchall()
    cur.close()

    def day_of_season(season_start, m, d):
        # Aug-Dec fall in the season's starting year; Jan-Jul in the next.
        date_year = season_start if m >= 8 else season_start + 1
        try:
            return date(date_year, m, d).toordinal() - date(season_start, 8, 1).toordinal()
        except ValueError:
            return None

    # Open rows are stored under the season's starting year; Closed rows under
    # the following year (so the season start is year - 1).
    open_pts = {}
    close_pts = {}
    for y, s, m, d in rows:
        if s == "Open":
            dos = day_of_season(y, m, d)
            if dos is not None:
                open_pts[y] = dos
        elif s == "Closed":
            season_start = y - 1
            dos = day_of_season(season_start, m, d)
            if dos is not None:
                close_pts[season_start] = dos

    def lowess_map(points):
        """Return {season_year: smoothed_dos} for a {season_year: dos} dict."""
        if len(points) < 3:
            return {}
        xs = np.array(sorted(points.keys()), dtype=float)
        ys = np.array([points[int(x)] for x in xs], dtype=float)
        frac_clamped = max(2.0 / len(xs), min(frac, 1.0))
        smoothed = lowess(ys, xs, frac=frac_clamped, return_sorted=True)
        return {int(round(r[0])): round(float(r[1]), 2) for r in smoothed}

    open_low = lowess_map(open_pts)
    close_low = lowess_map(close_pts)

    years = sorted(set(open_pts) | set(close_pts))

    return {
        "data": {
            "road_name": road_name,
            "matched": resolved,
            "years": years,
            "open_scatter": [{"x": y, "y": open_pts[y]} for y in sorted(open_pts)],
            "close_scatter": [{"x": y, "y": close_pts[y]} for y in sorted(close_pts)],
            "open_lowess": [open_low.get(y) for y in years],
            "close_lowess": [close_low.get(y) for y in years],
            "dataset_id": dataset_id,
        }
    }


@app.get("/road-closure-duration-range")
async def road_closure_duration_range(dataset_id: int = None):
    """Global min / max / average open duration (days) across all roads.

    For every road and every season that has both an opening and a closing
    record, the duration is the number of days between them. The min and max of
    all these durations are returned so a single road's stats can be placed on a
    shared scale.
    """
    from datetime import date

    cur = conn.cursor()
    filters = ["month IS NOT NULL", "day IS NOT NULL"]
    params = []
    if dataset_id is not None:
        filters.append("dataset_id = %s")
        params.append(dataset_id)
    where = " AND ".join(filters)

    cur.execute(
        f"SELECT road_name, year, status, month, day, dataset_id "
        f"FROM public.road_closures WHERE {where};",
        params,
    )
    rows = cur.fetchall()
    cur.close()

    # Without an explicit dataset filter, use only the preferred (GNWT XLSX)
    # dataset for roads that have it so the same season isn't counted twice;
    # roads without XLSX data keep their legacy rows.
    if dataset_id is None:
        xlsx_roads = {r[0] for r in rows if r[5] == DATASET_GNWT_ROAD_XLSX}
        rows = [r for r in rows
                if r[0] not in xlsx_roads or r[5] == DATASET_GNWT_ROAD_XLSX]

    def day_of_season(season_start, m, d):
        date_year = season_start if m >= 8 else season_start + 1
        try:
            return date(date_year, m, d).toordinal() - date(season_start, 8, 1).toordinal()
        except ValueError:
            return None

    # Build {road_name: {season_start: {"open": dos, "close": dos}}}.
    seasons = {}
    for road_name, y, s, m, d, _ds in rows:
        if s == "Open":
            dos = day_of_season(y, m, d)
            if dos is not None:
                seasons.setdefault(road_name, {}).setdefault(y, {})["open"] = dos
        elif s == "Closed":
            season_start = y - 1
            dos = day_of_season(season_start, m, d)
            if dos is not None:
                seasons.setdefault(road_name, {}).setdefault(season_start, {})["close"] = dos

    durations = []
    for road in seasons.values():
        for pts in road.values():
            if "open" in pts and "close" in pts:
                days = pts["close"] - pts["open"]
                if days >= 0:
                    durations.append(days)

    if not durations:
        return {"data": {"min": None, "max": None, "avg": None, "count": 0}}

    return {
        "data": {
            "min": min(durations),
            "max": max(durations),
            "avg": round(sum(durations) / len(durations), 2),
            "count": len(durations),
        }
    }


@app.get("/road-closure-stats")
async def road_closure_stats(road_name: str, dataset_id: int = None):
    """Summary statistics of a road's open / close dates across all seasons.

    For each of the Open and Closed series (as "day of season" — days since
    Aug 1 of the season's starting year) returns: average / earliest / latest
    date, standard deviation, Pearson correlation with year, a Mann-Kendall
    trend test, and the Sen's (Theil-Sen) slope in days per year.
    """
    from datetime import date, timedelta
    from scipy.stats import pearsonr, kendalltau, norm, theilslopes

    cur = conn.cursor()
    resolved = _resolve_road_name(cur, road_name)
    if resolved is None:
        cur.close()
        return {"data": {"road_name": road_name, "matched": None,
                         "open": None, "close": None}}

    if dataset_id is None:
        dataset_id = _preferred_road_dataset(cur, resolved)

    filters = ["road_name = %s", "month IS NOT NULL", "day IS NOT NULL"]
    params = [resolved]
    if dataset_id is not None:
        filters.append("dataset_id = %s")
        params.append(dataset_id)
    where = " AND ".join(filters)

    cur.execute(
        f"SELECT year, status, month, day FROM public.road_closures WHERE {where};",
        params,
    )
    rows = cur.fetchall()
    cur.close()

    def day_of_season(season_start, m, d):
        date_year = season_start if m >= 8 else season_start + 1
        try:
            return date(date_year, m, d).toordinal() - date(season_start, 8, 1).toordinal()
        except ValueError:
            return None

    open_pts = {}
    close_pts = {}
    for y, s, m, d in rows:
        if s == "Open":
            dos = day_of_season(y, m, d)
            if dos is not None:
                open_pts[y] = dos
        elif s == "Closed":
            season_start = y - 1
            dos = day_of_season(season_start, m, d)
            if dos is not None:
                close_pts[season_start] = dos

    def dos_label(dos):
        """Format a day-of-season back into a 'Dec 20' style label."""
        d = date(2001, 8, 1) + timedelta(days=round(dos))
        return d.strftime("%b %-d")

    def mann_kendall(values):
        """Mann-Kendall trend test: returns (tau, p, trend-label)."""
        x = np.asarray(values, dtype=float)
        n = len(x)
        s = 0
        for i in range(n - 1):
            s += np.sign(x[i + 1:] - x[i]).sum()

        _, counts = np.unique(x, return_counts=True)
        tie_term = np.sum(counts * (counts - 1) * (2 * counts + 5))
        var_s = (n * (n - 1) * (2 * n + 5) - tie_term) / 18.0
        if var_s <= 0:
            return 0.0, 1.0, "No trend"

        if s > 0:
            z = (s - 1) / np.sqrt(var_s)
        elif s < 0:
            z = (s + 1) / np.sqrt(var_s)
        else:
            z = 0.0

        p = 2 * (1 - norm.cdf(abs(z)))
        tau, _ = kendalltau(np.arange(n), x)

        if p < 0.05 and z > 0:
            trend = "Later over time"
        elif p < 0.05 and z < 0:
            trend = "Earlier over time"
        else:
            trend = "No significant trend"
        return float(tau), float(p), trend

    def series_stats(points):
        """Compute the summary-stat block for a {season_year: dos} series."""
        if len(points) < 3:
            return None
        years = sorted(points.keys())
        dos = [points[y] for y in years]
        arr = np.asarray(dos, dtype=float)

        r, r_p = pearsonr(years, arr)
        tau, mk_p, trend = mann_kendall(arr)
        slope, _, slope_lo, slope_hi = theilslopes(arr, years, 0.95)

        return {
            "n": len(years),
            "first_year": years[0],
            "last_year": years[-1],
            "avg_date": dos_label(float(arr.mean())),
            "earliest_date": dos_label(float(arr.min())),
            "latest_date": dos_label(float(arr.max())),
            # Raw day-of-season values (days since Aug 1) so the UI can place
            # the dates on a timeline.
            "avg_dos": round(float(arr.mean()), 1),
            "earliest_dos": int(arr.min()),
            "latest_dos": int(arr.max()),
            "sd_days": round(float(arr.std(ddof=1)), 2),
            "pearson_r": round(float(r), 4),
            "pearson_p": round(float(r_p), 6),
            "mk_tau": round(tau, 4),
            "mk_p": round(mk_p, 6),
            "mk_trend": trend,
            "sens_slope": round(float(slope), 4),
            "sens_slope_lo": round(float(slope_lo), 4),
            "sens_slope_hi": round(float(slope_hi), 4),
        }

    return {
        "data": {
            "road_name": road_name,
            "matched": resolved,
            "open": series_stats(open_pts),
            "close": series_stats(close_pts),
            "dataset_id": dataset_id,
        }
    }
