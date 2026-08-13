---
name: company-hiring-radar
description: Use this skill when the user wants to see what a company is hiring for right now - e.g. "what is OpenAI hiring for", "recent job openings at Stripe", "has Figma posted any new roles this week", "what is Anthropic hiring remotely", "hiring signals for a company", "new roles from a company's career page". Runs a three-step Fantastic Jobs MPP pipeline over the SELAT Router - ATS career-page postings, LinkedIn/Wellfound/YC board postings, and a 24h job-change feed - and synthesizes a hiring-signals brief (role mix, locations, remote split, change signals). Paid per call via MPP on Tempo; no API keys.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.2, and a funded Circle Gateway balance. All steps are MPP on Tempo, so a reachable SELAT Router (SELAT_ROUTER_URL) is required for the whole run.
metadata:
  author: Caballero8787
  version: "1.0"
  rail: MPP on Tempo
  kind: multi
---

# company-hiring-radar

## When To Use

Use when the user wants to know what a specific company (or a few companies) is hiring for right now - recent openings, new roles this week, board postings, or hiring-change signals - for sales triggers, competitive intelligence, job research, or VC due diligence. The skill reads the Fantastic Jobs high-volume feed through the SELAT Router (MPP on Tempo), with no API keys.

## Workflow

1. Install: `selat skill install company-hiring-radar`
2. Run: `selat skill run company-hiring-radar --company "<exact company name>" --time_frame 7d`
3. The CLI compiles each step into a `selat-pay` call and prints the per-step result.

Steps (each ~$0.42 live; caps are ceilings):

- **Step 1 - Fantastic Jobs** `GET /v1/active-ats` - new postings from 54 ATS career pages (Greenhouse, Lever, Workday, and more) for `${company}`, newest first, with inline LinkedIn company fields.
- **Step 2 - Fantastic Jobs** `GET /v1/active-jb` - new postings from LinkedIn, Wellfound, and Y Combinator boards for `${company}`.
- **Step 3 - Fantastic Jobs** `GET /v1/modified-ats` - ATS jobs whose fields changed in the last 24h (repurposed, reopened, or re-leveled roles - early signals of hiring shifts).

Tell the user before paying: "This costs about $1.26 total (3 x ~$0.42) - proceed?" When relaying results, summarize in plain language and do not dump raw JSON. Synthesize a hiring-signals brief: role mix, locations, remote split, seniority, and change-feed signals (for example, the same role reposted repeatedly usually means it is hard to fill).

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `company` | yes | `OpenAI` | Exact organization name(s), comma-separated, to scope the scan |
| `time_frame` | no | `7d` | Time window for new postings: `1h`, `24h`, `7d`, or `6m` |

Output: three job-posting lists (ATS career pages, boards, and 24h changes). Each posting includes title, location, work arrangement, seniority, organization details, posting URL, and posted/modified dates. The agent synthesizes these into a hiring-signals brief.

## Gotchas

- **These are GET endpoints - filters go in the query string, never a JSON body.** POSTing to `/v1/active-ats` returns no x402 challenge.
- **`time_frame` is an enum** - pass exactly `1h`, `24h`, `7d`, or `6m`.
- **`organization` is an exact-name filter** (comma-separated for multiple orgs). Use the name as it appears on the company's LinkedIn/career page; `organization_slug` (LinkedIn slug) is the variant to try when exact names miss.
- **Pagination billing:** the first page of a search is one billable request (~$0.01). Continuation pages on the same logical search are charged 0 but require the top-level `parentRequestId` from the first Orthogonal `/v1/run` response, with non-pagination parameters unchanged. The manifest runs single pages (limit 25); deep scans can paginate via `parentRequestId`.
- **Per-step caps are ~1.2x each live price - ceilings, not prices.** Live prices (probe-verified 2026-08-13): each Fantastic Jobs step is $0.42 - a full run of the manifest steps costs ~$1.26 at today's router quotes. Top-level `maxAmount` is $2.00 (the catalogue lists $0.01, but the live 402 quote is $0.42 - the live quote wins).
- **Results are raw postings, not a verdict.** Filter and synthesize in plain language; the change feed (Step 3) is the strongest early signal but only covers ATS sources.
- Optional extra filters (`title`, `location`, `source`, `seniority`, `ai_work_arrangement`, `ai_employment_type`, `has_salary`, `date_modified_gte`, ...) are documented in `references/endpoints.md` - add them to a hand-built `selat-pay` call when a narrower scan is needed.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe - probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

Run free 402 probes (no payment) before a real run:

- `selat-pay GET "https://mpp.orthogonal.com/fantastic-jobs/v1/active-ats?time_frame=7d&limit=25&organization=OpenAI&include_basic_organization_details=true" --chain base --probe-only`
- `selat-pay GET "https://mpp.orthogonal.com/fantastic-jobs/v1/active-jb?time_frame=7d&limit=25&organization=OpenAI" --chain base --probe-only`
- `selat-pay GET "https://mpp.orthogonal.com/fantastic-jobs/v1/modified-ats?limit=25&organization=OpenAI" --chain base --probe-only`

A successful run prints `status=200` for each reachable step and a summary.

## References

- `manifest.json` - the machine-readable, MPP on Tempo payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) - the grounded MPP endpoints (merchant, method, path, price, params) this skill calls.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) - authoring standard.
- selat-pay - https://github.com/SELAT-AI/selat-pay

Third-party data (Fantastic Jobs / ATS platforms, LinkedIn, Wellfound, Y Combinator) is the property of its respective owners and is accessed under their terms via the SELAT Router MPP rail.