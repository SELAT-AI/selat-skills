# Endpoints — real-time-flight-data

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 | GET | `https://aviationstack.mpp.tempo.xyz/v1/flights` | routed MPP | $0.00525 |
| 2 | GET | `https://goflightlabs.mpp.tempo.xyz/flights` | routed MPP | $0.00525 |
| 3 | GET | `https://serpapi.mpp.tempo.xyz/search` | routed MPP | $0.01575 |

- **Providers:** AviationStack, GoFlightLabs, and SerpApi.
- **Payment:** routed MPP via the SELAT Router. Quotes were probed on 2026-07-15;
  live prices may change.
- **Service URL rule:** these are payable gateway URLs. Do not replace them with
  the providers' descriptive API hosts.
- **Parameters:** flight-status steps use `flight_iata` and `flight_date`;
  SerpApi uses `departure_id`, `arrival_id`, and `outbound_date`.
