---
name: recent-funding-rounds
description: Use this skill when the user asks about companies that raised funding recently — "what companies raised funding this week?", "recent seed rounds", "latest Series A deals", "what fintech companies recently raised", "this month's funding rounds", or weekly/monthly deal flow. Searches recent funding deals by date range, round type, deal size, and industry via Fundable, routed through the SELAT Router over the MPP rail.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). The single routed step requires a reachable SELAT Router (SELAT_ROUTER_URL) to translate the inbound payment into an outbound MPP payment to Fundable.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: single
---

# recent-funding-rounds

## When To Use

Use when the user wants to discover companies that have **raised funding recently** and filter that deal flow by date window, round type, deal size, or industry. Typical triggers: "what companies raised funding this week?", "show me recent seed rounds", "latest Series A deals in fintech", "this month's $10M+ raises". The skill issues a single routed MPP call to Fundable's `/companies` search and returns the matching companies with their latest funding round.

## Workflow

1. Install: `selat skill install recent-funding-rounds`
2. Run: `selat skill run recent-funding-rounds --dateStart 2026-06-16 --dateEnd 2026-06-23 [--financingType SEED] [--sizeMin 1000000] [--industry artificial-intelligence] [--sortBy most_recent_raise] [--pageSize 25]`
3. The CLI compiles the single step into a `selat-pay` call, routes it through the SELAT Router (which pays Fundable over MPP), and prints a ✓/✗ summary.

Step:

- **Step 1 — Fundable** `POST /companies` — **ROUTED MPP** via the SELAT Router. Searches companies by `latest_deal` date window plus optional round-type, size, and industry filters; returns each company with its latest funding round.

Date calculation: for "last week" set `dateStart` to 7 days before today; for "last month" set it 30 days before. Use ISO 8601 (`YYYY-MM-DD`).

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `dateStart` | yes | `2026-06-16` | Start of the deal window (ISO 8601) |
| `dateEnd` | yes | `2026-06-23` | End of the deal window (ISO 8601) |
| `financingType` | no | `SEED` | Round type, e.g. SEED, SERIES_A…SERIES_M, SAFE, GRANT |
| `sizeMin` | no | `1000000` | Minimum deal size in USD |
| `industry` | no | `artificial-intelligence` | Industry permalink filter |
| `sortBy` | no | `most_recent_raise` | Sort order |
| `pageSize` | no | `25` | Results per page (1-100) |

Outputs: `{ success, data: { companies: [{ id, name, domain, total_raised, num_funding_rounds, industries, location, latest_deal: { type, size_native, date, investors, … } }] }, meta: { total_count, page, page_size } }`.

## Gotchas

- The routed step needs `SELAT_ROUTER_URL` configured and the router reachable — there is no direct rail in this skill.
- Per-step cap is $0.066 (full-run cap also $0.066). Fundable bills by credits scaled to `pageSize`; a large page may approach the cap — lower `pageSize` to browse cheaply.
- Empty arrays are rejected by Fundable: omit a filter rather than sending `[]`. Drop `financingType` or `industry` to broaden results instead of passing an empty value.
- `sortBy` is ignored if a semantic `search_query` is used upstream; this skill sorts by `most_recent_raise` by default.
- Dates must be ISO 8601 `YYYY-MM-DD`; a malformed date yields a 422 from Fundable.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe without paying (free 402 probe):
  - `selat-pay POST "https://tryfundable.ai/companies" --body '{"latest_deal":{"date_start":"2026-06-16","date_end":"2026-06-23"},"sort_by":"most_recent_raise","page_size":25}' --chain base --probe-only`
- A successful run prints `status=200` and a ✓ summary for the routed rail.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoint this skill calls.
- `references/agent-skill-authoring-sop.md` — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
