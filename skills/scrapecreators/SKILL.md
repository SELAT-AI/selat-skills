---
name: scrapecreators
description: Use this skill when the user wants to scrape or pull social media data — Instagram, TikTok, LinkedIn, or X/Twitter profiles, posts, tweets, company pages, hashtags, or trending content. Triggers on "social scraper", "get this TikTok profile", "pull a LinkedIn profile", "fetch tweets for", "Instagram profile data", "trending TikToks", "influencer research", "social listening", "competitor social analysis". Multi-merchant — X/Twitter via AIsa (Circle x402 catalog; direct, Circle Gateway-batched), Instagram + TikTok via StableSocial (MPP, routed via the SELAT Router), LinkedIn via Clado (MPP, routed) — each capability compiled into a selat-pay call by the selat CLI.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). The routed steps (StableSocial, Clado) need a reachable SELAT Router (SELAT_ROUTER_URL) to translate the inbound Gateway-batched payment into an outbound MPP payment; the direct AIsa steps settle upstream Gateway-batched and bypass the router.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: mixed
  kind: multi
---

# scrapecreators

## When To Use

Use when the user wants social media data scraped from Instagram, TikTok, LinkedIn, or X/Twitter — profiles, recent posts, tweets, company pages, hashtag searches, or trending content. Common contexts: influencer research, social listening, competitive analysis, content research, and lead generation. This is a **multi-merchant** skill: X/Twitter capabilities are **direct** AIsa calls (Circle x402 catalog, Circle Gateway-batched), while Instagram/TikTok (StableSocial) and LinkedIn (Clado) capabilities run as **routed** MPP payments through the SELAT Router. (The skill name is historical — it was originally backed by a single "Scrape Creators" merchant.)

## Workflow

1. Install: `selat skill install scrapecreators`
2. Run: `selat skill run scrapecreators [--handle openai] [--hashtag tech] [--tweetId ...] [--linkedinUrl ...] [--instagramHandle ...]`
3. The CLI compiles each step in `manifest.json` into a `selat-pay` call — direct AIsa steps pay upstream Gateway-batched; StableSocial and Clado steps route through the SELAT Router (MPP) — runs the steps in order, and prints a per-step ✓/✗ summary.

Only pass the params for the capabilities you actually need; unused steps still run against their defaults unless you scope the run.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `handle` | no | `openai` | Handle without @ for X/Twitter, Instagram, and TikTok profile/posts lookups |
| `tweetId` | no | `1234567890123456789` | Numeric tweet ID for tweet-details (AIsa takes IDs, not tweet URLs) |
| `linkedinUrl` | no | `https://linkedin.com/in/satyanadella` | LinkedIn profile URL |
| `linkedinPostUrl` | no | `https://linkedin.com/posts/somepost` | LinkedIn post URL |
| `linkedinCompanyUrl` | no | `https://linkedin.com/company/anthropic` | LinkedIn company page URL |
| `instagramHandle` | no | `openai` | Instagram handle for the secondary profile lookup (replaces the old numeric userId) |
| `hashtag` | no | `tech` | TikTok hashtag (without #) |

Outputs: each step returns the merchant's JSON payload for that endpoint (profile objects, tweet/post arrays, company metadata, hashtag/search video lists). The CLI prints `status` and the response body per step.

## Gotchas

- **Mixed rails**: the StableSocial and Clado steps are routed and need `SELAT_ROUTER_URL` configured with the SELAT Router reachable; the AIsa X/Twitter steps are direct and bypass the router.
- Per-step and full-run caps (`maxAmount`) are a loose $5.00 spending filter; live prices total ≈ $0.45 across all 12 steps (see `references/endpoints.md`).
- Handles must be passed **without** the leading `@`; hashtags **without** the leading `#`.
- Tweet details take a **numeric tweet ID** (`tweetId`), not a tweet URL.
- The LinkedIn steps expect a full URL and POST it as `linkedin_url` in the body via Clado.
- Instagram lookups are **by handle** — there is no numeric-userId or single-post-by-URL endpoint; the recent-posts step returns the handle's latest posts instead of one post.
- TikTok "trending" is served by StableSocial keyword search (`{"query":"trending"}`); there is no region-scoped trending-feed endpoint.
- Steps run independently (continue-across-steps): one capability can succeed while another fails — check the per-step summary.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe without paying (free 402 probe per repo convention):
  - `selat-pay GET "https://api.aisa.one/apis/v2/twitter/user/info?userName=openai" --chain base --probe-only`
  - `selat-pay POST "https://stablesocial.dev/api/tiktok/profile" --body '{"handle":"openai"}' --chain base --probe-only`
  - `selat-pay POST "https://clado.mpp.paywithlocus.com/clado/linkedin-profile" --body '{"linkedin_url":"https://linkedin.com/in/satyanadella"}' --chain base --probe-only`
- A `--probe-only` call returns the 402 payment requirements without settling; a successful paid run prints `status=200` and a ✓ for each step.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the merchant endpoints, methods, and live prices (probe-verified 2026-07-10) this skill calls.
- selat-pay — https://github.com/SELAT-AI/selat-pay
