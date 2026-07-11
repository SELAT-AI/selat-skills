---
name: flight-route-status
description: >-
  Use this skill when the user wants real-time flight status or live flights
  between two airports — e.g. "flights from Jakarta to Beijing", "what's flying
  CGK to PEK right now?", "live flight status JFK→LHR", "track flights between
  airports". Multi-source MPP skill (FlightAPI track-by-route, AviationStack,
  GoFlightLabs), cheapest-first, routed through the SELAT Router.
license: Apache-2.0
compatibility: >-
  Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet
  (the runner pays on whichever chain holds your Gateway balance). Routed MPP
  skill — also requires a reachable SELAT Router (SELAT_ROUTER_URL).
metadata:
  author: equan-p
  version: "1.0"
  rail: routed
  kind: multi
---

# flight-route-status

## When To Use

Use when the user asks for **live / real-time flights on a route** between two
airports identified by **IATA codes** (or clear city→airport mappings you can
resolve first). Trigger on phrasings like "flights from X to Y", "live status
CGK→PEK", "what's in the air between JFK and LHR", or "track this route".

Prefer this skill over a one-off `selat run` when you want a **known multi-source
route status** recipe with caps. Do **not** use it for ticket booking, seat maps,
or multi-city fare shopping (different catalogue merchants).

## Workflow

1. Install: `selat skill install flight-route-status`
2. Resolve cities to IATA if needed (CGK = Jakarta Soekarno-Hatta, PEK = Beijing
   Capital, etc.).
3. Run cheapest-first multi-source status:

```bash
selat skill run flight-route-status \
  --depIata CGK \
  --arrIata PEK \
  --limit 5 \
  --max-amount 1.00
```

4. The CLI runs the three routed steps in order (each is its own capped MPP
   payment via the SELAT Router) and prints a ✓/✗ summary per step.

Steps (cheapest catalogue quotes first; live 402 is authoritative):

| # | Step | Endpoint | Catalogue ~price | Probe-verified routed quote |
|---|------|----------|------------------|-----------------------------|
| 1 | track-by-route — FlightAPI | `GET …/trackbyroute/{dep}/{arr}` | $0.002 | **$0.002100** (2026-07-11) |
| 2 | live flights — AviationStack | `GET …/v1/flights?dep_iata&arr_iata` | $0.005 | **$0.005250** (2026-07-11) |
| 3 | live flights — GoFlightLabs | `GET …/flights?departure&arrival` | $0.005 | **$0.005250** (2026-07-11) |

Full-run spend if all three succeed ≈ **$0.013** of USDC (plus tiny router
markup already reflected in the probe quotes). Per-step and full-run
`maxAmount` are **spending filters with headroom**, not the price.

If step 1 already answers the user, you may still let later steps run for
cross-checks, or re-run with a single-step fork later — the manifest is linear.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `depIata` | yes | `CGK` | Departure airport IATA (3 letters). |
| `arrIata` | yes | `PEK` | Arrival airport IATA (3 letters). |
| `limit` | no | `5` | Max rows for list-style providers (string integer). |

Outputs: provider-specific JSON for live flights on the route — typically flight
numbers, airline, schedule, status (scheduled / active / landed), and timestamps.
Merge / de-dupe client-side by flight number when comparing sources.

## Gotchas

- **Routed only** — `SELAT_ROUTER_URL` must be set and reachable. No direct rail.
- Wire **serviceUrl hosts** (`*.mpp.tempo.xyz`), never raw provider hosts like
  `api.aviationstack.com` (those have no MPP challenge).
- IATA codes are **case-sensitive at some gateways** — pass uppercase.
- Empty results usually mean no active flights on that route *right now*, not a
  payment failure — check response body before retrying spend.
- Full-run cap `$1.00` / per-step `$0.10` comfortably covers probe prices; do not
  lower caps below ~2× live quote or `verify` will fail over-cap checks when
  gateway markup moves.
- This skill does **not** book tickets or return fare calendars.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay`
> requires today — a probe reads a free, chain-independent quote and never
> settles. A real paid run resolves the settlement chain from your funded Circle
> Gateway balance, not the manifest.

Free 402 probes (no wallet spend):

```bash
selat-pay GET "https://flightapi.mpp.tempo.xyz/trackbyroute/CGK/PEK" \
  --chain base --probe-only

selat-pay GET "https://aviationstack.mpp.tempo.xyz/v1/flights?dep_iata=CGK&arr_iata=PEK&limit=5" \
  --chain base --probe-only

selat-pay GET "https://goflightlabs.mpp.tempo.xyz/flights?departure=CGK&arrival=PEK&limit=5" \
  --chain base --probe-only
```

Skill-level:

```bash
selat skill validate ./skills/flight-route-status
selat skill verify   ./skills/flight-route-status
```

A successful verify prints reachable steps with prices ≤ `maxAmount` and writes
`skills/flight-route-status/.selat/verify-receipt.json`.

## References

- `manifest.json` — payment recipe the CLI compiles.
- [`references/endpoints.md`](references/endpoints.md) — merchants, paths, probe prices.
- selat-pay — https://github.com/SELAT-AI/selat-pay
- Federated catalogue sources: FlightAPI, AviationStack, GoFlightLabs (MPP / Tempo).

_Third-party: "FlightAPI", "AviationStack", and "GoFlightLabs" are trademarks of
their respective owners; this skill calls their public MPP gateways and is not
affiliated with or endorsed by them._
