---
name: travel-brief
description: Use this skill when the user wants a quick pre-travel brief for a destination - e.g. "brief me for my trip to Bali", "what's the weather in Tokyo next week and make me a QR for the maps link", "trip prep for Lisbon". Pulls a 7-day forecast and generates a scannable QR code linking to the destination, paying per call over x402 via Circle Gateway.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Gateway balance. Both steps settle through the SELAT Router (routed x402, Gateway-batched) on whichever supported chain the Gateway balance sits on.
metadata:
  author: iqiwf
  version: "1.1"
  rail: routed
  kind: multi
---

# travel-brief

## When To Use

Use this skill when an agent is asked to prepare a short pre-travel brief for a
trip: what the weather at the destination will look like over the coming week
(the typical trip window), and a scannable QR code carrying the destination's
maps or itinerary link — handy to keep on the phone or print on an itinerary.
It is a good fit when a user says "brief me on <city>", "trip prep for
<place>", or "weather in <city> next week and a QR for my maps link".

This is a bundle, not a general-purpose tool. The QR step exists only as part
of the travel brief — never trigger this skill for standalone QR generation
(eval `notrigger-2`), and never for IP or network lookups (out of scope).

Differs from `city-weather`: that skill answers "what are conditions right now
/ the next 3 days" for any city; this skill is trip prep — a 7-day outlook for
the trip window plus the destination QR, produced in one run.

## Workflow

1. Install: `selat skill install travel-brief`
2. Run: `selat skill run travel-brief --location "Jakarta" --data "https://maps.google.com/?q=Jakarta"`
3. The CLI compiles each step into a `selat-pay` call and prints the result.
4. Tell the user before running: both steps together cost well under
   0.01 USDC at catalog prices - then relay results in plain language
   (forecast summary, and that the QR is ready), not raw JSON.

Steps:
- **7-day weather forecast** `POST /forecast` — routed via the SELAT Router (x402, Gateway-batched).
- **Destination QR code** `POST /api/qr` — routed via the SELAT Router (x402, Gateway-batched).

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `location` | yes | `London` | City or place name for the weather forecast. Always pass the user's destination explicitly; never let the default silently brief another city. |
| `data` | no | `https://selat.ai` | URL encoded into the QR code — typically the destination's maps or itinerary link. |

Output per step:

- Weather: `location.name`, `location.country`, plus a `days[]` array with
  `date`, `temp_max_c`, `temp_min_c`, `precipitation_mm`, `wind_max_kmh`,
  `weather_code`, `weather_description`, `sunrise`, `sunset`.
- QR: `qr_base64` and `data_uri` (PNG image), `width`, `height`, `inputData`.

## Gotchas

- The QR endpoint's required body field is **`data`** (not `text` or `url`) -
  the router's schema check rejects other field names before payment.
- `maxAmount` 0.01 USDC covers both steps with headroom; live quotes run a
  few percent above catalog list prices (0.001 + 0.003 listed).
- `${location}` values with spaces work as-is in the POST body; do NOT
  pre-URL-encode them.
- Both steps are POST - params belong in the body, never the query string.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe — probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe weather (no pay): `selat-pay POST "https://weather.payapi.market/forecast" --body '{"location":"London"}' --chain base --probe-only`
- Probe qr (no pay): `selat-pay POST "https://qr-code.api.klymax402.com/api/qr" --body '{"data":"hello"}' --chain base --probe-only`
- A successful paid run prints `status=200` per step.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint(s) this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
