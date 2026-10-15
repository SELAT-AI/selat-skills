---
name: ai-research-scout
description: Use this skill when the user wants a current due-diligence brief on an AI, robotics, semiconductor, or deep-tech company or lab, including recent public activity, public-market stock signal when a ticker exists, and explicit gaps for private entities. Uses pinned SELAT catalogue endpoints for web/news scraping and stock snapshots; enrichment endpoints with observed charge-on-failure behavior are documented but excluded from the runnable path.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Gateway balance for paid calls. Routed MPP/x402 calls require a reachable SELAT Router.
metadata:
  author: ana-momin + SELAT review feedback
  version: "1.0.0"
  rail: mixed
  kind: multi
  maxCostUsd: "0.08"
---

# ai-research-scout

Generate a compact due-diligence brief for one AI, robotics, semiconductor, or
deep-tech entity by combining recent public activity with a real-time stock
snapshot when the entity is publicly traded.

## When To Use

Use when the user asks for a scout, snapshot, due-diligence brief, recent
activity check, or funding/activity signal on a named company, lab, or
deep-tech project. Prefer this skill when freshness matters and the answer
should be grounded in paid, current SELAT catalogue data.

Do not use it for general knowledge questions, private-key/wallet actions, or
requests where stale background knowledge is enough.

## Workflow

This manifest is a priced menu, not a blind run-all pipeline.

1. Resolve the target entity, official news or blog URL, and public ticker if
   one exists. If the name is ambiguous, ask a short clarification.
2. Run the primary scraping step first:
   - `Serper Scrape` with `url` in the JSON body.
3. Use `StableEnrich Firecrawl Scrape` only if Serper returns no useful page
   content or an upstream error after receiving a valid `url`.
4. Run the AIsa stock snapshot step only when a public ticker is known.
5. Merge successful step outputs into a short brief:
   - entity/activity overview,
   - recent activity,
   - current stock signal when available,
   - missing-data notes,
   - sources and receipts.
6. If a selected endpoint returns empty or unusable data, say so explicitly.
   Treat absence of useful data as a finding, not as something to hide.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---:|---|---|
| `entity` | yes | `NVIDIA` | Company, lab, or project name to scout. |
| `url` | yes | `https://nvidianews.nvidia.com/` | Official newsroom, blog, press-release, or recent-activity page to scrape. |
| `ticker` | no | `NVDA` | Public equity ticker. Leave empty or skip the stock step for private entities. |

Output: selected-step JSON from SELAT plus an agent-written brief with:

- **Entity Overview** — one paragraph grounded in the scraped source.
- **Recent Activity** — dated bullet list of notable public updates.
- **Current Signal** — latest stock snapshot if `ticker` is available; otherwise
  state that the entity appears private or no ticker was supplied.
- **Sources And Receipts** — endpoint names, prices, quote or transaction IDs,
  and any failed or skipped steps.

## Gotchas

- **Serper requires `url`.** A probe or request without `url` returns a parameter
  validation error and states that no payment was charged. That is correct
  behavior, not endpoint unavailability.
- **Probe payability is not semantic validation.** A free probe can confirm that
  an endpoint is payable, but it does not prove the runtime payload contains all
  required parameters.
- **Private entities have no stock snapshot.** If `ticker` is absent or the AIsa
  step returns empty, preserve a `Current Signal` section that says public-market
  data is not applicable or unavailable.
- **Enrichment is excluded by design.** Abstract Company Enrichment and Company
  Enrich are not in the manifest because testing observed settled charges on
  upstream failure. Keep that as research evidence, not part of the default
  runnable path.
- **Apify is not used.** Apify actors require a prepaid-token minimum of about
  `$1.05`, which is too coarse for this small per-company scout.

## Validation

- `npm run validate` from the repository root should report 0 errors.
- `selat skill verify ./skills/ai-research-scout` should probe the pinned
  endpoints without payment and keep each quote below its per-step `maxAmount`.
- Public-company eval: run with `entity=NVIDIA`, `url=https://nvidianews.nvidia.com/`,
  and `ticker=NVDA`; expect recent activity plus a stock snapshot.
- Private-entity eval: run only the scraping step for a private lab or startup;
  expect the stock section to explicitly say no public ticker was supplied.

## References

- `manifest.json` — pinned SELAT payment recipe and parameter names.
- [`references/endpoints.md`](references/endpoints.md) — endpoint prices, payloads,
  fallback rules, excluded enrichment evidence, and Apify economics.
