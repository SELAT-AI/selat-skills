---
name: fifa-stadium-hotel-planner
description: "Use this skill when the user wants a FIFA World Cup 26 U.S. trip-planning workflow around stadiums and hotels: get match/trip context from routed x402 Fanfare, find hotels near U.S. host stadiums with routed MPP maps/search, collect ratings/reviews/coordinates, compute stadium-to-hotel distance or walking time, create Google Maps pins or importable map files, and brainstorm extra paid endpoints for flights, weather, restaurants, activities, safety, and fan logistics. Showcases SELAT routed x402 plus routed MPP execution."
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a reachable SELAT Router. Live paid runs need a funded Circle Gateway balance; `selat skill verify` without `--pay` is free.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: multi
---

# fifa-stadium-hotel-planner

Plan hotel intelligence around FIFA World Cup 26 U.S. venues. The skill finds
nearby hotels, pulls ratings and review snippets, computes travel friction from
stadium to hotel, and creates Google Map pin outputs the user can inspect or
import into Google My Maps. It intentionally mixes routed payment protocols:
**routed x402** for the Fanfare World Cup trip bundle, plus **routed MPP** for
Google Maps hotel search, place details, reviews, routes, and map previews.

## When To Use

Use when the user asks for hotels near FIFA/World Cup stadiums, a map of hotel
options near host venues, venue-by-venue lodging research, or a broader FIFA trip
planner. Prefer this over a generic places search when the output should combine
stadium context, hotel quality signals, distance/travel time, and map-ready pins.

## Workflow

1. Install: `selat skill install fifa-stadium-hotel-planner`
2. Start with the venue list in `references/us-venues.md`.
3. For one venue, run:
   `selat skill run fifa-stadium-hotel-planner --match-date <YYYY-MM-DD> --origin-iata <IATA> --check-in <YYYY-MM-DD> --check-out <YYYY-MM-DD> --venue-query "<stadium city state>" --hotel-query "hotels near <stadium city state>" --venue-lat <lat> --venue-lng <lng>`
4. For all U.S. venues, loop through the venue table and run the skill once per
   venue. Keep the first pass cheap: use Google Maps Places Text Search to collect
   candidates with coordinates, ratings, and `place_id`s, then run the
   place-details, review, and distance steps only for shortlisted hotels. The
   place-details and review steps key on `place_id` — take it from the text-search
   results and pass it as `--place-id`.
5. Start the synthesis with the Fanfare routed x402 result: match schedule,
   host-city venue intel, transit tips, airport IATA, weather, flights, and hotel
   offer context when a single match/date is selected.
6. Rank hotels with a simple score:
   - distance or walking/transit time from stadium
   - rating and review count
   - recent review sentiment and recurring complaints
   - airport/transit convenience
   - price/availability when a hotel-offers endpoint is used
7. Produce three outputs:
   - a venue-by-venue hotel shortlist table
   - a map pin file (`CSV` or `GeoJSON`) with stadium and hotel coordinates
   - a Google Maps link or Static Maps preview for each stadium/hotel cluster

## Rails

- **Routed x402**: Fanfare `GET /v1/world-cup-bundle` at `https://fanfare.run`
  returns World Cup 2026 match schedule, host-city venue intel, transit tips,
  weather, flights, and hotels. This is the showcase rail for routed x402.
- **Routed MPP**: Google Maps runs through `https://googlemaps.mpp.tempo.xyz`
  (Google Maps via Tempo, ROUTED via SELAT Router). These calls cover hotel
  discovery, place details, reviews, distance scoring, and map previews through
  the SELAT Router.

## Map Output

When the user asks to pinpoint results on Google Maps, output an importable CSV
for Google My Maps:

```csv
name,type,venue,latitude,longitude,address,rating,review_count,source_url,notes
MetLife Stadium,stadium,New York New Jersey Stadium,40.8135,-74.0745,East Rutherford NJ,,,https://www.fifa.com/,
Example Hotel,hotel,New York New Jersey Stadium,40.7892,-74.0555,"Secaucus NJ",4.2,1200,https://maps.google.com/,"5 km from venue; verify match-night transit"
```

Also include a per-cluster Google Maps search link:

```text
https://www.google.com/maps/search/hotels+near+MetLife+Stadium+East+Rutherford+NJ
```

