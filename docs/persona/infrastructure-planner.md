# Daniel: infrastructure and policy planner

> "I need to tell the deputy minister which roads are losing season, by how
> much, and how sure we are. On one page."

**Reality check (October 2026):** People in this role clearly exist; GNWT
alone builds about 1,400 km of winter roads a year. There's no sign of them
using WRaMP yet. [Evidence](validation.md#daniel-infrastructure-and-policy-planner)

| | |
|---|---|
| Role | Senior transportation planner |
| Works at | A territorial department of infrastructure, like GNWT Infrastructure (a portal partner) |
| Based in | Yellowknife, NWT |
| Pronouns | he/him |
| Comfort with data | Reads charts and GIS layers easily; not a statistician |
| Devices | Office desktop with two monitors; sometimes a tablet in meetings |
| Visits | A few times a month, more often during budget cycles and before briefings |

## Who he is

Daniel plans the long-term future of the territory's winter road network. He
writes briefing notes and makes the case for capital projects, such as
realigning a road or replacing it with an all-season road. He also answers
questions from federal partners and community leaders. He doesn't need to run
the statistics himself, but he must be able to explain what they mean and
defend them when someone asks "is that significant?".

## What he's trying to do

- Find out which roads are losing the most season, from which end (later
  freeze-up or earlier thaw), and how strong the evidence is.
- Set that against each community's alternatives (airports, ferries, ice
  crossings, proposed all-season roads) to decide where to invest first.
- Connect road seasons to their effects on communities: remoteness, cost of
  access, safety.
- Turn all of that into a slide, a chart and a sentence he can stand behind.

## Questions he brings

- "Is the Gamètì Winter Road season actually getting shorter? By how much per
  decade?"
- "Which communities lose road access first if this keeps up, and what's their
  fallback?"
- "Where are the proposed all-season roads compared with the roads most at
  risk?"
- "Is there published research I can cite on what losing road access costs?"

## Features he uses, and how

| Feature | How he uses it |
|---|---|
| **Climate Trend Statistics** (road popup) | His main tool. He reads the opening-date, closing-date and season-length tiles and checks for "strong evidence". He copies the one-sentence takeaway into briefing notes. The "then vs now" strip shows how far the season has narrowed. |
| **Open/Close Trend** (road popup) | The chart for his slide. If the blue band narrows from left to right, the season is shrinking. |
| **Open Duration per Year** (road popup) | Shortest, average and longest seasons on record. Hovering the gauge shows how unusual a season length is: typical, uncommon, rare or very rare. |
| **Show detailed statistics** (road popup) | Opened when a reviewer asks about significance: Mann–Kendall trend and p-value, Sen's slope, seasons on record. |
| **Map Layers**: Winter Roads, Ice Crossings, Ferries, Airports, Proposed Roads | Shows each community's options for getting goods in. Airport popups give runway type and length. He uses the **Topographic** base map, which shows First Nations roads that the street map leaves out. |
| **Freezing Degree Days** (city window, plain mode) | Evidence that winters are getting milder. Fewer freezing degree days means less cold to build ice. |
| **References** | He cites the UBC study summaries: months of road access against travel cost (Pearson r = −0.656), a comparison of remoteness indices, and road accident severity with its policy implications. |
| **Transportation** | Links out to the Northern Transportation Network Study StoryMap collection. |

## A typical visit

He's preparing a briefing on winter-road vulnerability in the Tłı̨chǫ and Sahtú
regions.

1. He opens **Map** on his desktop. In **Map Layers** he turns on Proposed
   Roads and Airports, then switches **Base Map** to Topographic.
2. He clicks the Gamètì Winter Road. Under **Climate Trend Statistics** he
   notes the shift in days per decade, whether the evidence is strong, and the
   takeaway sentence.
3. He repeats this for Wekweètì, Colville Lake and the Highway 1 segments,
   copying the numbers into a spreadsheet because the portal has no way to
   compare roads. When he gets to the Délįne road, it shows "No historical
   open/close data available for this road".
4. He screenshots the **Open/Close Trend** for the road with the strongest
   shift.
5. He clicks each community's airport and notes the runway length and type,
   since flying goods in is the fallback if the road fails.
6. He opens **References**, then "Measuring Accessibility in Northern Remote
   Regions", for a citable line on what it costs a community to lose road
   access.
7. He opens the Norman Wells community and uses the FDD chart to make the point
   about milder winters.

## What gets in his way

- **No comparison or ranking.** Every road is a separate popup, so a
  network-wide picture means clicking and copying numbers by hand. The data
  API can already calculate network-wide season lengths
  (`/road-closure-duration-range`), but the site never asks for them.
- **Missing roads look like missing evidence.** Délįne, Sambaa K’e and the NWT
  ice crossings all say "No historical data", though each has over 40 seasons
  of records stored under a slightly different name (see [Verified
  gaps](README.md#verified-gaps)). In a briefing, "no data" and "no trend" are
  easy to confuse.
- **Nothing to export or link.** Screenshots are the only way to get anything
  out. The map's state isn't in the URL, so he can't send a colleague "this
  road, this view".
- **How current the data is isn't stated up front.** The headline tiles say
  "per decade since" a first year, but not the last season included, which is
  2025–26 for most roads. The FDD chart may end years earlier: for Yellowknife,
  the default view stops at 2012.
- **NWT only.** For Nunavut and Yukon he gets climate charts and infrastructure
  layers, but no history of road seasons.
- **Little detail on proposed roads.** The Proposed Roads popup shows only a
  category, with no status, timeline or the community it would connect.
- **An empty promise.** "Winter Road Profile" appears on the home page and on
  Projects, but has no content behind it.

## What would serve him better

- A comparison view: every road in one table, sortable by change in season
  length and by strength of evidence.
- Export (chart as PNG, numbers as CSV) and links that open a specific road or
  community.
- A "data through 2025–26" stamp on every chart and statistic.
- Per-road profiles (the planned Winter Road Profile) that combine season
  trend, alternatives and the community served.

## Evidence in the codebase

- Purpose statement: [WelcomeBanner.jsx](../../ui/src/components/Home/WelcomeBanner/WelcomeBanner.jsx). Partners: [Home.jsx](../../ui/src/pages/Home/Home.jsx).
- Road popup sections and the plain-language takeaway: `renderRoadTrendChart`, `renderRoadDurationChart` and `renderRoadStatsSection` in [Map.jsx](../../ui/src/components/Map/Map.jsx).
- Layers and their popup fields: `layerData` in [Data.js](../../ui/src/components/Map/Data.js).
- Statistics endpoints: `/road-closure-trend`, `/road-closure-stats` and `/road-closure-duration-range` in [main.py](../../python-api/src/main.py).
- Study summaries: [References](../../ui/src/pages/References/) (`content.json`).
