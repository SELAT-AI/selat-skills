---
name: twitter-profile-lookup
description: Use this skill when the user wants to look up a Twitter/X account — e.g. "who is @username on Twitter?", "show me OpenAI's recent tweets", "what has Sam Altman been posting on X?", "pull this person's X profile and engagement", or social-media due diligence on a public figure or company. Fetches profile metadata (bio, followers, verified status) and recent tweets via Scrape Creators, routed through the SELAT Router as a tempo-native MPP payment.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). Routed steps require a reachable SELAT Router (SELAT_ROUTER_URL) for MPP settlement.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: routed
  kind: single
---

# twitter-profile-lookup

## When To Use

Use when the user asks about a Twitter/X account: their profile (bio, follower/following counts, verified status, account age) and/or their recent tweets and engagement. Typical triggers: "who is @handle on X?", "show me their recent tweets", "what is this company posting on Twitter?", or social-media due diligence on a public figure or brand.

Do not use for protected/private accounts (they cannot be scraped) or for posting/interacting with tweets — this skill is read-only.

## Workflow

1. Install: `selat skill install twitter-profile-lookup`
2. Run: `selat skill run twitter-profile-lookup --handle openai [--trim true]`
3. The CLI compiles each step into a `selat-pay` call, settles the MPP payment through the SELAT Router, runs the steps in order, and prints a per-step status summary.

Steps (both **ROUTED MPP** via the SELAT Router, single merchant Scrape Creators):

- **Step 1 — Scrape Creators** `GET /v1/twitter/profile?handle=${handle}` — profile metadata.
- **Step 2 — Scrape Creators** `GET /v1/twitter/user-tweets?handle=${handle}&trim=${trim}` — recent tweets + engagement.

Strip any leading `@` from the handle before passing it in.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `handle` | yes | `openai` | Twitter/X handle, no `@` |
| `trim` | no | `false` | `"true"` for a trimmed tweets response |

Outputs:
- **Profile** — display name, handle, bio/description, follower & following counts, tweet count, profile/banner image URLs, verified status, account creation date, location and website (if set).
- **Tweets** — tweet text, like/retweet/reply counts, media attachments, timestamps, engagement metrics. Returns recent tweets, not full history.

## Gotchas

- Both steps are **routed**: they need `SELAT_ROUTER_URL` configured and the router reachable for MPP settlement.
- Per-step cap: $0.02 each; a full run caps at $0.04 (`maxAmount`).
- Remove `@` from handles; protected/private accounts return errors with no workaround.
- The upstream may transiently return `success: false` — retry after a few seconds.
- Rate limiting can cause failures on rapid sequential calls — add short delays.
- Steps run independently: profile can succeed while tweets fails (or vice versa); check the per-step summary.

## Validation

- Probe without paying (free 402 probes):
  - `selat-pay GET "https://api.scrapecreators.com/v1/twitter/profile?handle=openai" --chain base --probe-only`
  - `selat-pay GET "https://api.scrapecreators.com/v1/twitter/user-tweets?handle=openai&trim=false" --chain base --probe-only`
- A successful run prints `status=200` for each step and a per-step summary.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the MPP endpoints this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

_Twitter/X and Scrape Creators are third-party services; respect their terms. Data is for read-only research on public accounts._
