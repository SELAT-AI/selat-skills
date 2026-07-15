---
name: find-twitter-influencers
description: Use this skill when the user wants to find Twitter/X influencers to promote a product or brand — e.g. "find influencers for Acme", "discover Twitter accounts for partnerships", "build an influencer outreach list", "who are the top fintech creators on X", "identify creators in our niche". Resolves the company, discovers curated listicles, pulls Twitter profiles and engagement, scores candidates, and enriches contacts (email + LinkedIn). Mixed rail — most steps are MPP-routed through the SELAT Router; the Twitter data steps are direct Circle x402 calls to AIsa.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.1, and a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). Routed MPP steps need a reachable SELAT Router (SELAT_ROUTER_URL); the AIsa steps pay direct via Circle x402 (Gateway-batched) and do not use the router.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: mixed
  kind: multi
---

# find-twitter-influencers

## When To Use

Use when the user wants a ranked, enriched list of Twitter/X influencers for a company, product, or niche — for partnerships, sponsorships, or outreach. The skill spans the full pipeline: company resolution, candidate discovery, Twitter profile + engagement pull, and contact enrichment. Every API call is a paid service — most routed MPP through the SELAT Router, plus two direct Circle x402 calls to AIsa for Twitter data; the agent does the parsing, scoring, and ranking around the paid data.

## Workflow

1. Install: `selat skill install find-twitter-influencers`
2. Run: `selat skill run find-twitter-influencers --company "Acme Corp" [--domain acme.com] [--query "best fintech Twitter accounts to follow"] [--handle somehandle] [--linkedinUrl https://linkedin.com/in/...] [--firstName Jane --lastName Smith --contactDomain janesmithcreative.com]`
3. The CLI compiles each step into a `selat-pay` call, pays the per-step price (capped per step), runs the steps in order, and prints a per-step status summary.

Steps (**ROUTED MPP** via the SELAT Router unless marked DIRECT):

- **Step 1 — Apollo** `POST /apollo/org-search` — resolve the company by name (`q_organization_name`) to get its Apollo org record, domain, and industry.
- **Step 2 — Abstract Company Enrichment** `POST /abstract-company-enrichment/lookup` — resolve by domain when one is supplied (richer firmographic context, industry/SIC fields).
- **Step 3 — Exa** `POST /search` — discover curated influencer listicles (request `contents.text` to parse handles from page text; x.com is NOT in Exa's index).
- **Step 4 — Exa** `POST /findSimilar` — expand from a strong listicle URL to find more lists.
- **Step 5 — AIsa (DIRECT, Circle x402)** `GET /apis/v2/twitter/user/info?userName=` — fetch a candidate's Twitter profile and follower counts.
- **Step 6 — AIsa (DIRECT, Circle x402)** `GET /apis/v2/twitter/user/last_tweets?userName=` — fetch recent tweets with engagement metrics.
- **Step 7 — Hunter** `POST /hunter/email-finder` — find an email by name + domain.
- **Step 8 — Clado** `POST /clado/contacts` — LinkedIn-URL-to-contact enrichment (email + phone); synchronous, no polling.

For batch discovery (many handles), re-run steps 5/6 per `--handle`; the manifest models one candidate per run.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `company` | yes | — | Company/brand name (Apollo org-search `q_organization_name`) |
| `domain` | no | (empty) | Company domain for Abstract Company Enrichment lookup |
| `query` | no | `best fintech Twitter accounts to follow` | Exa listicle search query |
| `similarUrl` | no | `https://example.com/top-fintech-twitter-influencers` | Listicle URL for Exa findSimilar |
| `handle` | no | `examplehandle` | Twitter/X handle (no @) for the AIsa `userName` query param |
| `linkedinUrl` | no | `https://linkedin.com/in/janesmith` | LinkedIn URL for Clado contact enrichment |
| `firstName` | no | `Jane` | First name for Hunter email-finder |
| `lastName` | no | `Smith` | Last name for Hunter email-finder |
| `contactDomain` | no | `janesmithcreative.com` | Domain for Hunter email-finder |

Outputs (per step): Apollo org-search returns organization records (name, domain, industry); Abstract returns a firmographic company record; Exa returns `{results:[{url,text,...}]}`; AIsa returns Twitter profile and tweet JSON with follower and engagement counts; Hunter returns `{data:{email,...}}`; Clado returns a contact record (email + phone) for a LinkedIn URL. The agent parses, dedupes handles, scores (relevance 40% / engagement 25% / followers 15% / quality 10% / alignment 10%), and renders a ranked markdown table.

## Gotchas

- **Mixed rail.** Steps 1–4 and 7–8 are routed MPP and need `SELAT_ROUTER_URL` configured and the router reachable; steps 5–6 (AIsa) are direct Circle x402 calls (Circle Gateway-batched) and bypass the router.
- **Caps are ceilings, not prices.** Every step carries a `maxAmount` of ~10x its live price ($0.10–$0.50); live prices (probe-verified 2026-07-10) sum to about $0.085 per full run: Apollo $0.00525, Abstract $0.0063, Exa $0.00525 ×2, AIsa $0.00044 + $0.0036, Hunter $0.01365, Clado $0.04515 — see `references/endpoints.md`.
- **Hunter is POST in MPP.** The MPP route is `POST hunter.mpp.paywithlocus.com/hunter/email-finder` with a JSON body (`domain`, `first_name`, `last_name`) — not the upstream `GET /v2/email-finder`. The manifest grounds to the MPP host/path/method.
- **Exa cannot search Twitter.** x.com / twitter.com profiles are not in Exa's index; always search for listicle pages and parse handles from `contents.text`.
- **AIsa keys on `userName`.** Both Twitter endpoints take the bare handle (no @) as the `userName` query param.
- **Clado is synchronous.** `/clado/contacts` returns the enriched contact in the response; there is no async job to poll.
- **Steps run independently** (continue-across-steps): one step can succeed while another fails; check the summary.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

Free 402 probes (no payment) per the selat-pay repo convention:

- `selat-pay POST "https://apollo.mpp.paywithlocus.com/apollo/org-search" --body '{"q_organization_name":"Acme"}' --chain base --probe-only`
- `selat-pay POST "https://abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup" --body '{"domain":"acme.com"}' --chain base --probe-only`
- `selat-pay POST "https://exa.mpp.tempo.xyz/search" --body '{"query":"best fintech Twitter accounts to follow","numResults":10,"contents":{"text":{"maxCharacters":5000}}}' --chain base --probe-only`
- `selat-pay GET "https://api.aisa.one/apis/v2/twitter/user/info?userName=examplehandle" --chain base --probe-only`
- `selat-pay POST "https://hunter.mpp.paywithlocus.com/hunter/email-finder" --body '{"domain":"janesmithcreative.com","first_name":"Jane","last_name":"Smith"}' --chain base --probe-only`
- `selat-pay POST "https://clado.mpp.paywithlocus.com/clado/contacts" --body '{"linkedin_url":"https://linkedin.com/in/janesmith"}' --chain base --probe-only`

A successful run prints `status=200` per step and a ✓ summary for each rail.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the endpoints, methods, rails, and prices this skill calls.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

Third-party APIs (Apollo, Abstract, Exa, AIsa, Hunter, Clado) are the property of their respective owners; this skill calls them via the SELAT Router MPP rail or the Circle x402 catalog and asserts no affiliation.
