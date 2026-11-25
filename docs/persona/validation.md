# Do these personas exist?

Checked on 13 October 2026, using two kinds of evidence: whether people like
this exist in the world, and whether they use WRaMP today.

## Short answer

All four personas describe real people. None of them is a measurable group of
WRaMP users yet.

| Persona | Exists in the world? | Uses WRaMP today? | Verdict |
|---|---|---|---|
| [Daniel, planner](infrastructure-planner.md) | Yes, strong evidence. GNWT builds about 1,400 km of winter roads a year and is planning around shorter seasons. | No sign of use in four weeks of server logs. It's the off-season, and the production site's own logs aren't on this server. | Keep. Widen to include Indigenous and federal governments. |
| [Maya, researcher](researcher.md) | Yes, strong evidence. Peer-reviewed work on winter-road seasons continues, including a 2026 study of the Tibbitt–Contwoyto road. | Only the team. Download was used once in four weeks, from a developer's machine. | Keep. The most likely early adopter once data can be exported. |
| [Rosa, logistics coordinator](logistics-coordinator.md) | Yes, strong evidence. The mines' road planned 5,800 truckloads for 2025, and GNWT planned 9.7 million litres of fuel over winter roads to 12 communities in 2022. | No sign of use (off-season). | Keep. Live status comes from DriveNWT and the road operators; WRaMP serves her planning. |
| [Sam, community observer](community-observer.md) | The role exists. Nine NWT communities depend on winter roads, and northern residents already log ice conditions in other apps. | Winter Road Watch has about 50 in-season observations in total, from a handful of people, mostly near Yellowknife. None are dated in the 2025–26 season. | Keep, but as a target persona, not a current one. |

## What our own data shows

Sources: the Apache access log on the dev server (15 September to 13 October
2026), the dev database, and the project's public ArcGIS items. Everything was
aggregated. No IP addresses, emails or observer names were extracted.

### Site traffic

- **Mostly bots.** 40,197 requests in four weeks; 69% came from bots and
  vulnerability scanners.
- **Few real sessions.** About 57 browsers actually ran the app, meaning they
  loaded its code or called its data API. More than half of those fetched the
  code but used no features, which is typical of automated scanners.
- **Nearly all real use came from the team**, through the development domain
  (`dev-moh.wramp.ca`) and local machines. Almost all road popups, city windows
  and the one Download were used there.
- **Very little through the public domains.** Through `wramp.ca` and
  `wramp.utsc.utoronto.ca`, the data API received six community-window opens
  (Yellowknife four times, plus Colville Lake and Wrigley). There were no road
  popups and no downloads.
- **Few outside referrals.** Two visits came from Google, and eight from links
  shared in Microsoft Teams.

These numbers come with caveats:

- Mid-September to mid-October is the off-season. Winter roads open from
  December onward, and Rosa and Sam would be most active from January to
  March.
- The production site's page views are logged on the UTSC server, not here.
  This server sees only production's map data requests, because the live site
  sends them to `dev-moh.wramp.ca/python-api`.
- Domain traffic reaches this server through a TCP proxy that hides visitors'
  IP addresses, so visitor counts are approximate.
- The logs only go back to 15 September, when the containers were recreated.

### Accounts

The dev database has **0 accounts**. The production database isn't reachable
from this server.

### Winter Road Watch participation

From the project's public Survey123 result layers, by survey version:

| Version | Records | In road season (Dec–Apr) | Pattern |
|---|---|---|---|
| Winter Road and Trail Watch v1 (2021–23) | 36 | 0 | Submitted in June, August or September: almost certainly tests or training |
| Winter Road and Trail Watch v2 (2022) | 16 | 0 | All on 27–28 September 2022 |
| Winter Road and Trail Watch v3 (2023–25) | 50 | 20 | 19 in March 2024, 10 of them on one day; the other 30 in May–July 2023 |
| Winter Road Watch (current) | 30 | 30 | 14 February to 5 March 2025, 5 observer names, 12 on one day |

That makes about 50 real in-season observations across five years. They
cluster on a few days, which looks like organized field sessions rather than
everyday use. Where a road was named, it was most often the Dettah Ice Road
next to Yellowknife (7 of 30 in 2025). None of the public records are dated in
the 2025–26 season.

