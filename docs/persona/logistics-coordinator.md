# Rosa: northern logistics coordinator

> "I don't need the climate science. I need to know when the road opens, how
> long we'll have, and what we do if it closes early."

**Reality check (October 2026):** The role is real and large; the mines' road
alone planned 5,800 truckloads in 2025. No use of WRaMP has been seen yet, but
the logs only cover the off-season. [Evidence](validation.md#rosa-northern-logistics-coordinator)

| | |
|---|---|
| Role | Logistics and resupply coordinator |
| Works at | A northern freight and fuel-hauling company serving winter-road communities and a mine site |
| Based in | Hay River, NWT |
| Pronouns | she/her |
| Comfort with data | Spreadsheets and logistics software; not GIS or statistics |
| Devices | Office desktop for planning; a phone at the yard and on the road, where coverage drops out |
| Visits | Weekly in the fall while planning, almost daily from January to March, rarely in summer |

## Who she is

Rosa books trucks, drivers and loads (fuel, building materials, groceries) for
the winter road season. Anything that doesn't move during that short window
has to be flown in at much higher cost or wait for the summer barge. A late
opening or an early thaw costs her company money and leaves communities short
of supplies. Community resupply officers, mine logistics staff and northern
retailers do the same job from different seats.

## What she's trying to do

- Know when each road she uses usually opens and closes, and whether this
  season's dates have been recorded.
- Estimate how long the hauling window will be, and how likely it is to be
  short this year.
- Plan for things going wrong: which airports can take freight aircraft, and
  where ferries and ice crossings break the route during freeze-up and
  break-up.
- Check the weather before she sends out a load.

## Questions she brings

- "When does the Tibbitt–Contwoyto road usually open? Has it opened yet this
  year?"
- "What's the shortest season the Gamètì road has had, and are short seasons
  becoming more common?"
- "If we miss the window, how long is the runway at the community's airport?"
- "What's the weather at the far end of the route for the next three days?"

## Features she uses, and how

| Feature | How she uses it |
|---|---|
| **Details** (road popup) | The most important line for her. It says "Opening" and "Closure" when this season's dates have been recorded. Otherwise it says "Average Opening" and "Average Closure": the historical average, placed on this season's calendar. |
| **Open Duration per Year** (road popup) | How many days the road stayed open each season. The gauge marks the shortest, average and longest, and hovering it shows how unusual a season length is. She sets her contingency buffers from it. |
| **Open/Close Trend**, and the season strip in **Climate Trend Statistics** | Whether openings are drifting later, plus the earliest, latest and usual opening and closing dates. |
| **Map Layers**: Winter Roads, Ice Crossings, Ferries, Airports, Major and Minor Roads | Whether her route is continuous, and the fallback by air. Airport popups list runway type and length. |
| **3-Day Weather Forecast** | Current conditions, highs and lows, precipitation and maximum wind for a community, with a link to Environment Canada's forecast. A compact version appears in the **Map Layers** panel once she selects a community. |
| **My Location** (phone) | Meant to jump to the nearest road or community and open it. |

## A typical visit

**In September, at her desk:**

1. She opens **Map** and turns on Ice Crossings, Ferries and Airports.
2. She clicks the Tibbitt–Contwoyto Winter Road. **Details** shows the average
   opening and closing dates for the coming season, and she copies them into
   her planning sheet.
3. She expands **Open Duration per Year**, notes the shortest season on
   record, and hovers over the gauge to see how rare it was.
4. She repeats this for each community road her company serves, then clicks
   each community's airport to note runway type and length.
5. She clicks the Liard River crossing at Fort Simpson, on Highway 1 between
   Hay River and the Sahtú roads. It says "No historical data", even though the
   database holds over 40 seasons for it under a slightly different name.

**In January, on her phone:**

6. She opens **Map** to see whether the opening date for a road has changed
   from an average to an actual date. It hasn't. Actual dates appear only
   after the research team imports GNWT's updated workbook, which so far runs
   through the 2025–26 season. She checks the government's road-conditions
   reports instead.
7. She taps the destination community, scrolls to **3-Day Weather Forecast**,
   and decides whether to send the convoy tomorrow.

## What gets in her way

- **No live status.** The portal shows historical averages. This season's
  actual dates appear only after GNWT's workbook is imported, and there's no
  link to the government's live road-conditions reports.
- **The ice crossings she depends on show no history.** The NWT ice crossings
  are stored under slightly different names ("…Crossing" rather than "…Ice
  Crossing"), so their records never reach the map (see [Verified
  gaps](README.md#verified-gaps)).
- **A single average hides the risk.** **Details** gives one average date. The
  range of dates and the shortest season are in sections further down that she
  has to expand.
- **One road at a time.** There's no season calendar showing every road she
  uses on one screen.
- **Forecasts cover communities, not routes.** There is nothing for the long
  stretches between communities.
- **My Location doesn't work yet.** It's fixed to a test position near
  Yellowknife, so it never finds the road she's on.
- **No alerts.** She can create an account, but it can't tell her when a road
  opens or closes.

## What would serve her better

- The usual range next to the average in **Details**, for example "usually
  [date], between [date] and [date] in most seasons".
- A season calendar showing every road and crossing she uses, with their usual
  opening and closing windows.
- Alerts when a road opens or closes. This would also give accounts a purpose.
- A link from each road to its official road-conditions page.

## Evidence in the codebase

- The home page on freight and the private transportation sector: [Home.jsx](../../ui/src/pages/Home/Home.jsx).
- Actual or average dates: `/road-closure-forecast` in [main.py](../../python-api/src/main.py). The popup labels are set in the road popup effect in [Map.jsx](../../ui/src/components/Map/Map.jsx).
- Duration chart and gauge: `renderRoadDurationChart` and `DurationHeatGauge` in Map.jsx.
- Airport, ferry and ice crossing layers: `layerData` in [Data.js](../../ui/src/components/Map/Data.js).
- Forecast: [ForecastPanel.jsx](../../ui/src/components/Map/ForecastPanel.jsx), using Open-Meteo. The compact forecast in the layer panel is `updateLayerPanelMiniForecast` in Map.jsx.
- Mining road data: the Tibbitt–Contwoyto Winter Road (a private mining road) has records from 1983 to 2026.
