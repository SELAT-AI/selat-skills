# Endpoints — flight-status

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| flight info by number | GET | `https://goflightlabs.mpp.tempo.xyz/flight-info-by-flight-number?flight_number=${flight_number}` | routed (MPP via SELAT Router) | $0.005 |
| delay info | GET | `https://goflightlabs.mpp.tempo.xyz/flight-delay?flight_number=${flight_number}&delay=1&type=departure` | routed (MPP via SELAT Router) | $0.005 |
| real-time fallback | GET | `https://aviationstack.mpp.tempo.xyz/v1/flights?flight_iata=${flight_number}` | routed (MPP via SELAT Router) | $0.005 |

- **Provider:** GoFlightLabs (primary), AviationStack (fallback).
- **Payment:** routed via the SELAT Router (outbound leg: MPP on Tempo). Live
  probe confirms `mpp=yes`, `mode=routed-mpp`, `price=$0.005250 on eip155:8453`
  (gateway price runs a few percent above the catalogue $0.005).

## Param mapping

| Manifest `${param}` | Upstream field | Type | Required | Notes |
|---|---|---|---|---|
| `${flight_number}` | GoFlightLabs `flight_number` / AviationStack `flight_iata` | string | yes | IATA code + digits, e.g. `GA880`. |

The `/flight-delay` step pins `delay=1&type=departure` as fixed query params.
These are pinned from the live MPP schema for this endpoint (the provider
declares `delay` and `type` as required; it does not declare a `date` param).
There is deliberately no `date` parameter in this skill — the endpoints return
current/live status.

## Verification notes

- All three endpoints surface an MPP 402 challenge at the `serviceUrl` (the
  `.mpp.tempo.xyz` host), not the provider host — confirmed with
  `selat-pay ... --live-probe` (free, no settlement).
- GoFlightLabs `/flight-info-by-flight-number` and `/flight-delay` both probe
  `mode=routed-mpp`, `price=$0.005250`; AviationStack `/v1/flights` likewise.
- **Provider health (live, via the SELAT transactability index):**
  - GoFlightLabs `/flight-info-by-flight-number` — last paid `502`, 7d success `0.00`.
  - GoFlightLabs `/flight-delay` — last paid `502`, 7d success `0.00`.
  - AviationStack `/v1/flights` — last paid `200`, 7d success `1.00` (9 paid).
  GoFlightLabs is an external-provider outage (502, 0% delivery); AviationStack
  is the healthy fallback and carries the capability until GoFlightLabs recovers.