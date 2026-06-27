---
name: scrapecreators
description: Use this skill when the user wants to scrape or pull social media data — Instagram, TikTok, LinkedIn, or X/Twitter profiles, posts, tweets, company pages, hashtags, or trending feeds. Triggers on "scrape creators", "social scraper", "get this TikTok profile", "pull a LinkedIn profile", "fetch tweets for", "Instagram profile data", "trending TikToks", "influencer research", "social listening", "competitor social analysis". Runs Scrape Creators endpoints as routed tempo-native MPP payments through the SELAT Router, each compiled into a selat-pay call by the selat CLI.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). All steps are routed MPP, so a reachable SELAT Router (SELAT_ROUTER_URL) is required for the SELAT Router to translate the inbound Gateway-batched payment into an outbound tempo-native MPP payment to Scrape Creators.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: multi
---

# scrapecreators

## When To Use

Use when the user wants social media data scraped from Instagram, TikTok, LinkedIn, or X/Twitter — profiles, posts/reels, tweets, company pages, hashtag searches, or trending feeds. Common contexts: influencer research, social listening, competitive analysis, content research, and lead generation. Every capability is a paid Scrape Creators endpoint that runs as a **routed** tempo-native MPP payment through the SELAT Router.

## Workflow

1. Install: `selat skill install scrapecreators`
2. Run: `selat skill run scrapecreators [--handle openai] [--hashtag tech] [--region US] [--tweetUrl ...] [--linkedinUrl ...] [--instagramPostUrl ...]`
3. The CLI compiles each step in `manifest.json` into a `selat-pay` call, routes it through the SELAT Router (MPP), runs the steps in order, and prints a per-step ✓/✗ summary.

Each step is **ROUTED MPP**: the selat CLI pays the SELAT Router with a Gateway-batched payment, and the router settles a tempo-native MPP payment to `api.scrapecreators.com`. Only pass the params for the capabilities you actually need; unused steps still run against their defaults unless you scope the run.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `handle` | no | `openai` | Handle without @ for Twitter, Instagram, and TikTok profile lookups |
| `tweetUrl` | no | `https://x.com/OpenAI/status/123456` | Tweet URL for tweet-details |
| `linkedinUrl` | no | `https://linkedin.com/in/satyanadella` | LinkedIn profile URL |
| `linkedinPostUrl` | no | `https://linkedin.com/posts/somepost` | LinkedIn post URL |
| `linkedinCompanyUrl` | no | `https://linkedin.com/company/anthropic` | LinkedIn company page URL |
| `instagramUserId` | no | `12345` | Instagram numeric user ID for basic-profile |
| `instagramPostUrl` | no | `https://instagram.com/p/abc123` | Instagram post or reel URL |
| `hashtag` | no | `tech` | TikTok hashtag (without #) |
| `region` | no | `US` | Region code for the TikTok trending feed |

Outputs: each step returns the Scrape Creators JSON payload for that endpoint (profile objects, tweet/post arrays, company metadata, hashtag/feed video lists). The CLI prints `status` and the response body per step.

## Gotchas

- All steps are **routed**: they need `SELAT_ROUTER_URL` configured and the SELAT Router reachable. There is no direct rail in this skill.
- Per-step cap is $0.02; the full-run cap (`maxAmount`) is $0.24 across all 12 steps.
- Handles must be passed **without** the leading `@`; hashtags **without** the leading `#`.
- The Twitter/LinkedIn/Instagram-post endpoints expect a full URL (`url=`), not a handle.
- Instagram basic-profile takes a numeric `userId`, not a handle.
- Steps run independently (continue-across-steps): one capability can succeed while another fails — check the per-step summary.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe without paying (free 402 probe per repo convention):
  - `selat-pay GET "https://api.scrapecreators.com/v1/twitter/profile?handle=openai" --chain base --probe-only`
  - `selat-pay GET "https://api.scrapecreators.com/v1/tiktok/get-trending-feed?region=US" --chain base --probe-only`
- A `--probe-only` call returns the 402 payment requirements without settling; a successful paid run prints `status=200` and a ✓ for each step.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the merchant endpoints, methods, and prices this skill calls.
- selat-pay — https://github.com/SELAT-AI/selat-pay
