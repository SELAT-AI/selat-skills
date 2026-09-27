---
name: city-weather
description: Use this skill when the user asks about live weather — e.g. "what's the weather in <city>", "is it raining in <city> today", "3-day forecast for <city>", "how cold will it get in <city>". Runs weather.payapi.market's x402 endpoints (current conditions + forecast) paid per call over the SELAT Router (USDC). Returns temperature, feels-like, humidity, precipitation, wind, and a human-readable description.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Gateway balance (settles on whichever supported chain the balance sits on). The routed steps need a reachable SELAT Router (SELAT_ROUTER_URL); `selat skill verify` (without --pay) is free and needs no funded wallet.
metadata:
  author: hermes-agent-user
  version: "1.0"
  rail: routed
  kind: multi
---

# city-weather

Live weather for any named city via **weather.payapi.market's x402 endpoints**,
**routed through the SELAT Router**. Two cheap steps (~$0.001 each): current
conditions (`POST /current`) and a multi-day forecast (`POST /forecast`). The agent
reads both responses and gives the user a short, practical weather answer — no API
key, no signup.

## When To Use

Use when the user wants **live or near-future weather** — "what's the weather in X",
"will it rain in X this week", "should I bring a jacket in X", "3-day forecast for
X". Prefer this over answering from memory whenever the question depends on current
atmospheric conditions.

Do **not** use it for: historical climate trivia (the model can answer), air quality
(see Gotchas), or locations that are not place names without coordinates (the API
accepts a city name; latitude/longitude overrides exist but are not wired — see
references).

## Rails

Two paid steps, native x402, both **routed** through the SELAT Router (`rail: routed`):

- **routed x402** — `POST /current` resolves as `mode=routed-x402`, settled
  Gateway-batched in USDC. Live quote ≈ $0.00105.
- **routed x402** — `POST /forecast` resolves identically. Live quote ≈ $0.00105.

Full-run cost ≈ **$0.0021**, capped at `maxAmount: $0.01`.

## Workflow

1. Install: `selat skill install city-weather`
2. **Tell the user the cost before spending** — "weather for <city> costs about
   $0.002 from your wallet (current + forecast) — go ahead?" — and proceed only on a yes.
3. Run: `selat skill run city-weather --location "<city>"`
4. The CLI compiles each step into one `selat-pay` call and prints the JSON results.
5. **Synthesize, don't dump.** Combine both responses into one short human answer:
   conditions right now, then the outlook for the next few days. Keep raw JSON and
   endpoint URLs out of what you show the user.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `location` | yes | `Jakarta` | City or place name, e.g. `London`, `New York`. Sent as `location` to both endpoints. |

Output: two JSON objects — current conditions (`temperature_c`, `feels_like_c`,
`humidity_pct`, `precipitation_mm`, `wind_speed_kmh`, `weather_description`,
`timezone`) and a day-by-day forecast array.

## Gotchas

- **The gateway settles the payment before the upstream validates the body**, so a
  malformed request still costs. The schemas here are pinned from the upstream's own
  OpenAPI (`GET https://weather.payapi.market/openapi.json`) — send exactly these shapes.
- **`days` is an integer — do not wire it through `${param}`.** The skill runner
  substitutes params as **strings only** (no type coercion), so `days: "${days}"`
  would send `"3"` and 422. The manifest hard-codes `days: 3`; for a different
  horizon, make a hand-built `selat-pay` call with an integer `days` (1–16).
- **`location` is the only required field** on both endpoints; latitude/longitude
  overrides exist on `/current` but are omitted here to keep the skill simple.
- **Air quality and historical data live on the same gateway** (`/air-quality`,
  `/historical`) but are not wired as steps; hand-build a `selat-pay` call for those.
- The upstream may serve cached data (`cached: true` in the response) — for
  near-realtime questions, prefer a fresh call and note the timestamp in `current.time`.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe — probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/city-weather`
- Live probe (no pay): confirms rail + price without settling:
  ```bash
  selat-pay POST "https://weather.payapi.market/current" \
    --body '{"location":"Jakarta"}' \
    --chain base --probe-only
  ```
  A served endpoint prints `detected x402=yes … mode=routed-x402 price=$0.001050 on eip155:8453`.
- Paid run prints `status=200` and both weather JSON objects.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — full request schemas for the wired endpoints and their unrouted siblings.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
