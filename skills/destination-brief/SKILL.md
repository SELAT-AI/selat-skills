---
name: destination-brief
description: Use this skill when the user wants a grounded pre-travel brief on a place — e.g. "brief me on Lisbon", "I'm going to Kyoto next month, what should I know", "plan a trip to Banff", "what's worth seeing in Porto", "research this destination for me". Fuses Tripadvisor's location index (POIs, ratings, addresses), a live web-context search, and a Google SERP into one cited brief. Three routed calls over the SELAT Router (USDC on Base), ~$0.04 total, no API keys.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, a reachable SELAT Router (SELAT_ROUTER_URL), and a funded Circle Gateway balance. `selat skill verify` without --pay is free and needs no funded wallet.
metadata:
  author: vickman787
  version: "1.0"
  rail: routed
  kind: multi
---

# destination-brief

Turn a place name into a trip-planning brief, grounded in three independent
sources paid per call. No API keys, no accounts — each step settles a few tenths
of a cent in USDC through the SELAT Router.

## When To Use

Use when someone names a destination and wants to know what's there and what to
expect before going: attractions worth the time, where to stay, when to go, how
to get around. Also good as the research leg of a longer itinerary-planning task.

**Don't** use it for live booking, flight or hotel prices, or availability —
none of these three endpoints price or reserve anything. For flights or lodging
availability, discover a dedicated endpoint with `selat search "flight prices"`.

## Workflow

1. Install: `selat skill install destination-brief`
2. Run: `selat skill run destination-brief --destination "Lisbon, Portugal"`
3. Optionally narrow the web leg:
   `--research_query "day trips and where to eat"`

The three steps are ordered cheapest-first and are independent — if one fails,
the other two still return useful material, so synthesise from whatever came
back rather than aborting.

| # | Step | Provider | Method | ~Price |
|---|---|---|---|---|
| 1 | points of interest | Tripadvisor (paysponge x402 gateway) | `GET /api/v1/location/search` | $0.0105 |
| 2 | web context | Tavily (first-party x402) | `POST /search` | $0.0105 |
| 3 | SERP | SerpApi (Tempo MPP gateway) | `GET /search` | $0.0158 |

**Synthesis expectation.** Do not dump three JSON blobs. Produce a brief with:
named POIs from step 1 with their ratings and addresses; practical guidance
(timing, transport, neighbourhoods) from step 2 with source URLs; and anything
from step 3 that corroborates or contradicts the first two. Where step 2 and
step 3 disagree, say so — that disagreement is signal about how stale the
advice is.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `destination` | yes | `Lisbon, Portugal` | City, region, or landmark. Free text. |
| `research_query` | no | `best time to visit, getting around, and neighbourhoods to stay in` | What the web-context step should investigate. Appended after the destination. |

Output: three JSON responses. Step 1 returns a Tripadvisor location list
(`location_id`, `name`, `address_obj`). Step 2 returns Tavily `results[]` with
`url`, `title`, `content` and a relevance `score`. Step 3 returns SerpApi
Google results. The agent synthesises these into prose; the skill itself
returns raw responses.

## Gotchas

- **`destination` is a search term, not an ID.** Tripadvisor resolves it
  fuzzily; an ambiguous name ("Springfield") returns whichever match ranks
  first. Qualify with a country or region for anywhere ambiguous.
- **Pay-before-validate — get the params right.** The SELAT Router settles the
  payment *before* the upstream validates the request, so a malformed body is
  billed in full with no refund path. Tavily rejects a request whose `query` is
  absent or empty with a 400, **and charges for it.** Never send an empty
  `destination`.
- **`selat skill verify` proves payability, not correctness.** A clean 402 only
  means the endpoint will quote you a price. It does not mean your params are
  right. Verified prices and verified behaviour are different claims.
- **Prices carry a router markup.** Live charges land ~5% over the catalogue's
  listed price (`$0.0150` listed → `$0.015750` charged). `maxAmount` is set with
  headroom to absorb that; don't tighten it to the listed figure.
- **Step 3 is on a different rail.** Steps 1–2 settle `routed-x402`, step 3
  settles `routed-mpp`. That is transparent to the caller but shows up in
  `selat history`, and it means step 3 can fail independently of the other two.
- **No booking, no prices.** See "When To Use".

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe — probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/destination-brief`
- Live 402 check (free): `selat skill verify ./skills/destination-brief`
- Probe one step by hand (no pay):
  `selat-pay GET "https://tripadvisor.x402.paysponge.com/api/v1/location/search?searchQuery=Paris" --chain base --probe-only`
- A successful paid run prints `status=200` per step.

All three endpoints were confirmed returning live `200`s with real payloads
during authoring — see [`references/endpoints.md`](references/endpoints.md) for
the settled amounts and quote IDs.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint(s) this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
