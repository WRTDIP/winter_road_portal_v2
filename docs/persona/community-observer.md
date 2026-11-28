# Sam: community member and Winter Road Watch observer

> "We've watched the road open later for years. I want that on the record, and
> I want to know if it's safe to drive this week."

**Reality check (October 2026):** Sam is a target, not yet a user. Winter
Road Watch has about 50 in-season observations from a handful of people,
mostly near Yellowknife. [Evidence](validation.md#sam-community-member-and-observer)

| | |
|---|---|
| Role | Long-time resident, regular winter-road user and Winter Road Watch participant |
| Lives in | Délįne, on Great Bear Lake (Sahtú region, NWT) |
| Pronouns | they/them |
| Comfort with data | Uses a smartphone every day and can read a simple chart; not interested in statistics |
| Devices | Phone, with the text size turned up; sometimes a computer at the community office |
| Connectivity | Wi-Fi and cell service in the community, none along most of the road; careful with mobile data |
| Visits | Around trips in winter and when sending observations; rarely in summer |

## Who they are

Sam has driven the winter road out to Tulita and Norman Wells most winters for
decades, for groceries and fuel, medical appointments and family. They've seen
the road open later and conditions become harder to predict, and they joined
Winter Road Watch to put what they see on the record. They aren't looking for
statistics. They want the facts about their own road in plain words, and a
simple way to contribute.

## What they're trying to do

- Decide whether a trip is worth it and safe: is the road open, and what will
  the weather be?
- Record what they see on the road, with photos and conditions, so it counts.
- See what other people are reporting.
- Find out whether the record backs up what the community has noticed.

## Questions they bring

- "When does our road usually open? Is it open yet?"
- "What's the weather going to be like for the drive?"
- "How do I send in my photos of the overflow on the road?"
- "Is our season really getting shorter, the way people here say?"

## Features they use, and how

| Feature | How they use it |
|---|---|
| **Projects**, Winter Road Watch section | How they joined. It has the Getting Started steps and three downloadable PDFs: the Survey123 instructions, the data collection workflows and the QR codes. |
| The Winter Road Watch survey (in the Survey123 app, outside WRaMP) | Where they record observations on the road: date and time, a nickname or initials, location, which road, up to five photos and the weather. It works offline: they tap "Save in Outbox" and send once they're back in coverage. Saved favourite answers fill in the road and weather quickly. |
| **Observation** | Opens the Winter Road Watch web map with everyone's observations. It opens on ArcGIS, outside WRaMP, and the guides recommend a bigger screen. |
| **3-Day Weather Forecast** (tap the community) | Current conditions, the next three days, wind and precipitation, plus a link to Environment Canada's official forecast. |
| The road popup's plain-language parts | **Details** for opening and closing dates. **Open/Close Trend**, whose caption says "If the blue band gets narrower from left to right, the season is shrinking." The one-sentence takeaway in **Climate Trend Statistics**. On a phone the popup opens almost full screen. |
| **My Location** | Meant to find the nearest community or road and open it. |
| **About** | The contact email to use when the app gives them trouble. |

## A typical visit

1. They pick up a Winter Road Watch flyer, scan its QR code, install Survey123
   and scan the survey code. The same steps are on **Projects**.
2. On the way to Tulita they stop at a patch of overflow where there's no
   signal. They fill in the survey, take three photos and tap "Save in
   Outbox", then send it from the Wi-Fi at home.
3. On their phone they open WRaMP and go to **Observation** to see whether
   anyone else has reported that stretch. The map opens on ArcGIS and is hard
   to read on a small screen.
4. They open **Map** and tap **My Location**. The map zooms to Yellowknife and
   opens Yellowknife's climate window instead of Délįne's.
5. They pan to Délįne, tap the community, and scroll to **3-Day Weather
   Forecast** to plan the trip.
6. They tap the Délįne winter road to see how its season has changed. It says
   "No historical open/close data available for this road", although the
   database holds over 40 seasons for it.

## What gets in their way

- **Their own road's history doesn't show.** The map calls it "Déline Winter
  Road" and the database calls it "Délįne Winter Road". Because the names
  don't match, the lookup fails and over 40 seasons of records stay hidden.
  Sambaa K’e has the same problem, caused by a straight apostrophe where the
  database has a curly one (see [Verified gaps](README.md#verified-gaps)).
- **My Location doesn't find them.** It's fixed to a test position near
  Yellowknife.
- **Contributing and viewing both happen somewhere else.** Observations go in
  through Survey123 and are viewed on a separate ArcGIS map. WRaMP's own map
  doesn't show them, and the Observation page is just a picture that links
  out.
- **Heavy on a slow connection.** The map loads the full ArcGIS toolkit and
  basemap tiles, with more data for the satellite Hybrid view, on a data plan
  they pay for. Nothing is saved for offline use: the site's service worker
  has empty handlers.
- **Small print.** On phones, chart labels shrink to 10–11 px, even though Sam
  has turned their text size up.
- **No report back.** Nothing shows what the project learned from observers'
  reports, and the Blog that could do this is a placeholder. The online survey
  for road users is mentioned on Projects, but there's no link to it.

## What would serve them better

- Use community spellings exactly (Délįne, Sambaa K’e), and treat a failed
  name lookup as a bug rather than as "no data".
- Make **My Location** use the phone's real location.
- Show Winter Road Watch observations as a layer on WRaMP's own map.
- A light "my road" view for phones: whether the road is open, its usual
  dates, the three-day forecast, and one plain sentence about the trend.
- Tell observers what their reports showed. The Blog is ready for it.

## Evidence in the codebase

- Winter Road Watch content and guides: [Projects.jsx](../../ui/src/pages/Projects/Projects.jsx) and the `2026-01_Winter_Road_Watch_*.pdf` files in [ui/src/assets](../../ui/src/assets/).
- Observation page, a link to an external ArcGIS map: [Observation/index.jsx](../../ui/src/pages/Observation/index.jsx).
- Road popup opening almost full screen on phones, and charts scrolling sideways: `roadPopupWasOpen` and `ChartScroller` in [Map.jsx](../../ui/src/components/Map/Map.jsx).
- My Location test position: `DEBUG_GPS` in Map.jsx.
- Community names on the map: `citiesOfNorthwestTerritories` in [Data.js](../../ui/src/components/Map/Data.js).
- Service worker with empty handlers: [ui/public/service-worker.js](../../ui/public/service-worker.js).
