---
name: youtube-transcript
description: Use this skill when the user wants a YouTube video's spoken transcript or a summary of what was said on video — e.g. "get the transcript for this YouTube link", "what does this video say", "transcribe https://youtube.com/watch?v=…", "pull captions from this talk". Fetches the transcript via Scrape Creators over MPP on Tempo through the SELAT Router (USDC), no YouTube API key.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Gateway balance (settles on whichever supported chain the balance sits on). The routed MPP step needs a reachable SELAT Router (SELAT_ROUTER_URL); `selat skill verify` (without --pay) is free and needs no funded wallet.
metadata:
  author: Preciousbas
  version: "1.0"
  rail: routed
  kind: single
---

# youtube-transcript

Fetch the **spoken transcript** of a YouTube video via **Scrape Creators** on the
Orthogonal MPP gateway, **routed through the SELAT Router**. One cheap GET (~$0.02);
the agent then summarizes or quotes the transcript in plain language.

## When To Use

Use when the user pastes a **YouTube watch URL** and wants what was said — transcript,
captions, or a summary of the talk — without a YouTube Data API key.

Do **not** use for Twitter/X, Instagram, TikTok, or LinkedIn (see `scrapecreators` /
`twitter-research`). Do not use for general web search (`perplexity-search`) or for
scraping an arbitrary non-YouTube page.

## Rails

Single paid step, **MPP on Tempo**, routed via the SELAT Router (`rail: routed` /
manifest step rail `MPP on Tempo`):

- Live probe quote ≈ **$0.021** Gateway-batched USDC (catalogue floor $0.02).

## Workflow

1. Install: `selat skill install youtube-transcript`
2. **Tell the user the cost before spending** — "fetching this YouTube transcript costs
   about $0.02 from your wallet — go ahead?" — and proceed only on a yes.
3. Run:
   `selat skill run youtube-transcript --videoUrl "https://www.youtube.com/watch?v=…"`
4. The CLI compiles the step into one `selat-pay` GET and prints the JSON/transcript.
5. **Synthesize, don't dump.** Give the user a short plain-language summary (or the
   sections they asked for). Keep raw JSON and gateway URLs out of what you show them.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `videoUrl` | yes | `https://www.youtube.com/watch?v=YxXrU0I6vT0` | Full YouTube watch URL (`youtube.com/watch?v=` or `youtu.be/`). |

Output: transcript payload from Scrape Creators (spoken text / cue segments). The agent
reads it and reports a summary or excerpts.

## Gotchas

- **Wire the Orthogonal `serviceUrl`, not a descriptive provider host.** Manifest URL
  must stay on `https://mpp.orthogonal.com/scrapecreators/…` or verify fails with no
  challenge.
- **Use query param `url` with the full watch link.** A bare `videoId` query returns
  upstream 400 (probe shows router 502 / missing 402).
- **Payment settles before upstream body/path validation** on paid rails — a bad URL
  can still cost ~$0.02. Confirm the link is a normal YouTube watch URL first.
- **`maxAmount` is a filter with headroom** (skill cap $0.10) over the ~$0.021 live quote.
- This skill is **YouTube-only**; it is not a replacement for the broader
  `scrapecreators` multi-network skill.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe — probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/youtube-transcript`
- Live probe (no pay):
  ```bash
  selat-pay GET \
    "https://mpp.orthogonal.com/scrapecreators/v1/youtube/video/transcript?url=https://www.youtube.com/watch?v=YxXrU0I6vT0" \
    --chain base --probe-only
  ```
  A served endpoint prints `detected mpp=yes … mode=routed-mpp price=$0.021000`.
- Paid run prints `status=200` and the transcript payload.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — catalogue endpoint + schema notes.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
