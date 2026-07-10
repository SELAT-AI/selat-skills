# Endpoints - fifa-stadium-hotel-planner

Core workflow: use routed x402 for FIFA World Cup 26 trip context, then routed
MPP for hotels near a U.S. stadium, ratings/reviews, travel friction, and
map-ready pins.

## Runnable manifest steps

| Step | Method | URL | Rail | Purpose | ~Price / cap |
|---|---|---|---|---|---|
| World Cup trip context | GET | `https://fanfare.run/v1/world-cup-bundle` | routed x402 | FIFA World Cup 2026 schedule, 16-host-city venue intel, transit tips, airport IATA, weather, Duffel flights, and Duffel hotels. | catalog price $0.25; cap $0.30 |
| Hotel candidates | GET | `https://googlemaps.mpp.tempo.xyz/maps/place/textsearch/json` | routed MPP | Places Text Search for `hotel_query`: hotel listings with name, lat/lng geometry, rating, user_ratings_total, and `place_id`. | live price $0.0336 (probe-verified 2026-07-10); cap $0.11 |
| Hotel place details | GET | `https://googlemaps.mpp.tempo.xyz/maps/place/details/json` | routed MPP | Place Details for the selected hotel by `place_id` (from the text-search step). | live price $0.01785 (probe-verified 2026-07-10); cap $0.06 |
| Selected hotel reviews | GET | `https://googlemaps.mpp.tempo.xyz/maps/place/details/json?fields=name,rating,reviews` | routed MPP | Google reviews for the selected `place_id`; Place Details returns at most the 5 most-relevant reviews. | live price $0.01785 (probe-verified 2026-07-10); cap $0.06 |
| Nearby lodging | GET | `https://googlemaps.mpp.tempo.xyz/maps/place/nearbysearch/json` | routed MPP | Places nearby search around stadium lat/lng, filtered to hotels/lodging. | cap $0.05 |
| Stadium-to-hotel distance | GET | `https://googlemaps.mpp.tempo.xyz/maps/distancematrix/json` | routed MPP | Walking or driving distance/time from stadium to selected hotel. | cap $0.05 |
| Map preview | GET | `https://googlemaps.mpp.tempo.xyz/maps/staticmap` | routed MPP | Static image with one stadium marker and one selected hotel marker. | cap $0.05 |

## Default run

```bash
selat skill run fifa-stadium-hotel-planner \
  --match-date 2026-07-19 \
  --origin-iata SFO \
  --check-in 2026-07-18 \
  --check-out 2026-07-20 \
  --venue-query "MetLife Stadium East Rutherford NJ" \
  --hotel-query "hotels near MetLife Stadium East Rutherford NJ" \
  --hotel-address "Hyatt Place Secaucus Meadowlands, Secaucus, NJ" \
  --venue-lat 40.8135 \
  --venue-lng -74.0745 \
  --hotel-lat 40.7892 \
  --hotel-lng -74.0555
```

The place-details and review steps key on `place_id`. Run the text-search step
first, shortlist a hotel, then pass its `place_id` with `--place-id`.

## Rail showcase

This skill intentionally mixes routed payment protocols:

- **Routed x402**: Fanfare `GET /v1/world-cup-bundle`, quoted at `$0.25` in the
  Agentic/Circle catalog and routed through SELAT as an x402 call.
- **Routed MPP**: the Google Maps steps are paid through the SELAT Router, with
  MPP settlement handled by the Tempo gateway service URL
  (`https://googlemaps.mpp.tempo.xyz`).

Use this skill when you want to demo SELAT choosing the right payment rail per
capability: first-party sports/trip intelligence through routed x402, then routed
local-search/maps providers for the granular itinerary work.

## Optional Apify deep scrapers

Apify actors use SELAT's prepaid-token flow, not ordinary per-call `selat-pay`
against the actor URL. Do not run these without confirming spend with the user.

