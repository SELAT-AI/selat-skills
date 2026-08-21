---
name: site-presence-brief
description: Use this skill when the user wants a quick read on a public website plus what the open web is saying about it — e.g. "check out this homepage", "what does this site claim and is anyone talking about it", "scrape this URL and give me context", "presence brief for <brand>". Scrapes the page, runs a cited web search on a topic, and mints a simple OG preview card. Paid per call over mixed rails via the SELAT Router.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Gateway balance. Routed steps need a reachable SELAT Router (SELAT_ROUTER_URL). `selat skill verify` without --pay is free and needs no wallet.
metadata:
  author: comzzy-comzzy
  version: "1.0"
  rail: mixed
  kind: multi
---

# site-presence-brief

Three paid steps, one brief:

1. **Scrape** the page (StableEnrich Firecrawl)  
2. **Search** the open web for a topic (Perplexity)  
3. **Mint** a plain OG card (bip-rep)

You stitch those into something a human can skim — not a dump of three JSON blobs.

## When To Use

Use when someone drops a URL and wants:

- what the page actually says  
- whether the web has recent chatter about the brand/product  
- a simple share card they can reuse  

Skip it for pure people-enrichment, deep multi-ticker research, or Twitter-only work — other hub skills cover those better.

## Rails

Mixed, all **routed** through the SELAT Router:

| Step | Host | Mode | Live quote (approx) |
|------|------|------|---------------------|
| Scrape | `stableenrich.dev` | routed-mpp | ~$0.013 |
| Search | `pplx.x402.paysponge.com` | routed-x402 | ~$0.011 |
| OG card | `og.bip-rep.com` | routed-x402 | ~$0.011 |

Full-run cap in the manifest: **$0.10** (headroom over ~$0.035 of live quotes).

## Workflow

1. Install: `selat skill install site-presence-brief`
2. **Tell the user the cost before spending** — roughly **$0.03–0.05** for all three steps from their Gateway balance. Proceed only on a yes.
3. Run:
   ```bash
   selat skill run site-presence-brief \
     --url "https://example.com" \
     --topic "Example Co product launch" \
     --title "Example Co" \
     --subtitle "What the site says" \
     --recency month
   ```
4. Read the three step responses.
5. **Tell the user** in plain language:
   - what the page claims (title, main pitch, anything concrete)  
   - what recent web sources say (with links)  
   - that an OG card was generated (mention size; don’t paste megabytes of base64 unless they ask)

Keep raw endpoint URLs and wallet noise out of the user-facing summary.

## Inputs And Outputs

| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `url` | yes | `https://www.selat.ai` | Page to scrape |
| `topic` | yes | `SELAT agent payments` | Web search query |
| `title` | no | `SELAT` | OG card title |
| `subtitle` | no | `Agent commerce brief` | OG card second line |
| `recency` | no | `month` | `hour` \| `day` \| `week` \| `month` \| `year` |

Output: three paid JSON payloads the agent synthesizes into one short brief.

## Gotchas

- **Payment settles before the upstream validates the body.** Wrong params can still cost money. Stick to the fields in `references/endpoints.md`.
- **Scrape only public https pages.** Auth walls and empty shells return thin content — say so instead of inventing.
- **OG step returns PNG as base64.** Summarize; don’t flood the chat unless the user wants the file.
- **`${param}` is always a string.** Don’t try to jam integers into the manifest body via substitution.
- **Settlement chain is whatever Gateway is funded on** (often Polygon after Eco). You don’t pick it in the manifest.

## Validation

```bash
selat skill validate ./skills/site-presence-brief
selat skill verify   ./skills/site-presence-brief
# optional paid smoke (uses real USDC):
selat skill verify   ./skills/site-presence-brief --pay
```

## References

- [`references/endpoints.md`](references/endpoints.md) — serviceUrls, bodies, live quotes  
- [`evals/evals.json`](evals/evals.json) — trigger / refusal cases  
