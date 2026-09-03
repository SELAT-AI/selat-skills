---
name: flight-status
description: Use this skill when the user wants to check the live status of a commercial flight — "is flight GA880 on time?", "what time does SQ232 arrive?", "is my flight delayed?", "flight status", "track flight". Returns current status, departure/arrival times, gate/terminal, and delay info for one flight by airline + number. Pays over routed MPP (USDC on Base) via the SELAT Router; no API key.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.2, and a funded Circle Gateway balance (settles on whichever supported chain the balance sits on).
metadata:
  author: kiyeps
  version: "1.1"
  rail: routed
  kind: multi
---

# flight-status

## When To Use

Pick this skill when the user asks about the current or upcoming status of a
specific commercial flight — on-time/delayed/cancelled, departure or arrival
times, gate or terminal, or whether a flight has departed or landed. It needs an
airline IATA code + flight number (e.g. `GA880`, `SQ232`, `UA900`). It is NOT for
searching fare prices or booking — use a price/booking skill for that.

## Workflow

1. Install: `selat skill install flight-status`
2. Run: `selat skill run flight-status --flight_number GA880`
3. The CLI compiles each step into a `selat-pay` call and prints the result.

Steps (all routed MPP via the SELAT Router):

- **GoFlightLabs** `GET /flight-info-by-flight-number` — primary status lookup by flight number.
- **GoFlightLabs** `GET /flight-delay` — delay/on-time detail for the same flight (`delay=1&type=departure`).
- **AviationStack** `GET /v1/flights` — real-time fallback by IATA flight number.

**Fallback behavior (important):** the manifest is linear — it runs the steps in
order. If a GoFlightLabs step returns a 5xx, times out, fails to connect, or
returns an empty/unusable body (the provider has been observed returning 502),
do NOT stop — continue to the next step. AviationStack is the healthy fallback
and carries the status/delay capability when GoFlightLabs is down. Relay the
first usable result you get; prefer the most recent step that returned valid
flight data.

Tell the user: "This costs about $0.005 per call — proceed?" before any paid run,
then relay the status in plain language (on time / delayed X min / cancelled /
departed / landed) with the departure and arrival times. Keep raw JSON and wallet
addresses out of what you relay.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `flight_number` | yes | — | Airline IATA code + number, e.g. `GA880`. |

Output: flight status fields — current phase (scheduled/departed/landed),
departure + arrival times, terminal/gate, and delay minutes where available.

## Gotchas

- `flight_number` must be the IATA code + digits (e.g. `GA880`), not just a number
  or a full airline name. AviationStack maps it to `flight_iata`.
- There is no date parameter: the endpoints return current/live status for the
  flight. For a historical day use a different skill or the provider's
  date-scoped endpoints directly.
- Each step is a separate paid call (~$0.005). The manifest caps the whole run at
  $0.030; a normal 1–2 step lookup lands around $0.005–0.010.
- If the primary (GoFlightLabs) returns nothing useful, the agent should try the
  next step rather than stopping — see Fallback behavior above.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe — probing
> reads a free, chain-independent quote and never settles. A paid run resolves the
> settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe (no pay): `selat-pay GET "https://goflightlabs.mpp.tempo.xyz/flight-info-by-flight-number?flight_number=GA880" --chain base --probe-only`
- A successful run prints `status=200`.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint(s) this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay