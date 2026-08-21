---
name: travel-brief
description: Use this skill when the user wants a quick pre-travel brief for a destination - e.g. "weather in Tokyo next week", "brief me for my trip to Bali", "get travel info and a QR for my maps link". Pulls a 7-day forecast, geolocation context for a reference IP, and generates a scannable QR code, paying per call over x402 via Circle Gateway. (Keep under 1024 chars.)
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.2, and a funded Circle Gateway balance (settles on whichever supported chain the balance sits on).
metadata:
  author: rifqi0347
  version: "1.0"
  rail: routed
  kind: single
---

# travel-brief

## When To Use

Use this skill when an agent is asked to prepare a short travel brief: what the
weather will look like at a destination, where a reference IP resolves to (useful
when checking VPN exit points or server locations relative to the trip), and a
scannable QR code carrying a maps or itinerary link. It is also a good fit when a
user says "brief me on <city>" or "trip prep for <place>".

## Workflow

1. Install: `selat skill install travel-brief`
2. Run: `selat skill run travel-brief --location "Jakarta" --ip 8.8.8.8 --data "https://maps.google.com/?q=Jakarta"`
3. The CLI compiles each step into a `selat-pay` call and prints the result.
4. Tell the user before running: all three steps together cost well under
   0.01 USDC at catalog prices - then relay results in plain language
   (forecast summary, city/ISP for the IP, and that the QR is ready), not raw JSON.

Steps:
- **7-day weather forecast** `POST /forecast` — routed via the SELAT Router (x402, Gateway-batched).
- **IP geolocation context** `POST /lookup/ip` — routed via the SELAT Router (x402, Gateway-batched).
- **Destination QR code** `POST /api/qr` — routed via the SELAT Router (x402, Gateway-batched).

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `location` | yes | — | City or place name for the weather forecast |
| `ip` | no | `8.8.8.8` | Reference IPv4 address for the geolocation step |
| `data` | no | `https://selat.ai` | Text or URL encoded into the QR code |

Output per step:

- Weather: `location.name`, `location.country`, plus a `days[]` array with
  `date`, `temp_max_c`, `temp_min_c`, `precipitation_mm`, `wind_max_kmh`,
  `weather_code`, `weather_description`, `sunrise`, `sunset`.
- IP geo: `country`, `region_code`, `city`, `postal_code`, `latitude`,
  `longitude`, `timezone`, `isp`, `org`, `asn`, `is_datacenter`.
- QR: `qr_base64` and `data_uri` (PNG image), `width`, `height`, `inputData`.

## Gotchas

- The QR endpoint's required body field is **`data`** (not `text` or `url`) -
  the router's schema check rejects other field names before payment.
- `maxAmount` 0.02 USDC covers all three steps with headroom; live quotes run a
  few percent above catalog list prices (0.001 + 0.001 + 0.003 listed).
- `${location}` values with spaces work as-is in the POST body; do NOT
  pre-URL-encode them.
- All three steps are POST - params belong in the body, never the query string.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe — probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe weather (no pay): `selat-pay POST "https://weather.payapi.market/forecast" --body '{"location":"London"}' --chain base --probe-only`
- Probe ip-geo (no pay): `selat-pay POST "https://ip-geo-api-production.up.railway.app/lookup/ip" --body '{"ip":"8.8.8.8"}' --chain base --probe-only`
- Probe qr (no pay): `selat-pay POST "https://qr-code.api.klymax402.com/api/qr" --body '{"data":"hello"}' --chain base --probe-only`
- A successful paid run prints `status=200` per step.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint(s) this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
