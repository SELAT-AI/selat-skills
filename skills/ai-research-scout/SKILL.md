---
name: ai-research-scout
description: Use this skill when the user wants a due-diligence style brief on an AI, robotics, or deep-tech company or research lab — funding signals, recent public activity, and a company/domain profile in one pass. Chains a web-scraping endpoint, a real-time-data endpoint, and a data-enrichment endpoint from the SELAT federated catalogue, settles each via SELAT, and returns one merged brief with receipts. Trigger on requests like "scout [company] for me," "what's the latest on [lab/startup]," or "give me a funding/activity snapshot of [entity]."
---

# AI Research Scout

Produces a one-pass due-diligence brief on an AI/robotics/deep-tech entity (startup,
lab, or open-source project) by chaining three paid SELAT endpoints and merging their
output into a single structured result with receipts.

## When to use this
- User names a company, lab, or project and wants a "scout," "snapshot," "brief," or
  "what's the latest on X" style answer that needs current, paid-source data (not just
  what the model already knows).
- Do NOT use this for general knowledge questions the agent can already answer — only
  trigger when the ask specifically wants current/paid-source signal (funding, recent
  activity, domain/enrichment data).

## Endpoints used
<!-- FILL IN AFTER DISCOVERY: replace each [placeholder] with the exact endpoint id/slug
     returned by `selat search` for that category. Keep one endpoint per category —
     this skill intentionally stays to 3 calls to keep cost and latency predictable. -->

1. **Scraping** — try `Serper Scrape` ($0.02/call, MPP,
   `POST https://mpp.orthogonal.com/serper-scrape/`) first. In testing this
   frequently had "no payable challenge" and failed to initiate — fall back to
   `StableEnrich Firecrawl Scrape` (~$0.013/call) for the same purpose.
2. **Real-time data** — `AIsa API` (~$0.024/call,
   `GET https://api.aisa.one/apis/v2/financial/prices/snapshot?ticker=NVDA` style)
   for stock snapshots. The catalogue's other real-time-data option, Yahoo Finance
   via Apify, requires a ~$1 prepaid token — too coarse for a per-call skill, avoid
   it. NOTE: stock endpoints only return data for publicly traded entities — private
   startups/labs will get an empty result here. Flag this explicitly in the brief
   rather than failing silently.
3. **Enrichment** — `Company Enrichment` (Abstract, ~$0.006/call) or its fallback
   `Company Enrich` (~$0.013/call). **Known issue:** both failed upstream (502 /
   verification error) in testing, and both still deducted payment despite
   returning no data. Treat enrichment as best-effort: if it fails, report that
   section as unavailable in the brief rather than retrying indefinitely or failing
   the whole run.

## Steps

1. Confirm the target entity name with the user if ambiguous (e.g. "Cursor" the editor
   vs. a lab of the same name).
2. Run discovery only if a cached catalogue lookup is stale: `selat search "[category]"`.
   Skip if endpoint ids above are already resolved.
3. Call the scraping endpoint for the entity. Confirm price with the user before paying
   if this is the user's first call in the session; after one confirmed call in a
   session, subsequent calls in the same skill run don't need re-confirmation unless
   price changes.
4. Call the real-time-data endpoint for the entity.
5. Call the enrichment endpoint for the entity's domain/company name.
6. Merge the three results into one brief with this structure:
   - **Entity overview** (from enrichment)
   - **Recent activity** (from scraping)
   - **Current signal** (from real-time data)
   - **Sources & receipts** — list each endpoint called, its price, and its transaction id
7. Present the brief to the user. If any endpoint returned nothing useful, say so
   explicitly rather than omitting it silently — that's a real finding, not a failure.

## Notes
- Total cost per brief should stay predictable (3 calls). If any single endpoint is
  disproportionately expensive, flag it to the user before calling rather than after.
- If an endpoint is unavailable or deprecated, fall back to the next-ranked endpoint in
  the same category from `selat search` rather than dropping that section of the brief.
