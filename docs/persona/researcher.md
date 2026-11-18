# Maya: climate and transportation researcher

> "Before I use a number, I need to know which station and dataset it came
> from, how gaps were handled, and whether I can get the raw data."

**Reality check (October 2026):** Researchers like Maya publish on
winter-road seasons regularly. So far only the team has used WRaMP's research
features. [Evidence](validation.md#maya-climate-and-transportation-researcher)

| | |
|---|---|
| Role | PhD candidate in physical geography, working with northern transportation researchers |
| Works at | A Canadian university |
| Based in | Southern Canada, with fieldwork in the NWT |
| Pronouns | she/her |
| Comfort with data | High. Works in R and Python and knows Mann–Kendall, Sen's slope and LOWESS. |
| Devices | Laptop with an external monitor, fast university connection |
| Visits | In bursts while analyzing and writing; comes back to check methods and references |

## Who she is

Maya studies how a warming climate is changing the seasons of ice roads and
winter roads in the Northwest Territories. She uses WRaMP to scout stations
and roads, check her own analyses against the portal's, and pull homogenized
climate records for her models. She will cite what she uses, so knowing where
the data came from matters as much as the numbers.

## What she's trying to do

- Find long, homogenized climate records near the roads she studies, and know
  exactly which station and dataset each series comes from.
- Check whether trends in freeze-up, thaw, freezing degree days (FDDs) and
  precipitation are statistically significant, and how large they are.
- Get the underlying data into her own tools, and cite it properly.
- Keep up with related work from the project's partner labs.

## Questions she brings

- "Which station and dataset is this FDD series built from, and how were
  missing days handled?"
- "Is the later opening on the Wrigley to Tulita road significant? What's the
  Sen's slope?"
- "Which months are getting wetter at Inuvik, and are those trends
  significant?"
- "Can I get daily temperature for these five stations, from 1951 to today, in
  one file?"

## Features she uses, and how

| Feature | How she uses it |
|---|---|
| **Advanced** switch (city window) | Always on. It shows which climate station and dataset feed the chart, lets her choose another nearby station or dataset (for example CanHomT V4 or ECCC), and adds the LOWESS trend curve. |
| **Calculation Information** (city window) | Documents the method. FDDs are summed from September 1 to May 31. A month with 3 or more consecutive missing days, or 5 or more in total, is dropped, and so is its whole season. |
| Short-record warning | Shown for stations with under 30 seasons of records. She treats those with caution, as it advises, and looks for a longer record nearby. |
| **Monthly Precipitation Trends** (with Advanced on) | Sen's slope for each month, with Mann–Kendall significance, p-values and the strongest signal highlighted. She switches between daily and monthly CanHomP V2 data. |
| **Show detailed statistics** (road popup) | Seasons on record, average, earliest and latest dates, year-to-year standard deviation, Sen's slope in days per year, the Mann–Kendall trend and p-value, and Pearson's r. |
| **Download** | Five steps (station, year and month, variable, dataset, preview), then a CSV built in her browser. |
| **References** | Summaries of the UBC studies. She follows the DOIs and opens the interactive remoteness map. |
| **API** | She checks whether programmatic access is available yet. |
| **Map Layers** and **Base Map** | Spatial context: which stations sit near which roads and crossings. The Hybrid base map shows satellite imagery of the terrain. |

## A typical visit

She's choosing study sites for a thesis chapter on freeze-up timing.

1. She opens **Map**, turns on Ice Crossings, and clicks the Fort Simpson
   community.
2. She switches **Advanced** on and notes the station and dataset. She changes
   the dataset to compare the homogenized record with unadjusted ECCC data, and
   turns on the LOWESS curve.
3. She reads **Calculation Information** and pastes the method into her notes.
4. She opens the **Precipitation** tab, switches to Monthly, and records which
   months have significant trends.
5. She clicks the Liard River ice crossing at Fort Simpson to see its open and
   close statistics. It says "No historical open/close data available for this
   road", even though the database holds over 40 seasons for it under a
   slightly different name.
6. She goes to **Download** to export the station's daily temperature, and
   finds she can only get one month per file.
7. She emails the team for the full record, using the address on **About**.
   Then she reads the accessibility study on **References** and saves its DOI.

## What gets in her way

- **One month per file.** Download exports one station, one month and one
  variable at a time. A 70-year daily record is 840 files per variable.
- **The calculated series can't be exported.** FDD totals, LOWESS curves,
  precipitation trends and road open and close dates exist only on screen.
- **No API yet.** The API page says "In development". The data API that the
  portal itself uses does exist, but it isn't documented, versioned or offered
  to the public.
- **The record's limits are hidden.** The FDD chart asks only for 1951–2023
  and automatically picks the dataset with the most rows. For Yellowknife that
  is CanHomT V4, which ends in 2012. Newer ECCC seasons appear only after
  switching dataset, and nothing after 2023 ever shows.
- **The ice-crossing records can't be reached from the map.** The names don't
  match (see [Verified gaps](README.md#verified-gaps)), though these are among
  the longest records in the database.
- **Nothing to cite.** There are no dataset versions, import dates or "how to
  cite" text, and no permanent link to the exact view she used.

## What would serve her better

- Downloads covering many years and stations at once, including the calculated
  FDD and road-season series.
- A documented, versioned public API, which the API page already promises.
- A citation block on each chart: dataset name and version, last import date
  and station ID.
- Station details (location, elevation, record length) next to the station
  picker under **Advanced**.
- Links that capture the current station, dataset and year range.

## Evidence in the codebase

- **Advanced** switch, station and dataset pickers, LOWESS, **Calculation Information**, short-record warning and the precipitation trend table: `showAdvanced`, `SHORT_RECORD_YEARS` and `renderPrecipTrendTable` in [Map.jsx](../../ui/src/components/Map/Map.jsx).
- Minimum seasons before a chart is drawn: `MIN_GRAPH_POINTS` in [FddChart/model.js](../../ui/src/components/Map/components/FddChart/model.js).
- Download steps: [Download/index.jsx](../../ui/src/pages/Download/index.jsx). API placeholder: [Api/index.jsx](../../ui/src/pages/Api/index.jsx).
- Statistical methods: `/fdd`, `/lowess`, `/precip-trend` and `/road-closure-stats` in [main.py](../../python-api/src/main.py).
- Data sources and importer: [climatedataimporter/README.md](../../climatedataimporter/README.md).
