---
name: recent-funding-rounds
description: Use this skill when the user asks about companies that raised funding recently — "what companies raised funding this week?", "recent seed rounds", "latest Series A deals", "what fintech companies recently raised", "this month's funding rounds", or weekly/monthly deal flow. Searches recent news coverage of funding rounds via Brave Search news-search, routed through the SELAT Router over the MPP rail. Returns news articles announcing raises, not a structured funding database.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). The single routed step requires a reachable SELAT Router (SELAT_ROUTER_URL) to translate the inbound payment into an outbound MPP payment to Brave Search (via Locus).
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: single
---

# recent-funding-rounds

## When To Use

Use when the user wants to discover companies that have **raised funding recently** in a given sector. Typical triggers: "what companies raised funding this week?", "show me recent seed rounds", "latest Series A deals in fintech". The skill issues a single routed MPP call to Brave Search's `/brave/news-search` and returns recent news articles announcing funding rounds.

**Be honest about what comes back:** Brave news-search returns news articles about funding rounds (headline, snippet, source, publish date, URL) — it is **not** a structured funding database. There is no server-side filtering by exact date range, round type, or deal size; those signals live in the article text. Fold them into the query wording (e.g. a "seed" or "Series A" mention in `sector`) and extract deal details from the returned articles.

## Workflow

1. Install: `selat skill install recent-funding-rounds`
2. Run: `selat skill run recent-funding-rounds --sector "artificial intelligence"`
3. The CLI compiles the single step into a `selat-pay` call, routes it through the SELAT Router (which pays Brave Search via Locus over MPP), and prints a ✓/✗ summary.

Step:

- **Step 1 — Brave Search** `POST /brave/news-search` — **ROUTED MPP** via the SELAT Router. Queries `"${sector} startup funding round announced"` against Brave's news index; returns recent news articles covering funding announcements in that sector.

To bias toward a round type, include it in `sector` (e.g. `--sector "fintech seed"`); news search naturally surfaces recent coverage, so "this week / this month" style asks are served by the recency of the news index rather than an explicit date filter.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `sector` | yes | `artificial intelligence` | Sector/industry in plain words, interpolated into the news query |

Outputs: news-search results — a list of articles, each with title, description/snippet, source, publish age/date, and URL. Company names, round types, and deal sizes must be read out of the article text; the response is news coverage, not structured deal records.

## Gotchas

- The routed step needs `SELAT_ROUTER_URL` configured and the router reachable — there is no direct rail in this skill.
- Live price is $0.03675 per call (probe-verified 2026-07-10); the manifest's $5.00 caps are a loose spending filter, not the price.
- This is a news search, not a funding database: no `date_start`/`date_end`, `financing_types`, or `size_min` filters exist. Encode round type or size hints in the query wording and filter results client-side.
- Coverage skews toward rounds that got press; small or unannounced raises may not appear at all.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe without paying (free 402 probe):
  - `selat-pay POST "https://brave.mpp.paywithlocus.com/brave/news-search" --body '{"q":"artificial intelligence startup funding round announced"}' --chain base --probe-only`
- A successful run prints `status=200` and a ✓ summary for the routed rail.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoint this skill calls.
- `references/agent-skill-authoring-sop.md` — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