Use the Static Maps step for a quick preview, but use CSV/GeoJSON for editable
maps with many pins. Google Maps URLs are awkward for many labeled pins; Google
My Maps import is the cleaner path.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `match_date` | no | `2026-07-19` | FIFA match date for Fanfare World Cup context. |
| `team` | no | empty | Optional FIFA team filter for Fanfare. |
| `origin_iata` | no | `SFO` | Origin airport for flight enrichment. |
| `check_in` / `check_out` | no | `2026-07-18` / `2026-07-20` | Stay dates for Fanfare trip/hotel enrichment. |
| `passengers` / `guests` | no | `1` / `1` | Counts for Fanfare trip enrichment. |
| `venue_query` | yes | `MetLife Stadium East Rutherford NJ` | Stadium plus city/state for search labels. |
| `hotel_query` | no | `hotels near MetLife Stadium East Rutherford NJ` | Query for nearby hotel candidates. |
| `hotel_address` | no | `Hyatt Place Secaucus Meadowlands, Secaucus, NJ` | Selected hotel for labels and route scoring. |
| `place_id` | no | empty | Google Maps `place_id` for the selected hotel, from the text-search results; drives the place-details and review steps. |
| `venue_lat` / `venue_lng` | no | `40.8135` / `-74.0745` | Stadium coordinates. |
| `hotel_lat` / `hotel_lng` | no | `40.7892` / `-74.0555` | Selected hotel coordinates. |
| `radius_meters` | no | `5000` | Nearby-search radius around the stadium. |
| `map_zoom` | no | `13` | Static map zoom level. |

Output: paid-call JSON from Fanfare and Google Maps, plus an
agent-synthesized trip brief, hotel shortlist, ranked recommendation, and
map-ready CSV/GeoJSON pins.

## Endpoint Brainstorm

Read `references/endpoints.md` when the user asks what else could power a FIFA
trip planner. The highest-value additions are:

- World Cup trip bundle: Fanfare routed x402 `v1/world-cup-bundle`
- flights and airport disruption: StableTravel, FlightAware, AviationStack,
  FlightAPI, GoFlightLabs, SerpApi Google Flights
- hotels and inventory: StableTravel hotel list/search, Google Hotels actors,
  Booking/Agoda actors
- local discovery: Google Maps Places, Openmart, Mapbox
- reviews: Google Place Details reviews, Google Maps reviews actors,
  Booking/Agoda/Tripadvisor review actors
- weather and air quality: Google Weather, OpenWeather, Google Air Quality
- routes and commute friction: Google Distance Matrix/Routes, Mapbox Directions,
  Mapbox Isochrone
- restaurants, bars, fan zones, activities: Google Places, StableTravel
  activities
- social/event pulse: Scrape Creators and web search endpoints for fan sentiment,
  queues, closures, or safety chatter

## Gotchas

- The FIFA venue names often differ from the common stadium names. Use
  `references/us-venues.md` to pair official FIFA labels with common names.
- Some match dates may already be in the past after July 8, 2026. State whether
  the report covers all U.S. host venues or only remaining matches.
- Fanfare enriches most deeply when the filters return exactly one match. Use
  `match_date`, `team`, or a specific match ID when the user wants flights/hotels
  from that routed x402 bundle.
- Do not buy or run Apify prepaid-token actors without explicit user approval.
  List them as optional deep scrapers first, then confirm spend.
- Google Maps Places Text Search is usually the first pass. The place-details
  review step returns at most the 5 most-relevant Google reviews; use
  hotel-specific review actors only after choosing hotels worth deeper review
  extraction.
- Static map images are previews, not editable trip plans. Give the user CSV or
  GeoJSON when they need a real map with many pins.
- The live 402 quote is the source of truth. If verify says an endpoint is over
  cap or not serving a challenge, omit it from the paid run and use the endpoint
  brainstorm to choose a substitute.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe. Probing
> reads a free, chain-independent quote and never settles. Paid runs resolve the
> settlement chain from the funded Circle Gateway balance.

- Static: `selat skill validate ./skills/fifa-stadium-hotel-planner`
- Live gate (free):
  `selat skill verify ./skills/fifa-stadium-hotel-planner --match-date 2026-07-19 --origin-iata SFO --check-in 2026-07-18 --check-out 2026-07-20 --venue-query "MetLife Stadium East Rutherford NJ" --hotel-query "hotels near MetLife Stadium East Rutherford NJ" --venue-lat 40.8135 --venue-lng -74.0745`
- Single-step probe (no pay):
  `selat-pay GET "https://googlemaps.mpp.tempo.xyz/maps/place/textsearch/json?query=hotels%20near%20MetLife%20Stadium%20East%20Rutherford%20NJ" --chain base --probe-only`

## References

- `manifest.json` - the machine-readable payment recipe this skill runs.
- [`references/us-venues.md`](references/us-venues.md) - U.S. FIFA World Cup 26 venues and coordinates.
- [`references/endpoints.md`](references/endpoints.md) - core endpoints plus trip-planner brainstorm.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) - authoring standard.
- selat-pay - https://github.com/SELAT-AI/selat-pay
