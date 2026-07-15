---
name: real-time-flight-data
description: Use this skill when the user wants current flight status, delays, departure or arrival details, live flight lookup, airport-to-airport flight options, or real-time aviation data. It combines routed MPP flight-data services and returns a concise, cross-checked result.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Gateway balance for paid runs.
metadata:
  author: SELAT community
  version: "1.0"
  rail: routed
  kind: multi
---

# real-time-flight-data

## When To Use

Use this skill for a current flight lookup or a route search. Prefer it when the
user provides a flight number, flight date, departure airport, arrival airport,
or asks about delays, departure, arrival, or live flight options.

## Workflow

1. Collect the available flight number/date or departure/arrival/date inputs.
2. Before a paid run, tell the user the live quoted total and ask for approval.
3. Run the skill with the supplied parameters after approval.
4. Use AviationStack and GoFlightLabs for flight-specific status data.
5. Use SerpApi for airport-to-airport route and schedule context.
6. Normalize timestamps to a clear timezone when the response provides one.
7. Report the current status, scheduled and estimated times, route, and delays.
8. If providers disagree, show the disagreement and identify the provider and
   timestamp instead of silently choosing one.

All steps are routed MPP calls through the SELAT Router. The live quote is the
source of truth; catalogue prices are estimates.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `flight_iata` | no | `GA102` | IATA airline and flight number |
| `flight_date` | no | `2026-07-15` | Flight date, `YYYY-MM-DD` |
| `departure_id` | no | `CGK` | Departure airport IATA code |
| `arrival_id` | no | `SIN` | Arrival airport IATA code |
| `outbound_date` | no | `2026-07-20` | Route-search date, `YYYY-MM-DD` |

Output: a concise flight-status or route summary with provider attribution,
timestamps, and any delay or data-availability notes.

## Gotchas

- Use uppercase IATA codes and ISO dates.
- A flight-specific request may not need route-search results; explain when the
  route step is not relevant.
- Do not retry a failed paid call without telling the user and obtaining approval.
- The full-run cap is `0.04` USDC; each step has its own cap.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe — probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe (no pay): `selat skill verify ./skills/real-time-flight-data`
- A successful run prints `status=200`.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint(s) this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
