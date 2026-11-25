# WRaMP user personas

Who the Winter Road and Mobility Portal is for, what they come to do, and which
parts of the portal they rely on.

Based on the codebase and data as of 13 October 2026.

## How these were made

These personas come from a read of the whole codebase: the React site (`ui/`),
the climate data API (`python-api/`), the account API (`api/`), the data
importer (`climatedataimporter/`) and the research team's source files
(`yukari_files/`). They also draw on the portal's own content: the home page,
Projects, References and the Winter Road Watch guides. Claims about data
coverage were checked against the dev database and the public ArcGIS layers
the map draws.

They are hypotheses grounded in what the product does and says. They are not
findings from talking to users. The portal has no analytics. A first check
against server logs, the database and Winter Road Watch data is in [Do these
personas exist?](validation.md). The tools these people use today are in
[What else does this job today](market-landscape.md).

## The four personas

| Persona | Core question | Leans on | Device |
|---|---|---|---|
| [Daniel, infrastructure and policy planner](infrastructure-planner.md) | "Which roads are losing the most season, and how sure are we?" | Road trend statistics, infrastructure layers, References | Office desktop |
| [Maya, climate and transportation researcher](researcher.md) | "Is the signal real, which record is it from, and can I get the data?" | Advanced mode, detailed statistics, Download, References | Laptop |
| [Rosa, northern logistics coordinator](logistics-coordinator.md) | "When can we haul this winter, and how long will the window last?" | Road dates, season length, airports and crossings, forecast | Desktop at the office, phone on the road |
| [Sam, community member and Winter Road Watch observer](community-observer.md) | "Is our road really changing, is it safe to travel, and how do I add what I see?" | Winter Road Watch, plain-language road popup, forecast | Phone, patchy coverage |

Daniel represents the portal's stated purpose. The home page says WRaMP is
"designed to aid in decision-making and prioritize policies for managing
winter roads impacted by climate change". The partners listed there include
GNWT Infrastructure, Transport Canada and CIRNAC. The other three are just as
central: the portal is a university research product (Maya), its home page is
about freight and the cost of goods (Rosa), and it runs a citizen-science
project (Sam).

### Why four and not three

Daniel and Rosa open the same road popup but read different parts of it, on
different time scales. Daniel reads the decade-scale trend in **Climate Trend
Statistics**. Rosa reads this season's dates in **Details** and the length of
the window in **Open Duration per Year**. They need different improvements:
comparison and citable outputs for Daniel, date ranges and alerts for Rosa.
Merging them would hide one of the two.

Sam shares Rosa's focus on this season. The difference is that Sam is on a
phone, in a community, and also contributes data.

## Who uses what

● core to their visit · ○ occasional · blank: rarely or never

| Feature | Where | Daniel | Maya | Rosa | Sam |
|---|---|:-:|:-:|:-:|:-:|
| Road popup: **Details** (opening and closing dates) | Map, click a winter road or ice crossing | ○ | | ● | ● |
| Road popup: **Open/Close Trend** | Map, road | ● | ● | ○ | ○ |
| Road popup: **Open Duration per Year** and gauge | Map, road | ● | ○ | ● | |
| Road popup: **Climate Trend Statistics** (plain language) | Map, road | ● | ○ | ○ | ● |
| Road popup: **Show detailed statistics** | Map, road | ○ | ● | | |
| City window: **Freezing Degree Days** | Map, click a community | ● | ● | ○ | ○ |
| City window: **Advanced** switch | Map, community | | ● | | |
| City window: precipitation, snowfall, temperature | Map, community | ○ | ● | | ○ |
| **3-Day Weather Forecast** | Map, community; **Map Layers** panel | | | ● | ● |
| Airports, ferries, ice crossings, proposed roads | Map, **Map Layers** | ● | ○ | ● | ○ |
| **My Location** | Map toolbar | | | ○ | ● |
| **Download** (monthly CSV) | `/download` | | ● | | |
| **API** (planned) | `/api` | | ● | | |
| **References** (study summaries) | `/references` | ● | ● | | |
| **Transportation** (StoryMap collection) | `/transportation` | ● | ○ | | |
| **Winter Road Watch** guides and QR codes | `/projects` | | | | ● |
| **Observation** web map | `/observation` | ○ | ○ | | ● |
| Account (register, sign in, dashboard) | `/login`, `/dashboard` | | | | |

The account row is empty because signing in doesn't unlock anything yet (gap 6
below).

## Verified gaps

These cut across personas. Each was checked on 13 October 2026.

**1. About half the clickable roads show no history, even where decades of
records exist.** The road popup looks up records by the road's name on the map.
12 of the 23 winter-road and ice-crossing features don't match a name in the
database, so their popups say "No historical open/close data available for this
road":

| On the map | In the database | Status |
|---|---|---|
| Déline Winter Road | Délįne Winter Road | Same road, different spelling |
| Sambaa K'e Winter Road (straight apostrophe) | Sambaa K’e Winter Road (curly apostrophe) | Same road, different character |
| Liard River Ice Crossing at Fort Simpson | Liard River Crossing at Fort Simpson | Same crossing, different wording |
| Mackenzie River Ice Crossing at Tsiigehtchic | Mackenzie River Crossing at Tsiigehtchic | Same crossing, different wording |
| Peel River Ice Crossing | Peel River Crossing | Same crossing, different wording |
| Mackenzie River Ice Crossing (Ndulee) | Mackenzie River Crossing at Camsell Bend | Very likely the same crossing |
| Whatì to Gamètì Winter Road | Whatì Winter Road | Unclear, may be a different segment |
| Edzo Ice Road, Hay River Ice Road (New Town and Old Town), Aklavik to Gwich’in Wellness Camp, Dawson City Ice Bridge (Yukon) | — | No records |

Each of the first six has over 40 seasons of records (1983 to 2025–26).

**2. Road history covers the NWT only.** All open and close dates come from
GNWT workbooks: 19 roads and crossings, most with records from 1983 through the
2025–26 season. Nunavut's only winter road on the map is the Tibbitt–Contwoyto
road it shares with the NWT. Yukon's ice bridge has no records. Users in
Nunavut and Yukon get climate data and infrastructure layers, but no history of
road seasons.

**3. My Location doesn't use the device's location.** `DEBUG_GPS.enabled` is
`true` in [Map.jsx](../../ui/src/components/Map/Map.jsx). Every visitor is
placed at 62.45° N, 114.37° W, and the map opens Yellowknife's climate window.

**4. The freezing degree day (FDD) chart can miss recent winters.** The map
asks only for 1951–2023, then switches to whichever dataset has the most rows.
For Yellowknife that is CanHomT V4, which ends in 2012, so the default chart
stops there. ECCC seasons from 2014 onward appear only after switching dataset
under **Advanced**, and the 2023 cap still hides the latest winters.

**5. Getting data out is slow.** Download exports one station, one month and
one variable per CSV. The FDD, precipitation-trend and road-season series
behind the charts can't be exported at all. The API page says "In
development".

**6. An account doesn't do anything yet.** Signing in shows a dashboard with
account details and an "Open map" button, and every page is public. The
database already has a `userlevel` field and a `Post` model, which suggests
roles and blog authoring are planned.

**7. Some promises have nothing behind them.** The home-page Features cards
aren't links. "Winter Road Profile" (home page and Projects) and the "Winter
Road User Community Online Survey" (Projects) have a description but no link or
page. The Blog shows placeholder articles (labelled as such). A developer-only
"Dev: Legend" switch is visible to everyone under Monthly Precipitation
Trends.

**8. Nothing can be shared or compared.** Map state isn't in the URL, so
there's no link to a particular road or community. There's no way to compare
roads side by side or to export a chart.

## What works and should be kept

- **Plain language first, detail on demand.** The road popup leads with a "How
  to read this" key, headline tiles and a one-sentence takeaway. The full
  statistics sit behind "Show detailed statistics". The city window keeps
  station and dataset choices, LOWESS and p-values behind **Advanced**. This
  one pattern serves all four personas.
- **Honest caveats.** The warning for stations with under 30 seasons of
  records, the "Not enough data points" message below 6 seasons, and the
  **Calculation Information** panel.
- **Phone layouts that keep the data readable.** Road popups open almost full
  screen on a phone. Wide charts scroll sideways instead of squashing. The FDD
  chart supports pinch-zoom and "last 30 / last 10 years" shortcuts.
- **Winter Road Watch's design.** It works offline and asks only for a
  nickname or initials, and its privacy policy is written to respect Indigenous
  knowledge holders.

## Secondary audiences

These users are real, but they don't get their own persona because the four
above already cover what they need.

- **Students, educators and journalists** read the home page, References and
  the StoryMap collection, and use the map in plain-language mode. They need
  quotable numbers, shareable charts and a clear way to cite, which are
  Daniel's needs too.
- **Developers building on the data** are named on the API page. They are
  blocked until the API ships, and Maya's needs cover theirs.
- **The project team** (Climate Lab at UTSC and UBC's Multimodal Mobility
  Systems Lab) imports data, writes the study summaries and runs Winter Road
  Watch. They operate the portal rather than use it.

## Using these personas

- When proposing a change, name the persona and the step of their typical visit
  that it improves.
- Before adding scope, check the change against each persona's "What gets in
  the way" list.
- Each area has a lead persona:
  - Road popup and city window: all four, so keep plain language first.
  - Download and API: Maya.
  - Projects and Observation: Sam.
  - Map Layers: Daniel and Rosa.

## Validating these personas

First results (October 2026) are in [Do these personas exist?](validation.md).
In short, all four describe real people, but none is yet a measurable group of
WRaMP users, and Sam is a target rather than a current user.

Some low-cost ways to keep testing them:

- Ask Winter Road Watch participants and partner contacts which persona they
  recognize themselves in, and what's missing.
- Add two or three questions about portal use to the Winter Road User Community
  Online Survey.
- Add privacy-respecting usage analytics, so the table in [Who uses
  what](#who-uses-what) can be checked against real use.