### Lifetime views of the project's public ArcGIS items

| Item | Views | Created |
|---|---|---|
| Winter Road Watch results layer | 4,884 | March 2024 |
| Winter Road Watch map (the Observation page's link) | 671 | April 2025 |
| StoryMap: A Comparison of Remoteness Indices | 363 | May 2025 |
| StoryMap collection: Northern Transportation Network Study | 210 | December 2025 |
| StoryMap: Measuring Accessibility in Northern Remote Regions | 179 | December 2025 |
| StoryMap: Remoteness and Risk Factors Affecting Road Accident Severity | 29 | December 2025 |

These counts include the team and every load of WRaMP's own map, so they put a
ceiling on outside interest rather than measuring it.

### What the project itself said its users would be

- In 2019 the project said the tool would "inform motorists and snowmobilers
  about the conditions of their roads" ([UTSC](https://www.utsc.utoronto.ca/people/gough/2019/08/)).
  That audience is close to Sam.
- The 2025 NWT research licence (no. 17684) describes a portal for northern
  communities and decision-makers. It also notes that no comprehensive map of
  winter surface transportation exists in print or online
  ([NWT Research Database](https://data.researchlicensing.ece.gov.nt.ca/Scientific/17684);
  the page sits behind a verification check, so this comes from its indexed
  summary).
- Earlier survey versions had separate "fieldworker" and "stakeholder" views,
  the same split as Sam (who contributes) and Daniel (who reads).

## Evidence from the world

### Daniel, infrastructure and policy planner

- GNWT builds and maintains about 1,400 km of winter roads, ice roads and ice
  crossings a year, serving nine communities without all-season roads. In
  2023–24 the minister described construction delays linked to climate change,
  and a resupply that had to double truck traffic to 400 after the last barge
  to Norman Wells couldn't sail
  ([GNWT, 2023–24 statement](https://www.gov.nt.ca/fr/node/12493)).
- GNWT has had a transportation climate adaptation plan since 2013
  ([Change and Challenge](https://changingclimate.ca/map/change-and-challenge-climate-change-adaptation-plan-for-the-gnwt-department-of-transportation/)).
  It has replaced winter roads with all-season roads, including to
  Tuktoyaktuk and Whatì
  ([News Deeply, 2017](https://newsdeeply.thenewhumanitarian.org/arctic/articles/2017/4/6/thin-ice-the-drive-toward-all-season-roads-in-canadas-north)).
- Transport Canada's Northern Transportation Adaptation Initiative funded GNWT
  ($50,000) to test how resilient winter-road construction methods are to
  climate change. It also funded the University of Alberta ($49,968) to build a
  decision-support model on replacing the Slave Geological Province winter road
  with an all-weather road
  ([Transport Canada](https://tc.canada.ca/en/programs/northern-transportation-adaptation-initiative-program/projects-funded-northern-transportation-adaptation-initiative)).
- Indigenous governments also run and report on winter roads. The Tłı̨chǫ
  Government posts opening notices and weight limits for the Gamètì and Whatì
  roads ([Tłı̨chǫ Government](https://tlicho.ca/node/5699)).

### Maya, climate and transportation researcher

- Song, Sparrow and Wallom (2026, *Cold Regions Science and Technology*) used
  freezing degree days to model the Tibbitt–Contwoyto road's season. They
  projected no viable operations by 2080
  ([Oxford ORA](https://ora.ox.ac.uk/objects/uuid:51815044-e5ef-41c1-a22d-770070b9240c),
  [TRID](https://trid.trb.org/View/2694700)).
- Stephenson et al. (*Nature Climate Change*) projected that winter-road access
  across Canada's Arctic will fall as winters warm
  ([RCI](https://www.rcinet.ca/eye-on-the-arctic/?p=18944)).
- NRC researchers (NRC is a WRaMP partner) have reviewed Canada's many ice-road
  guidelines ([TAC paper](https://tac-atc.ca/wp-content/uploads/barrette.pdf)).
  The University of Alaska Fairbanks studies ice-road design
  ([UAF](https://aidc.uaf.edu/project-reports/2023/design-and-operation-of-ice-roads/)).
  A 2025 preprint compares recent lake-ice formation near Yellowknife with the
  1942–2023 record
  ([EGUsphere](https://egusphere.copernicus.org/preprints/2025/egusphere-2025-975/)).
- The UBC studies summarized on WRaMP's References page are themselves evidence
  of this audience.

### Rosa, northern logistics coordinator

- The Tibbitt–Contwoyto joint venture planned 5,800 loads for 2025, after about
  6,000 in 2024, 6,400 in 2023 and 7,800 in 2022
  ([JV notices](https://jvtcwinterroad.ca/news)). The 2025 season ran from
  4 February to 29 March
  ([Cabin Radio, opening](https://cabinradio.ca/220212/news/travel/nwt-mines-winter-road-on-track-to-open-february-4);
  [Cabin Radio, closing](https://cabinradio.ca/229490/news/yellowknife/tibbitt-contwoyto-winter-road-to-close-this-weekend)).
- GNWT planned to deliver 9.7 million litres of petroleum products over winter
  roads to 12 communities in 2022
  ([GNWT, 2022 statement](https://www.gov.nt.ca/en/newsroom/diane-archie-update-winter-road-season-and-community-fuel-resupply-0)).
  In 2024 it added 2 million litres of jet fuel and doubled the number of trucks
  to 400 ([GNWT, 2023–24 statement](https://www.gov.nt.ca/fr/node/12493)).
- When a road opens late, communities fall back on air freight, and Wekweètì's
  chief has described what that costs residents
  ([CBC](https://www.cbc.ca/lite/story/1.5062005)).
- Trade press reported that the 2026 season struggled to keep the ice thick
  enough for heavy-haul convoys
  ([Skillings](https://skillings.net/arctic-logistics-crisis-record-warmth-shuts-diamond-mine-ice-roads)).

### Sam, community member and observer

- Nine NWT communities depend on winter roads for overland access
  ([GNWT, 2022 statement](https://www.gov.nt.ca/en/newsroom/diane-archie-update-winter-road-season-and-community-fuel-resupply-0)).
- Northern residents already record and share ice conditions:
  - SIKU, launched by the Arctic Eider Society in 2019, lets users log
    dangerous ice with GPS-tagged photos in several languages and dialects
    ([Arctic Focus](https://www.arcticfocus.org/stories/by-inuit-and-for-inuit-mobile-app-bridges-traditional-knowledge-and-technology/)).
  - SmartICE trains community operators to measure ice thickness along travel
    routes
    ([National Geographic](https://www.nationalgeographic.com/environment/article/how-inuit-avoid-falling-through-thinning-Arctic-ice)).
- North Slave Métis Alliance Guardians camp on the Tibbitt–Contwoyto road each
  winter to monitor caribou
  ([NSMA](https://www.nsma.net/winterroad);
  [Mongabay](https://news.mongabay.com/2026/06/as-canada-eyes-arctic-road-expansion-indigenous-guardians-race-to-understand-caribou/)).
- WRaMP's own observers, though, number about five. Most of their observations
  are next to Yellowknife, not in remote communities like Délįne.

## Suggested changes to the personas

- **Daniel.** Add Indigenous governments (such as the Tłı̨chǫ Government) and
  federal departments to "Works at". He also needs climate projections, which
  WRaMP doesn't have (see [What else does this job
  today](market-landscape.md)).
- **Maya.** No change. Her main reason to use WRaMP rather than downloading
  ECCC data directly is the road history, which only WRaMP has through
  2025–26.
- **Rosa.** The biggest real-world Rosas are institutions: the mines' joint
  venture and GNWT's fuel resupply. They get live status and dates directly
  from the road operators. WRaMP's value to them is the long-term record and
  the risk of a short season.
- **Sam.** Mark as a target persona. Today's observers are few and near
  Yellowknife. Reaching remote communities like Délįne will take community
  partners, such as guardian programs, not flyers alone.

## How to keep checking

- Rerun the log analysis from January to March, when Rosa and Sam would be
  active.
- Get the production site's access logs from the UTSC server, or add
  privacy-respecting analytics there.
- Have the TCP proxy pass client addresses through (proxy protocol), so
  visitors can be counted properly.
- Talk to one or two people per persona: a GNWT Infrastructure planner, the UBC
  lab, the road joint venture or GNWT's fuel resupply team, and the Winter Road
  Watch observers.