| Actor | Use case | Notes |
|---|---|---|
| `tri_angle/hotel-review-aggregator` | Multi-source hotel reviews | Takes Google Maps place IDs/URLs and aggregates hotel reviews from Tripadvisor, Yelp, Google Maps, Expedia, Hotels.com, Booking.com, and Airbnb. |
| `voyager/booking-scraper` | Booking.com hotel discovery | Finds Booking.com hotel listings, prices, ratings, addresses, review counts, and URLs. |
| `voyager/booking-reviews-scraper` | Booking.com reviews | Uses hotel URLs; extracts review text, ratings, stay length, liked/disliked parts, room info, and stay date. |
| `knagymate/fast-agoda-reviews-scraper` | Agoda reviews | Uses Agoda hotel URLs; extracts review text, ratings, reviewer info, stay length, room info, and stay date. |
| `compass/google-maps-reviews-scraper` | Google Maps reviews | Uses place URLs; extracts review text, dates, owner responses, review URLs, and reviewer details. |
| `blueorion/fast-google-maps-reviews-scraper` | Fast Google Maps reviews | Uses URLs, FIDs, CIDs, or Place IDs; good for large review pulls after the cheap shortlist. |
| `api-ninja/tripadvisor-reviews-scraper` | Tripadvisor reviews | Supports customizable search queries, filters, sorting, ratings, dates, and traveler types. |
| `zerobreak/google-hotels-scraper` | Google Hotels inventory | Collects hotel listings, prices, ratings, amenities, and vendor booking sources by destination/date. |
| `johnvc/google-hotels-search-scraper` | Google Hotels search | Hotel data, prices, ratings, amenities, images, localization, and pagination. |

## Other endpoint ideas for a FIFA trip planner

| Need | Endpoints to consider | Use |
|---|---|---|
| World Cup schedule + host-city trip bundle | Fanfare routed x402 `/v1/world-cup-bundle` | Pull schedule, venue intel, transit tips, airport IATA, weather, flights, and hotels in one routed x402 call. |
| Flight search and booking | StableTravel `/api/flights/search`, `/api/flights/price`, SerpApi `/search` for Google Flights | Find arrival/departure options and monitor prices. |
| Flight status and disruption | StableTravel FlightAware endpoints, AviationStack `/v1/flights`, FlightAPI tracking, GoFlightLabs delay endpoints | Warn users about airport delays, cancellations, or late arrivals. |
| Hotels and availability | StableTravel `/api/hotels/list/by-geocode`, `/api/hotels/search`, `/api/hotels/offer`; Apify Google Hotels/Booking/Agoda actors | Compare hotel options around venues and dates. |
| Activities and fan zones | StableTravel `/api/activities/search`, Google Places Text Search | Find nearby events, museums, bars, restaurants, and fan areas. |
| Restaurants and late-night food | Google Places Nearby/Text Search, Openmart local business search | Build match-day food plans around stadium and hotel. |
| Routes and commute windows | Google Distance Matrix, Google Routes, Mapbox Directions, Mapbox Matrix, Mapbox Isochrone | Score hotels by walking, driving, transit, and airport reach. |
| Weather and air quality | Google Weather, Google Air Quality, OpenWeather current/forecast/onecall | Decide clothing, hydration, and outdoor fan-zone comfort. |
| Neighborhood context | Exa search (`exa.mpp.tempo.xyz`), Parallel, Diffbot, Olostep | Research safety notices, closures, local guidance, and temporary event policies. |
| Social pulse | Scrape Creators Reddit/X/Instagram/YouTube, AIsa Twitter search | Monitor fan reports, queue conditions, transit issues, and venue chatter. |
| Airport transfers | StableTravel `/api/transfers/search`, Google Routes, Mapbox Directions | Estimate ground transport costs and timing. |

## Payment notes

- Fanfare is routed x402 at `https://fanfare.run`, not routed MPP.
- Google Maps runs through `https://googlemaps.mpp.tempo.xyz` (Google Maps via
  Tempo, ROUTED via SELAT Router), not `https://maps.googleapis.com`.
- All Google Maps steps are GET calls with query parameters.
- Keep the first pass cheap. Search each venue, shortlist hotels, then spend on
  detailed review scraping or hotel-offer endpoints only for candidates that
  deserve it.
