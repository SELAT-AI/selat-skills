---
name: manhwa-chapter-check
description: Use this skill when a user wants to check if new English chapters of any manhwa (Korean webcomic) have been released recently — e.g. "check for new Solo Leveling chapter", "latest chapter of Tower of God?", "what's new in my manhwa list this week?", "any updates on The Beginning After The End?". Just give it the series name — any series works. Searches web scanlation sites, official platforms, and Reddit discussion. Uses Exa, Parallel search, and StableSocial Reddit, routed MPP through the SELAT Router.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a reachable SELAT Router (SELAT_ROUTER_URL). All three steps are routed MPP via the Router.
metadata:
  author: dipinxbt
  version: "2.1"
  rail: routed
  kind: multi
---

# manhwa-chapter-check

## When To Use

Use this skill when someone wants to check whether new English chapters of any manhwa series have been released. Works for any series — just type the name. Ideal for people who follow multiple ongoing series on Webtoon, Kakao, Tapas, or scanlation aggregators like Asura Scans, Reaper Scans, etc.

Triggers: "check manhwa chapter", "latest chapter of [series name]", "any new chapters?", "what's the latest [series name] chapter?", "is [series name] updated?", "check my manhwa list"

## Workflow

1. Install: `selat skill install manhwa-chapter-check`
2. Run for one series: `selat skill run manhwa-chapter-check --series "Solo Leveling"`
3. Run for multiple: the agent will ask the user for the list or use the `--series` param and search each one.

Steps (all three **routed MPP** through the SELAT Router):

- **Step 1 — Exa web search** — searches the web for "manhwa latest English chapter" across scanlation sites, official platforms, and aggregators (~$0.007).
- **Step 2 — Parallel search corroboration** — a second independent web search confirming the latest chapter number from other sources (~$0.011).
- **Step 3 — Reddit search** — searches Reddit for the specific series + chapter discussions, announcements, and fan posts (~$0.063).

Total typical spend: ~$0.08 per run.

**How the agent handles it:**
- If the user gives one series name, run the skill once with `--series`.
- If the user gives a list (comma-separated), run the skill for each series one at a time.
- After each run, tell the user the latest chapter number found and where to read it in plain language.

Output example: "Extra's Academy Survival Guide is on chapter 113 (released July 3). You can read it on Webtoon or Asura Scans."

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `series` | yes | — | Name of the manhwa series to check (any series — e.g. "Tower of God", "Solo Leveling") |

Output: Latest chapter numbers found for the requested series, with release dates and reading sources when available.

## Gotchas

- Works for **any** manhwa/series name — just pass the name as `--series`.
- For multiple series, run the skill once per series (the agent can loop through them).
- Series names with special characters like apostrophes need wrapping in quotes: `--series "Extra's Academy Survival Guide"`.
- Chapter numbers come from scanlation aggregators and may be ahead of official translations.
- The Reddit step searches for the series name — for very niche series with little Reddit presence it may return few results; the Exa and Parallel steps still carry the answer.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe — probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe without paying:
  - `selat-pay POST "https://api.exa.ai/search" --body '{"query":"Solo Leveling manhwa latest English chapter release","numResults":3}' --chain base --probe-only`
  - `selat-pay POST "https://parallelmpp.dev/api/search" --body '{"objective":"Find the latest English chapter number for Solo Leveling manhwa","search_queries":["Solo Leveling latest chapter English"],"max_results":5}' --chain base --probe-only`
  - `selat-pay POST "https://stablesocial.dev/api/reddit/search" --body '{"query":"Solo Leveling manhwa latest chapter"}' --chain base --probe-only`
- A successful run prints `status=200` per step and a summary.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- `references/endpoints.md` — the catalogue endpoints this skill calls.
- `../../references/agent-skill-authoring-sop.md` — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
