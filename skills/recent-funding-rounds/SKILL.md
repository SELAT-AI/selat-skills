---
name: recent-funding-rounds
description: Use this skill when the user wants read-only discovery of recently published startup-funding news—for example, "what companies raised funding in the past week?", "recent seed rounds", "latest fintech Series A announcements", or "funding rounds over $10M this month". It makes one bounded Brave News Search call through the SELAT Router over MPP on Tempo, with an explicit search focus and publication-freshness window. It returns news coverage, not verified structured deal records, and never executes investments or outreach.
license: Apache-2.0
compatibility: Requires the selat CLI and a reachable SELAT Router. Free live verification needs no wallet; a paid run requires a funded Circle Agent Wallet and explicit approval.
metadata:
  author: SELAT-AI
  version: "1.1"
  rail: MPP on Tempo
  kind: single
---

# recent-funding-rounds

## When To Use

Use for **recently published news coverage** of startup funding rounds within a
clear topic and relative time window. The skill makes one bounded news search
and returns up to ten candidate articles for evidence-based deal-flow review.

This is not a structured funding database. It does not guarantee that every
article describes a newly closed round, and it cannot prove a company, stage,
amount, or announcement date beyond what the returned article supports. Use a
dedicated structured-data capability when the user needs exhaustive coverage or
database-grade fields.

Do not use this skill for investment execution, personalized financial advice,
private-contact discovery, or outreach.

## Workflow

1. Collect both required inputs:

   - `focus`: a concrete funding-news topic such as `artificial intelligence
     startups`, `fintech Series A`, or `startup rounds over $10M`.
   - `freshness`: one of `pd`, `pw`, `pm`, or `py`, representing the past 24
     hours, 7 days, 31 days, or 365 days respectively.

   Do not silently choose a sector or time window. If either is absent, ask the
   user. Treat these as rolling publication windows, not exact calendar periods.

2. Install the vetted recipe:

   ```bash
   selat skill install recent-funding-rounds
   ```

3. Run the free live verification before any wallet setup or paid call:

   ```bash
   SELAT_ROUTER_URL=https://router.selat.ai \
     selat skill verify ~/.config/selat/skills/recent-funding-rounds \
     --focus "artificial intelligence startups" \
     --freshness "pw" \
     --live-probe
   ```

4. Show the user the live quote, the source-skill cap, and the one-call scope.
   Explain that a paid application error may still charge. Wait for explicit
   approval of the expected cost and maximum session cap.

5. Only after approval and a spendable Gateway balance, arm a session budget no
   higher than the approved cap, execute once, and stop the budget after success
   or failure:

   ```bash
   selat budget start --amount <approved-cap>
   selat skill run recent-funding-rounds \
     --focus "<funding-news-focus>" \
     --freshness "<pd|pw|pm|py>" \
     --max-amount <approved-cap>
   selat budget stop
   ```

Inspect payment history before any retry. A different focus or freshness window
is a new paid call and requires a fresh probe and separate approval.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `focus` | yes | none | Concrete sector, stage, size hint, or combination used in the news query. |
| `freshness` | yes | none | Publication window: `pd` (24h), `pw` (7d), `pm` (31d), or `py` (365d). |

The fixed request searches for `${focus} funding round announced`, requests ten
results, and applies the supplied publication-freshness window.

Distill the response into:

1. The supplied focus, rolling publication window, and retrieval time.
2. Up to ten candidate articles in provider order.
3. Article title, source, publication time, URL, and snippet only when actually
   returned.
4. Company, round stage, amount, investors, and announcement timing only when
   explicitly supported by the article title or snippet; otherwise mark them
   unknown.
5. Duplicate or syndicated coverage grouped as one possible funding event.
6. A warning when publication recency does not establish that the financing
   event itself occurred inside the same window.
7. Call status, observed cost, rail, and any error.

Preserve provenance and uncertainty. Do not turn a headline into a verified
deal record, invent missing fields, or claim exhaustive market coverage.

## Gotchas

- **No hidden defaults:** both `focus` and `freshness` are required. Missing
  input must fail before any endpoint call.
- **Publication time is not deal-close time:** `freshness` filters news-index
  publication recency, not the legal close date of a financing.
- **Rolling windows:** `pw` means the past seven days and `pm` means the past 31
  days; neither means the current calendar week or month. Apply a transparent
  client-side date check if the user requests an exact calendar boundary.
- **Query hints are not structured filters:** stage and deal-size phrases in
  `focus` improve search relevance but do not guarantee exact matches. Filter
  and label the returned evidence rather than fabricating database semantics.
- **Press coverage is incomplete:** small, private, or unannounced rounds may
  not appear.
- **Paid failures may charge:** never auto-retry. Inspect history, re-probe, and
  obtain fresh approval first.

## Validation

- Static:

  ```bash
  selat skill validate ./skills/recent-funding-rounds
  ```

- Free live gate:

  ```bash
  SELAT_ROUTER_URL=https://router.selat.ai \
    selat skill verify ./skills/recent-funding-rounds \
    --focus "artificial intelligence startups" \
    --freshness "pw" \
    --live-probe
  ```

- Missing-input gate: omit `focus` and `freshness` separately and confirm each
  command fails before a network call.
- Paid smoke test: run one requester-approved topic only after a fresh quote,
  explicit approval, a spendable Gateway balance, and an armed session budget.

## References

- `manifest.json` — machine-readable bounded payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — request schema,
  freshness semantics, live quote, scope, and free probe.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

"Brave" is a trademark of its respective owner and is used only for endpoint
identification. This skill is not affiliated with or endorsed by Brave.
