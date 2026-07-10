---
name: twitter-profile-lookup
description: Use this skill when the user wants to look up a Twitter/X account — e.g. "who is @username on Twitter?", "show me OpenAI's recent tweets", "what has Sam Altman been posting on X?", "pull this person's X profile and engagement", or social-media due diligence on a public figure or company. Fetches profile metadata (bio, followers, verified status) and recent tweets via the AIsa Twitter API (Circle x402 catalog), paid directly with Circle Gateway-batched x402.
license: Apache-2.0
compatibility: Requires the selat CLI and selat-pay with a funded Circle Agent Wallet (the runner pays on whichever chain holds your Gateway balance). Both steps are direct x402 calls settled via Circle Gateway; no SELAT Router is required.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: direct
  kind: single
---

# twitter-profile-lookup

## When To Use

Use when the user asks about a Twitter/X account: their profile (bio, follower/following counts, verified status, account age) and/or their recent tweets and engagement. Typical triggers: "who is @handle on X?", "show me their recent tweets", "what is this company posting on Twitter?", or social-media due diligence on a public figure or brand.

Do not use for protected/private accounts (they cannot be scraped) or for posting/interacting with tweets — this skill is read-only.

## Workflow

1. Install: `selat skill install twitter-profile-lookup`
2. Run: `selat skill run twitter-profile-lookup --handle openai`
3. The CLI compiles each step into a `selat-pay` call, settles the x402 payment directly (Circle Gateway-batched), runs the steps in order, and prints a per-step status summary.

Steps (both **DIRECT x402** against the Circle x402 catalog, single merchant AIsa):

- **Step 1 — AIsa** `GET /apis/v2/twitter/user/info?userName=${handle}` — profile metadata ($0.00044, probe-verified 2026-07-10).
- **Step 2 — AIsa** `GET /apis/v2/twitter/user/last_tweets?userName=${handle}` — recent tweets + engagement ($0.0036, probe-verified 2026-07-10).

Strip any leading `@` from the handle before passing it in.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `handle` | yes | `openai` | Twitter/X handle, no `@` |

Outputs:
- **Profile** — display name, handle, bio/description, follower & following counts, tweet count, profile/banner image URLs, verified status, account creation date, location and website (if set).
- **Tweets** — tweet text, like/retweet/reply counts, media attachments, timestamps, engagement metrics. Returns recent tweets, not full history.

## Gotchas

- Both steps are **direct**: they pay AIsa over x402 (Circle Gateway-batched) — no SELAT Router needed.
- Caps are a loose $5.00 spending filter per step and per run; live prices are $0.00044 (profile) + $0.0036 (last tweets) ≈ $0.004 per full run.
- Remove `@` from handles; protected/private accounts return errors with no workaround.
- Rate limiting can cause failures on rapid sequential calls — add short delays.
- Steps run independently: profile can succeed while tweets fails (or vice versa); check the per-step summary.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe without paying (free 402 probes):
  - `selat-pay GET "https://api.aisa.one/apis/v2/twitter/user/info?userName=openai" --chain base --probe-only`
  - `selat-pay GET "https://api.aisa.one/apis/v2/twitter/user/last_tweets?userName=openai" --chain base --probe-only`
- A successful run prints `status=200` for each step and a per-step summary.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the x402 endpoints this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

_Twitter/X and AIsa are third-party services; respect their terms. Data is for read-only research on public accounts._
