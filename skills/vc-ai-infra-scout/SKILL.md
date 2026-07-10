---
name: vc-ai-infra-scout
description: "Use this skill when a VC wants to source emerging AI-infrastructure, crypto-AI, robotics, or agentic-payments deals before the round — e.g. \"scout new AI inference infra startups\", \"who's building agent infra / GPU compute / eval-observability that hasn't raised yet\", \"find founders shipping vector/data infra on HN and Product Hunt\", \"give me a deal shortlist for my AI-infra thesis\", \"what pre-seed/seed rounds are people announcing on Twitter and LinkedIn and what's the thesis behind them\", crypto-AI: \"scout decentralized-AI / DePIN-for-AI deals\", \"find on-chain AI agent projects to back\", robotics: \"scout robotics foundation-model / humanoid / embodied-AI / sim-to-real startups\", or agentic payments: \"find agent-payment-rail / agent-commerce / x402 / stablecoin-settlement startups\". Discovers companies + founders from Hacker News, Product Hunt, the web (Exa), and Twitter/X; searches recent pre-seed/seed fundraising news on Twitter/X and LinkedIn and summarizes the tweets of investors at the funds leading those rounds to distill the live thesis; then enriches the top lead (Apollo). Dedupes across sources, ranks by signal, flags who has NOT raised yet, and outputs a shortlist with links + a suggested-outreach note. Paid per call across mixed rails via selat-pay (USDC via Circle Gateway), no API keys."
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet. Routed steps require a reachable SELAT_ROUTER_URL; direct Circle x402 steps use Gateway-batched payments. `selat skill verify` (no --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.3"
  rail: mixed
  kind: multi
---

# vc-ai-infra-scout

A deal-sourcing scout for a VC running an **AI-infrastructure thesis** that spans
**crypto-AI / decentralized-AI**, **robotics / embodied-AI**, and **agentic
payments**. It surfaces emerging companies and
founders from **Hacker News** (Tavily), **Product Hunt** (Parallel), the **web**
(Exa), and **Twitter/X** (AIsa advanced search); **searches recent pre-seed/seed fundraising news on
Twitter/X and LinkedIn** and **summarizes the tweets of the investors at the funds
leading those rounds** to distill the live thesis; then **enriches** the single
most promising lead (Apollo). The skill pays for the data across **mixed rails**:
**direct Circle x402** (Tavily + AIsa), **routed MPP** (Parallel + Apollo), and
**routed x402 on Base** (Exa). The agent does the work *around* the paid data: dedupe across sources, rank
by signal (traction, recency, founder pedigree), distill the investor thesis from
lead-fund tweets, flag who has **not** raised yet to pre-empt the round, and output
a shortlist with links + a suggested-outreach note.

## When To Use

Use when a VC wants a cross-source deal shortlist for an AI-infra sub-thesis
(inference/serving, GPU & compute, training stacks, vector/data infra, agent
infra, eval/observability, model-ops), a **crypto-AI** angle (decentralized
compute/GPU, on-chain AI agents, DePIN-for-AI), a **robotics / embodied-AI** angle
(robotics foundation models, humanoid, sim-to-real, actuation/sensor stacks), or an
**agentic-payments** angle (agent-payment rails, agent commerce, x402/stablecoin
agent settlement), **or** wants
to read the fundraising news the ecosystem is announcing on Twitter/X and LinkedIn
and distill the thesis the lead funds are signalling. Pick this over a single
search when the value is in *fusing* discovery sources, reading the recent-raise
chatter across social, distilling the investor thesis from the funds leading
rounds, and triaging down to one enriched lead with a reach-out note. Every call is
a paid x402/MPP service; the agent does the dedupe, ranking, thesis distillation,
not-yet-raised flagging, and synthesis around the paid data.

## Rails

This skill spans **mixed rails**, so its `rail` is `mixed`:

- **direct Circle x402** — Tavily advanced search covers HN and LinkedIn public
  posts, while AIsa advanced_search covers Twitter/X founder buzz, fundraising
  announcements, and investor/fund thesis tweets.
- **routed MPP** — Parallel covers Product Hunt discovery, and Apollo covers
  people-search + org-enrichment through the SELAT Router.
- **routed x402 on Base** — Exa (`api.exa.ai`) serves a native x402 challenge; the
  router settles it on Base (`mode=routed-x402`).

So: **5 direct Circle x402** steps, **3 routed MPP** steps, and **1 routed x402 on
Base** step. The `selat` CLI auto-detects each step's protocol at call time.
Full-run `maxAmount` is `$0.40`.

## Workflow

1. Install: `selat skill install vc-ai-infra-scout`
2. Run end-to-end:
   `selat skill run vc-ai-infra-scout --thesis "<thesis>" --twitterQuery "<founders>" --fundraisingQuery "<raises>" --investorQuery "<funds>" --domain <domain>`
3. The CLI compiles each step into a `selat-pay` call and prints each result.

Recommended agent procedure (cheapest-first; stop early when the picture is clear):

1. **Discover on Hacker News** — Tavily `POST /search` with
   `${thesis} site:news.ycombinator.com` (direct Circle x402). Pull Show HN /
   launch threads naming new infra projects.
2. **Discover on Product Hunt** — Parallel `POST /api/search` with
   `${thesis} site:producthunt.com` (routed MPP).
3. **Add launch + web context** — Exa `POST /search` for
   `${thesis} startup launch funding` (routed x402 on Base, ~$0.0073): recency and
   early chatter with text snippets + URLs.
4. **Scan Twitter/X for founders & buzz** — AIsa `GET /apis/v2/twitter/tweet/advanced_search` with
   `${twitterQuery}` (direct Circle x402). Returns recent tweets matching a **keyword**,
   so use it to *discover* founders shipping in public.
5. **Fundraising news on Twitter/X** — AIsa advanced_search with
   `${fundraisingQuery}` (direct Circle x402): recent pre-seed/seed raise
   announcements and the "we're thrilled to announce" threads. Extract the company,
   round, amount, and the **lead investors** named.
6. **Fundraising news on LinkedIn** — Tavily `POST /search` with
   `${fundraisingQuery} site:linkedin.com/posts` (direct Circle x402): LinkedIn
   funding-announcement posts indexed by Google. Cross-reference against the Twitter
   raises; LinkedIn often names the partner who led.
7. **Distill the investor thesis** — take the funds leading those rounds (from steps
   5–6) and run AIsa advanced_search with `${investorQuery}` set to their
   handle/name (direct Circle x402). Summarize those tweets into the *live thesis*
   the lead funds are signalling — what they say they're backing and why.
8. **Enrich + shortlist.** For the most promising company/founder:
   - Founder shortlist — Apollo `POST /apollo/people-search` keyed on
     `${thesis} founder` (routed MPP).
   - Company enrichment — Apollo `POST /apollo/org-enrichment` on `${domain}`
     (routed MPP): headcount, location, links.
9. **Flag who has NOT raised yet.** Cross the fundraising chatter + enrichment
   against the discovery set and explicitly call out promising teams with **no
   announced round** — the pre-empt-the-round targets.

Then synthesize: the **distilled lead-fund thesis** (what the funds leading recent
pre-seed/seed rounds are backing), a ranked **shortlist** (company, founder, source
links, signal notes, raised-vs-not flag), and a short **suggested-outreach note**.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `thesis` | yes | `AI inference infrastructure` | Sub-thesis keyword for HN/PH/web discovery and the founder shortlist — AI-infra, crypto-AI, robotics/embodied-AI, or agentic payments. |
| `twitterQuery` | no | `AI inference infra founder` | Twitter/X keyword search for **founder** buzz; defaults conceptually to the thesis. |
| `fundraisingQuery` | no | `AI infrastructure startup raised seed pre-seed funding round` | Keyword query for **fundraising news**, used for both the Twitter/X and the LinkedIn fundraising searches. |
| `investorQuery` | no | `AI infra seed fund partner thesis` | Twitter/X keyword search for **investor/fund** chatter — set to the funds leading the rounds surfaced by the fundraising searches. |
| `domain` | no | `modal.com` | A surfaced company's domain for the enrichment step. |

Output: per-step JSON (HN results, Product Hunt results, web context, founder
tweets, Twitter fundraising-announcement tweets, LinkedIn funding-announcement
posts, lead-investor tweets, a founder shortlist, and company enrichment) that the
agent dedupes, ranks, and synthesizes into a distilled lead-fund thesis, a deal
shortlist with links and a raised-vs-not flag per lead, and a suggested-outreach
note for the top pick.

## Gotchas

- **Mixed rails.** Tavily and AIsa are direct Circle x402; Parallel and Apollo are
  routed MPP; Exa is routed x402 on Base.
- **GET vs POST.** Tavily, Parallel, Exa, and Apollo are **POST**. AIsa advanced
  Twitter/X search is **GET** with `query` and `queryType=Latest`.
- **Site-scoped search reaches HN, Product Hunt, and LinkedIn.** There is no
  dedicated HN/PH/LinkedIn merchant here; use `site:` scoped searches with Tavily
  for HN/LinkedIn and Parallel for Product Hunt. LinkedIn coverage is public indexed
  posts, so corroborate against the Twitter fundraising step rather than treating
  either as complete.
- **Three AIsa advanced_search calls, different intent.** Step 4 (`${twitterQuery}`)
  finds **founders**; step 5 (`${fundraisingQuery}`) finds **raise announcements**;
  step 7 (`${investorQuery}`) finds **investors/funds**. AIsa returns tweets
  matching a **keyword**, not a known handle — discover handles from the results,
  then refine `investorQuery` to the lead funds named in the fundraising steps.
- **Recency lives in the query, not a date filter.** These are keyword searches, not
  a structured rounds database — put recency cues in `fundraisingQuery` (e.g.
  "raised this week / seed round 2026") and have the agent filter results by date.
- **`maxAmount` is a guardrail, not the price.** Per-step caps run `$0.02`–`$0.05`;
  the full-run cap is `$0.40`. The live 402 challenge remains the price source of
  truth.
- **The live 402 is the source of truth.** If a step stops serving a challenge,
  `selat skill verify` flags the drift — omit it and re-add when the gateway
  serves it again.
- **No third-party Twitter-scraper merchants.** Twitter/X comes from AIsa
  advanced_search; site-scoped search comes from Tavily and Parallel.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/vc-ai-infra-scout`
- Live gate (free): `selat skill verify ./skills/vc-ai-infra-scout --thesis "AI inference infrastructure" --twitterQuery "AI inference infra founder" --fundraisingQuery "AI infrastructure startup raised seed pre-seed funding round" --investorQuery "AI infra seed fund partner" --domain modal.com`
- Paid confirm (settles real 200s): add `--pay` to the verify command.
- Single-step probes (no pay):
  - `selat-pay GET "https://api.aisa.one/apis/v2/twitter/tweet/advanced_search?query=AI%20infrastructure%20startup%20raised%20seed%20pre-seed%20round&queryType=Latest" --chain base --probe-only`
  - `selat-pay POST "https://x402.tavily.com/search" --body '{"query":"AI infrastructure startup raised seed funding site:linkedin.com/posts","search_depth":"advanced","max_results":10,"topic":"general"}' --chain base --probe-only`

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoints, rails, and live prices.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
