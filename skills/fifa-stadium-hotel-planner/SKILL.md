---
name: fifa-stadium-hotel-planner
description: "Use this skill when the user wants a FIFA World Cup 26 U.S. trip-planning workflow around stadiums and hotels: find hotels near U.S. host stadiums, collect hotel ratings/reviews/coordinates, compute stadium-to-hotel distance or walking time, create Google Maps pins or importable map files, and brainstorm extra paid endpoints for flights, weather, restaurants, activities, safety, and fan logistics. Pays routed MPP calls through the SELAT Router."
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
import into Google My Maps.

## When To Use

Use when the user asks for hotels near FIFA/World Cup stadiums, a map of hotel
options near host venues, venue-by-venue lodging research, or a broader FIFA trip
planner. Prefer this over a generic places search when the output should combine
stadium context, hotel quality signals, distance/travel time, and map-ready pins.

## Workflow

1. Install: `selat skill install fifa-stadium-hotel-planner`
2. Start with the venue list in `references/us-venues.md`.
3. For one venue, run:
   `selat skill run fifa-stadium-hotel-planner --venue-query "<stadium city state>" --hotel-query "hotels near <stadium city state>" --venue-lat <lat> --venue-lng <lng>`
4. For all U.S. venues, loop through the venue table and run the skill once per
   venue. Keep the first pass cheap: use Serper Maps/Places to collect candidates
   and coordinates, then run review and distance steps only for shortlisted hotels.
5. Rank hotels with a simple score:
   - distance or walking/transit time from stadium
   - rating and review count
   - recent review sentiment and recurring complaints
   - airport/transit convenience
   - price/availability when a hotel-offers endpoint is used
6. Produce three outputs:
   - a venue-by-venue hotel shortlist table
   - a map pin file (`CSV` or `GeoJSON`) with stadium and hotel coordinates
   - a Google Maps link or Static Maps preview for each stadium/hotel cluster

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
| `venue_query` | yes | `MetLife Stadium East Rutherford NJ` | Stadium plus city/state for search labels. |
| `hotel_query` | no | `hotels near MetLife Stadium East Rutherford NJ` | Query for nearby hotel candidates. |
| `hotel_address` | no | `Hyatt Place Secaucus Meadowlands, Secaucus, NJ` | Selected hotel for reviews and route scoring. |
| `venue_lat` / `venue_lng` | no | `40.8135` / `-74.0745` | Stadium coordinates. |
| `hotel_lat` / `hotel_lng` | no | `40.7892` / `-74.0555` | Selected hotel coordinates. |
| `radius_meters` | no | `5000` | Nearby-search radius around the stadium. |
| `map_zoom` | no | `13` | Static map zoom level. |

Output: paid-call JSON from Serper and Google Maps, plus an agent-synthesized
hotel shortlist, ranked recommendation, and map-ready CSV/GeoJSON pins.

## Endpoint Brainstorm

Read `references/endpoints.md` when the user asks what else could power a FIFA
trip planner. The highest-value additions are:

- flights and airport disruption: StableTravel, FlightAware, AviationStack,
  FlightAPI, GoFlightLabs, SerpApi Google Flights
- hotels and inventory: StableTravel hotel list/search, Google Hotels actors,
  Booking/Agoda actors
- local discovery: Google Maps Places, Serper Maps/Places, Openmart, Mapbox
- reviews: Serper Reviews, Google Maps reviews actors, Booking/Agoda/Tripadvisor
  review actors
- weather and air quality: Google Weather, OpenWeather, Google Air Quality
- routes and commute friction: Google Distance Matrix/Routes, Mapbox Directions,
  Mapbox Isochrone
- restaurants, bars, fan zones, activities: Serper Maps/Places, StableTravel
  activities, Google Places
- social/event pulse: Scrape Creators and web search endpoints for fan sentiment,
  queues, closures, or safety chatter

## Gotchas

- The FIFA venue names often differ from the common stadium names. Use
  `references/us-venues.md` to pair official FIFA labels with common names.
- Some match dates may already be in the past after July 8, 2026. State whether
  the report covers all U.S. host venues or only remaining matches.
- Do not buy or run Apify prepaid-token actors without explicit user approval.
  List them as optional deep scrapers first, then confirm spend.
- Serper Maps/Places is usually the cheap first pass. Use hotel-specific review
  actors only after choosing hotels worth deeper review extraction.
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
  `selat skill verify ./skills/fifa-stadium-hotel-planner --venue-query "MetLife Stadium East Rutherford NJ" --hotel-query "hotels near MetLife Stadium East Rutherford NJ" --venue-lat 40.8135 --venue-lng -74.0745`
- Single-step probe (no pay):
  `selat-pay POST "https://mpp.orthogonal.com/serper/maps" --body '{"q":"hotels near MetLife Stadium East Rutherford NJ","gl":"us","hl":"en","num":20}' --chain base --probe-only`

## References

- `manifest.json` - the machine-readable payment recipe this skill runs.
- [`references/us-venues.md`](references/us-venues.md) - U.S. FIFA World Cup 26 venues and coordinates.
- [`references/endpoints.md`](references/endpoints.md) - core endpoints plus trip-planner brainstorm.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) - authoring standard.
- selat-pay - https://github.com/SELAT-AI/selat-pay
