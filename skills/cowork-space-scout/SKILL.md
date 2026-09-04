---
name: cowork-space-scout
description: Use this skill when the user wants to scout coworking-space web design, 3D / interactive architectural showcases, or design-hub inspiration from Awwwards, Behance, Dribbble, SiteInspire, and similar — e.g. "find the best coworking space websites for design inspiration", "show me 3D co-working designs and architectural showcases", "what tech stack do top coworking brands use", "pull previews of striking coworking sites". Runs a 7-step pipeline (Perplexity design-hub search, Exa neural web search, Product Hunt, Twitter chatter, Firecrawl scrape, BuiltWith tech stack, ScreenshotOne preview) and aggregates a JSON shortlist of URLs, tech stacks, and preview assets. Paid per call across mixed rails via selat-pay (USDC via Circle Gateway), no API keys.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet. Every step routes through the SELAT Router (SELAT_ROUTER_URL). `selat skill verify` (without --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.0"
  rail: mixed
  kind: multi
---

# cowork-space-scout

Scout the web for **coworking-space design and interactive architectural
showcases**, pick the standouts, and deep-dive the top one — scrape its design
detail, fingerprint its tech stack, and capture a full-page preview. The agent
fuses the paid signal into one **aggregated JSON shortlist**: winner URLs, tech
stacks, and preview assets, plus a plain-language briefing.

## When To Use

Use when the user wants **design inspiration or competitive intel on
coworking-space websites** — "best coworking space sites", "3D co-working
designs and architectural showcases", "how do top coworking brands build their
sites (stack + motion)", "show me striking coworking web design with previews".
Works for architecture/interior-design-focused searches, a specific city, or a
specific brand's site.

Do **not** use it for lead generation / B2B enrichment (use a GTM enrichment
skill) or for outlet discovery (that's `find-twitter-influencers`).

## Workflow

1. Install: `selat skill install cowork-space-scout`
2. **Tell the user the cost before spending** — "a full scout runs the
   discovery + deep-dive pipeline and costs about $0.15 from your wallet — go
   ahead?" — and proceed only on a yes.
3. Run the discovery pass:
   `selat skill run cowork-space-scout --topic "coworking space website design" --json`
   - Step 1 – Perplexity `/search`, **domain-filtered to Awwwards + design hubs**
     (returns ranked design-shortlist candidates with URLs).
   - Step 2 – Exa neural search (broader web + architecture/interior context).
   - Step 3 – Parallel / Product Hunt (coworking product and space launches).
   - Step 4 – SELAT Twitter `advanced_search` (design chatter, brand shout-outs).
4. **Pick the top 1 design-hub URL** and its real domain from the discovery
   results (dedupe, rank by recency and wow-factor).
5. **Tell the user before the (optional) deep-dive** — "deep-diving
   <site> costs about $0.12 more — proceed?" Run the deep-dive pass on the
   winner with overridden params:
   `selat skill run cowork-space-scout --topic "<same topic>" --showcaseUrl "<winner url>" --domain "<winner domain>" --json`
   - Step 5 – Firecrawl `/v1/extract` on the showcase URL (design detail: layout,
     typography, palette, 3D/WebGL features, branding).
   - Step 6 – BuiltWith on the winner's domain (tech stack: frameworks, hosting,
     analytics, CMS).
   - Step 7 – ScreenshotOne full-page PNG of the showcase (preview asset link or
     file).
6. **Synthesize, don't dump.** Aggregate into a JSON shortlist —
   `{ rank, name, url, hub, stack, preview, why }` — plus a short plain-language
   briefing (top 3 picks, what makes each stand out, which stack pattern is
   dominant). Keep raw JSON, endpoint URLs, and wallet details out of what you
   show the user; give them the URLs, the tech stacks, and the preview asset
   links.

### Cost ladder (agent decision guide)

Every step is optional after the discovery pass — run the whole thing or, for a
budget scout, just Steps 1–2 + 4 (~$0.02). Deep-dive steps exist so the skill
can answer "stack + preview" questions, not because every scout needs them.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `topic` | yes | `coworking space website design` | Core search subject (Perplexity + Exa + Product Hunt + Twitter). Try `3d coworking space site`, `coworking space architecture portfolio`, or add a city: `coworking space website design Berlin`. |
| `showcaseUrl` | no | `https://www.awwwards.com/websites/co-working-space/` | Top showcase URL for the deep-dive (Firecrawl + ScreenshotOne). Override to the winner from the discovery pass. |
| `domain` | no | `zenhouse.io` | Winner's real domain for BuiltWith. Override to the winner's domain. |

**Output:** an aggregated JSON shortlist — `{ rank, name, url, hub, stack,
preview, why }` per pick — with a plain-language briefing; raw per-step JSON is
never relayed verbatim.

## Gotchas

- **`showcaseUrl` / `domain` are MUST-override params.** Leave them at their
  defaults and the deep-dive is generic. Always pick the winner from discovery
  results first, then re-run with the overrides.
- **String-only `${param}` substitution.** `max_results`, `numResults`,
  `full_page`, `viewport_*`, `device_scale_factor` are real integers/booleans —
  they must stay **static values in the manifest body**, not `${…}` params (a
  numeric field wired as a string 4xxs). Adjust them only in a hand-built
  `selat-pay` call.
- **`search_domain_filter` is an array, not a param.** It is baked static to
  Awwwards/Behance/Dribbble/SiteInspire/Land-book/Godly. To filter to a single
  custom domain, hand-build the Perplexity call with
  `"search_domain_filter": ["<domain>"]` (≤20 domains) instead of mangling the
  manifest.
- **POST params go in the body, GET in the query string.** Steps 1–3 and 5–7 are
  POST (body); Step 4 is GET (query). Wiring a POST param as `?k=v` often
  returns no 402 challenge.
- **The gateway settles before the upstream validates.** A malformed body still
  costs the full price. Schemas here are pinned from each gateway's 402
  `bazaar` schema / live probe — match them exactly.
- **Tavily is deliberately not used.** `x402.tavily.com/search` is down in the
  reliability registry and the Locus mirror quotes $0.09–$0.22/call — Perplexity
  + Exa cover discovery cheaper.
- **Live prices move.** These were the live router quotes when authored
  (Perplexity ~$0.0105, Exa ~$0.0074, Parallel ~$0.0105, Twitter ~$0.001,
  Firecrawl ~$0.0053, BuiltWith ~$0.0578, ScreenshotOne ~$0.0578). `maxAmount`
  is a spending filter with headroom, not the price.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe — probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/cowork-space-scout`
- Live probe (no pay), confirms rail + price per step without settling:
  ```bash
  selat skill verify ./skills/cowork-space-scout
  ```
  A served step prints `mode=routed-… price=$X`; every step must be reachable
  and ≤ its `maxAmount`.
- Paid run prints `status=200` per step and the aggregated JSON.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — catalogue endpoints, request schemas, and live prices.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay