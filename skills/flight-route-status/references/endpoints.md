# flight-route-status — endpoints

Every endpoint below was probe-verified live-payable over MPP via the SELAT
Router (`selat-pay --probe-only`, verified **2026-07-11**). Caps in the manifest
are spending filters with headroom, not the live price.

| # | Merchant | serviceUrl host | Method + path | Catalogue | Probe (routed) |
|---|----------|-----------------|---------------|-----------|----------------|
| 1 | FlightAPI | `flightapi.mpp.tempo.xyz` | `GET /trackbyroute/{depIata}/{arrIata}` | $0.002 | **$0.002100** on eip155:8453 |
| 2 | AviationStack | `aviationstack.mpp.tempo.xyz` | `GET /v1/flights?dep_iata&arr_iata&limit` | $0.005 | **$0.005250** on eip155:8453 |
| 3 | GoFlightLabs | `goflightlabs.mpp.tempo.xyz` | `GET /flights?departure&arrival&limit` | $0.005 | **$0.005250** on eip155:8453 |

## serviceUrl rule

Manifest URLs use the catalogue **`serviceUrl`**, never the descriptive provider
`url`:

| Merchant | Provider `url` (docs only) | Payable `serviceUrl` |
|----------|----------------------------|----------------------|
| FlightAPI | `https://api.flightapi.io` | `https://flightapi.mpp.tempo.xyz` |
| AviationStack | `https://api.aviationstack.com` | `https://aviationstack.mpp.tempo.xyz` |
| GoFlightLabs | `https://goflightlabs.com` | `https://goflightlabs.mpp.tempo.xyz` |

## Probe commands (free)

```bash
selat-pay GET "https://flightapi.mpp.tempo.xyz/trackbyroute/CGK/PEK" \
  --chain base --probe-only

selat-pay GET "https://aviationstack.mpp.tempo.xyz/v1/flights?dep_iata=CGK&arr_iata=PEK&limit=5" \
  --chain base --probe-only

selat-pay GET "https://goflightlabs.mpp.tempo.xyz/flights?departure=CGK&arrival=PEK&limit=5" \
  --chain base --probe-only
```

Expected probe shape: `detected mpp=yes`, `mode=routed-mpp`, price as above.

## Notes

- Order is **cheapest-first** so a budget-aware agent can stop after step 1 when
  enough signal is present (procedure in `SKILL.md`; the CLI still runs steps
  linearly unless the agent only invokes a subset via a future fork).
- All three steps use the **routed** rail (Tempo MPP → SELAT Router → Gateway-
  batched settlement from the agent wallet).
