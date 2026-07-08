# Endpoints - fifa-stadium-hotel-planner

Core workflow: find hotels near a FIFA World Cup 26 U.S. stadium, collect
ratings/reviews and coordinates, score travel friction, and create map-ready pins.

## Runnable manifest steps

| Step | Method | URL | Rail | Purpose | ~Price / cap |
|---|---|---|---|---|---|
| Hotel candidates | POST | `https://mpp.orthogonal.com/serper/maps` | routed MPP | Google Maps-style hotel listings with addresses, ratings, review counts, and lat/lng where available. | catalog shows about $0.006; cap $0.02 |
| Hotel place details | POST | `https://mpp.orthogonal.com/serper/places` | routed MPP | Local place search fallback for hotel listings and business metadata. | cap $0.02 |
| Selected hotel reviews | POST | `https://mpp.orthogonal.com/serper/reviews` | routed MPP | Google review snippets for a selected hotel/place query. | catalog service min about $0.002; cap $0.02 |
| Nearby lodging | GET | `https://googlemaps.mpp.tempo.xyz/maps/place/nearbysearch/json` | routed MPP | Places nearby search around stadium lat/lng, filtered to hotels/lodging. | cap $0.05 |
| Stadium-to-hotel distance | GET | `https://googlemaps.mpp.tempo.xyz/maps/distancematrix/json` | routed MPP | Walking or driving distance/time from stadium to selected hotel. | cap $0.05 |
| Map preview | GET | `https://googlemaps.mpp.tempo.xyz/maps/staticmap` | routed MPP | Static image with one stadium marker and one selected hotel marker. | cap $0.05 |

## Default run

```bash
selat skill run fifa-stadium-hotel-planner \
  --venue-query "MetLife Stadium East Rutherford NJ" \
  --hotel-query "hotels near MetLife Stadium East Rutherford NJ" \
  --hotel-address "Hyatt Place Secaucus Meadowlands, Secaucus, NJ" \
  --venue-lat 40.8135 \
  --venue-lng -74.0745 \
  --hotel-lat 40.7892 \
  --hotel-lng -74.0555
```

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
| Flight search and booking | StableTravel `/api/flights/search`, `/api/flights/price`, SerpApi `/search` for Google Flights | Find arrival/departure options and monitor prices. |
| Flight status and disruption | StableTravel FlightAware endpoints, AviationStack `/v1/flights`, FlightAPI tracking, GoFlightLabs delay endpoints | Warn users about airport delays, cancellations, or late arrivals. |
| Hotels and availability | StableTravel `/api/hotels/list/by-geocode`, `/api/hotels/search`, `/api/hotels/offer`; Apify Google Hotels/Booking/Agoda actors | Compare hotel options around venues and dates. |
| Activities and fan zones | StableTravel `/api/activities/search`, Serper Maps/Places, Google Places Text Search | Find nearby events, museums, bars, restaurants, and fan areas. |
| Restaurants and late-night food | Serper Maps/Places, Google Places Nearby/Text Search, Openmart local business search | Build match-day food plans around stadium and hotel. |
| Routes and commute windows | Google Distance Matrix, Google Routes, Mapbox Directions, Mapbox Matrix, Mapbox Isochrone | Score hotels by walking, driving, transit, and airport reach. |
| Weather and air quality | Google Weather, Google Air Quality, OpenWeather current/forecast/onecall | Decide clothing, hydration, and outdoor fan-zone comfort. |
| Neighborhood context | Serper Search/News, Exa, Parallel, Diffbot, Olostep | Research safety notices, closures, local guidance, and temporary event policies. |
| Social pulse | Scrape Creators Reddit/X/Instagram/YouTube, AIsa Twitter search | Monitor fan reports, queue conditions, transit issues, and venue chatter. |
| Airport transfers | StableTravel `/api/transfers/search`, Google Routes, Mapbox Directions | Estimate ground transport costs and timing. |

## Payment notes

- Serper runs through `https://mpp.orthogonal.com/serper`, not the provider host.
- Google Maps runs through `https://googlemaps.mpp.tempo.xyz`, not
  `https://maps.googleapis.com`.
- Use POST bodies for Serper; use query parameters for the Google Maps GET
  endpoints.
- Keep the first pass cheap. Search each venue, shortlist hotels, then spend on
  detailed review scraping or hotel-offer endpoints only for candidates that
  deserve it.
