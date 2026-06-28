---
name: find-twitter-influencers
description: Use this skill when the user wants to find Twitter/X influencers to promote a product or brand — e.g. "find influencers for Acme", "discover Twitter accounts for partnerships", "build an influencer outreach list", "who are the top fintech creators on X", "identify creators in our niche". Resolves the brand, discovers curated listicles and LinkedIn-heavy professionals, pulls Twitter profiles and engagement, scores candidates, and enriches contacts (email + LinkedIn). All steps are MPP-routed through the SELAT Router.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.1, and a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). Every step is routed MPP, so a reachable SELAT Router (SELAT_ROUTER_URL) is required.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: multi
---

# find-twitter-influencers

## When To Use

Use when the user wants a ranked, enriched list of Twitter/X influencers for a company, product, or niche — for partnerships, sponsorships, or outreach. The skill spans the full pipeline: brand resolution, candidate discovery, Twitter profile + engagement pull, and contact enrichment. Every API call is a paid MPP service routed through the SELAT Router; the agent does the parsing, scoring, and ranking around the paid data.

## Workflow

1. Install: `selat skill install find-twitter-influencers`
2. Run: `selat skill run find-twitter-influencers --company "Acme Corp" [--domain acme.com] [--query "best fintech Twitter accounts to follow"] [--nlQuery "..."] [--handle somehandle] [--linkedinUrl https://linkedin.com/in/...] [--firstName Jane --lastName Smith --contactDomain janesmithcreative.com]`
3. The CLI compiles each step into a `selat-pay` call, pays the routed MPP price (capped per step), runs the steps in order, and prints a per-step status summary.

Steps (all **ROUTED MPP** via the SELAT Router):

- **Step 1 — Brand.dev** `GET /v1/brand/retrieve-by-name` — resolve the company by name to get domain, industry, description, audience keywords.
- **Step 2 — Brand.dev** `GET /v1/brand/retrieve` — resolve by domain when one is supplied (richer context).
- **Step 3 — Exa** `POST /search` — discover curated influencer listicles (request `contents.text` to parse handles from page text; x.com is NOT in Exa's index).
- **Step 4 — Exa** `POST /findSimilar` — expand from a strong listicle URL to find more lists.
- **Step 5 — Fiber** `POST /v1/natural-language-search/profiles` — surface LinkedIn-heavy professionals with active Twitter accounts.
- **Step 6 — Scrape Creators** `GET /v1/twitter/profile` — fetch a candidate's profile (counts live in `core` and `legacy`).
- **Step 7 — Scrape Creators** `GET /v1/twitter/user-tweets` — fetch top tweets; engagement is inside each tweet's `legacy` object.
- **Step 8 — Fiber** `POST /v1/kitchen-sink/person` — enrich a person by LinkedIn URL (`profileIdentifier`; no Twitter URL param).
- **Step 9 — Hunter** `POST /hunter/email-finder` — find an email by name + domain.
- **Step 10 — Tomba** `GET /v1/linkedin` — LinkedIn-URL-to-email lookup.

For batch discovery (many handles), re-run steps 6/7 per `--handle`; the manifest models one candidate per run.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `company` | yes | — | Company/brand name (Brand.dev retrieve-by-name) |
| `domain` | no | (empty) | Company domain for Brand.dev retrieve-by-domain |
| `query` | no | `best fintech Twitter accounts to follow` | Exa listicle search query |
| `similarUrl` | no | `https://example.com/top-fintech-twitter-influencers` | Listicle URL for Exa findSimilar |
| `nlQuery` | no | `fintech thought leader content creator with Twitter presence` | Fiber NL profile-search query |
| `handle` | no | `examplehandle` | Twitter/X handle (no @) for Scrape Creators |
| `linkedinUrl` | no | `https://linkedin.com/in/janesmith` | LinkedIn URL for Fiber kitchen-sink + Tomba |
| `firstName` | no | `Jane` | First name for Hunter email-finder |
| `lastName` | no | `Smith` | Last name for Hunter email-finder |
| `contactDomain` | no | `janesmithcreative.com` | Domain for Hunter email-finder |

Outputs (per step): Brand.dev returns brand/domain/industry/description; Exa returns `{results:[{url,text,...}]}`; Fiber returns profile records (with LinkedIn URLs); Scrape Creators returns nested profile/tweet JSON (`core`, `legacy`); Hunter returns `{data:{email,...}}`; Tomba returns an email record. The agent parses, dedupes handles, scores (relevance 40% / engagement 25% / followers 15% / quality 10% / alignment 10%), and renders a ranked markdown table.

## Gotchas

- **All routed.** Every step needs `SELAT_ROUTER_URL` configured and the router reachable.
- **Per-run cap is $0.22** (sum of step caps, rounded up). Step caps: Brand.dev $0.03 ×2, Exa $0.005 ×2, Fiber $0.04 ×2, Scrape Creators $0.02 ×2, Hunter $0.013, Tomba $0.01.
- **Fiber price note.** The Fiber NL-search and kitchen-sink endpoints have no published per-call price in the MPP catalogue; the per-step cap of $0.04 is taken from the priced Fiber endpoint as a safe upper bound — see `references/endpoints.md`.
- **Hunter is POST in MPP.** The MPP route is `POST hunter.io/hunter/email-finder` with a JSON body (`domain`, `first_name`, `last_name`) — not the upstream `GET /v2/email-finder`. The manifest grounds to the MPP host/path/method.
- **Exa cannot search Twitter.** x.com / twitter.com profiles are not in Exa's index; always search for listicle pages and parse handles from `contents.text`.
- **Scrape Creators is nested.** Profile fields are in `core` and `legacy`; tweet engagement is in each tweet's `legacy` object (`legacy.favorite_count`, etc.), not top-level.
- **Fiber kitchen-sink wants a LinkedIn URL.** Pass `profileIdentifier` (LinkedIn URL); name+company fallback has low match rates.
- **Steps run independently** (continue-across-steps): one step can succeed while another fails; check the summary.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

Free 402 probes (no payment) per the selat-pay repo convention:

- `selat-pay GET "https://api.brand.dev/v1/brand/retrieve-by-name?name=Acme" --chain base --probe-only`
- `selat-pay POST "https://api.exa.ai/search" --body '{"query":"best fintech Twitter accounts to follow","numResults":10,"contents":{"text":{"maxCharacters":5000}}}' --chain base --probe-only`
- `selat-pay GET "https://api.scrapecreators.com/v1/twitter/profile?handle=examplehandle" --chain base --probe-only`
- `selat-pay POST "https://hunter.io/hunter/email-finder" --body '{"domain":"janesmithcreative.com","first_name":"Jane","last_name":"Smith"}' --chain base --probe-only`
- `selat-pay GET "https://api.tomba.io/v1/linkedin?url=https://linkedin.com/in/janesmith" --chain base --probe-only`

A successful run prints `status=200` per step and a ✓ summary for the routed rail.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoints, methods, and prices this skill calls.
- [`../../references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

Third-party APIs (Brand.dev, Exa, Fiber, Scrape Creators, Hunter, Tomba) are the property of their respective owners; this skill calls them via the SELAT Router MPP rail and asserts no affiliation.
