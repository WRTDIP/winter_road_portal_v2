-- datasets: describes data sources / origins
CREATE TABLE public.datasets (
    id               INTEGER PRIMARY KEY,
    name             VARCHAR,
    timecreated      INTEGER,
    timeupdated      INTEGER,
    resourcelink     VARCHAR
);

-- weather_stations: one row per ECCC weather station
CREATE TABLE public.weather_stations (
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

CREATE INDEX weather_stations_province_idx ON public.weather_stations (province);
CREATE INDEX weather_stations_climate_id_idx ON public.weather_stations (climate_id);


-- daily_data: one row per station per observation date
CREATE TABLE public.daily_data (
    id                       BIGSERIAL PRIMARY KEY,
    station_id               INTEGER NOT NULL
        REFERENCES public.weather_stations(station_id) ON DELETE CASCADE,
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
    dataset_id               INTEGER REFERENCES public.datasets(id) ON DELETE SET NULL,

    CONSTRAINT daily_data_station_date_uniq UNIQUE (station_id, obs_date)
);

CREATE INDEX daily_data_station_idx ON public.daily_data (station_id);
CREATE INDEX daily_data_date_idx ON public.daily_data (obs_date);
CREATE INDEX daily_data_dataset_idx ON public.daily_data (dataset_id);


-- road_closures: one row per road per status (Open/Closed) for a season,
-- per dataset (8 = legacy CSV, 9 = GNWT XLSX workbooks).
-- The season year (e.g. "2024/25") is split: the lower year (2024) is stored
-- for the Open row, the higher year (2025) for the Closed row.
CREATE TABLE public.road_closures (
    id            BIGSERIAL PRIMARY KEY,
    dataset_id    INTEGER REFERENCES public.datasets(id) ON DELETE SET NULL,
    year          INTEGER NOT NULL,
    road_name     TEXT NOT NULL,
    road_type     TEXT NOT NULL,
    status        TEXT NOT NULL,
    month         INTEGER,
    day           INTEGER,

    CONSTRAINT road_closures_dataset_year_road_status_uniq
        UNIQUE (dataset_id, year, road_name, status)
);

CREATE INDEX road_closures_year_idx ON public.road_closures (year);
CREATE INDEX road_closures_road_name_idx ON public.road_closures (road_name);
CREATE INDEX road_closures_road_type_idx ON public.road_closures (road_type);
CREATE INDEX road_closures_dataset_idx ON public.road_closures (dataset_id);