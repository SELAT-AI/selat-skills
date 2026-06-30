---
name: vc-ai-infra-scout
description: "Use this skill when a VC wants to source emerging AI-infrastructure, crypto-AI, robotics, or agentic-payments deals before the round — e.g. \"scout new AI inference infra startups\", \"who's building agent infra / GPU compute / eval-observability that hasn't raised yet\", \"find founders shipping vector/data infra on HN and Product Hunt\", \"give me a deal shortlist for my AI-infra thesis\", \"what pre-seed/seed rounds are people announcing on Twitter and LinkedIn and what's the thesis behind them\", crypto-AI: \"scout decentralized-AI / DePIN-for-AI deals\", \"find on-chain AI agent projects to back\", robotics: \"scout robotics foundation-model / humanoid / embodied-AI / sim-to-real startups\", or agentic payments: \"find agent-payment-rail / agent-commerce / x402 / stablecoin-settlement startups\". Discovers companies + founders from Hacker News, Product Hunt, the web (Exa), and Twitter/X; searches recent pre-seed/seed fundraising news on Twitter/X and LinkedIn and summarizes the tweets of investors at the funds leading those rounds to distill the live thesis; then enriches the top lead (Apollo). Dedupes across sources, ranks by signal, flags who has NOT raised yet, and outputs a shortlist with links + a suggested-outreach note. Paid per call across two rails via selat-pay (USDC via Circle Gateway), no API keys."
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Agent Wallet. Every step is routed through the SELAT Router, so a reachable SELAT_ROUTER_URL is required. `selat skill verify` (no --pay) is free and needs no funded wallet.
metadata:
  author: SELAT-AI
  version: "1.2"
  rail: routed
  kind: multi
---

# vc-ai-infra-scout

A deal-sourcing scout for a VC running an **AI-infrastructure thesis** that spans
**crypto-AI / decentralized-AI**, **robotics / embodied-AI**, and **agentic
payments**. It surfaces emerging companies and
founders from **Hacker News**, **Product Hunt**, the **web** (Exa), and
**Twitter/X** (Fiber); **searches recent pre-seed/seed fundraising news on
Twitter/X and LinkedIn** and **summarizes the tweets of the investors at the funds
leading those rounds** to distill the live thesis; then **enriches** the single
most promising lead (Apollo). The skill pays for the data across **two x402
protocols** — **routed MPP** (Serper, Fiber, Apollo) and **routed x402 on Base**
(Exa). The agent does the work *around* the paid data: dedupe across sources, rank
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

This skill spans **two x402 protocols**, both **routed** through the SELAT Router,
so its `rail` is `routed`:

- **routed MPP** — Serper HN, Serper PH, the Serper LinkedIn-scoped fundraising
  search, all three Fiber twitter/search calls (founder buzz, fundraising news,
  lead-investor tweets), and Apollo (people-search + org-enrichment) settle
  `mode=routed-mpp` through the SELAT Router.
- **routed x402 on Base** — Exa (`api.exa.ai`) serves a native x402 challenge; the
  router settles it on Base (`mode=routed-x402`).

So: **8 routed MPP** steps and **1 routed x402 on Base** step (Exa). Every step
requires a reachable `SELAT_ROUTER_URL`. The `selat` CLI auto-detects each step's
protocol at call time. Full-run `maxAmount` is `$0.40` against a live total of
roughly `$0.15`.

## Workflow

1. Install: `selat skill install vc-ai-infra-scout`
2. Run end-to-end:
   `selat skill run vc-ai-infra-scout --thesis "<thesis>" --twitterQuery "<founders>" --fundraisingQuery "<raises>" --investorQuery "<funds>" --domain <domain>`
3. The CLI compiles each step into a `selat-pay` call and prints each result.

Recommended agent procedure (cheapest-first; stop early when the picture is clear):

1. **Discover on Hacker News** — Serper `POST /serper/search` with
   `${thesis} site:news.ycombinator.com` (routed MPP, ~$0.0021). Pull Show HN /
   launch threads naming new infra projects.
2. **Discover on Product Hunt** — Serper `POST /serper/search` with
   `${thesis} site:producthunt.com` (routed MPP, ~$0.0021).
3. **Add launch + web context** — Exa `POST /search` for
   `${thesis} startup launch funding` (routed x402 on Base, ~$0.0073): recency and
   early chatter with text snippets + URLs.
4. **Scan Twitter/X for founders & buzz** — Fiber `POST /v1/twitter/search` with
   `${twitterQuery}` (routed MPP, ~$0.042). Returns tweets matching a **keyword**,
   so use it to *discover* founders shipping in public.
5. **Fundraising news on Twitter/X** — Fiber `POST /v1/twitter/search` with
   `${fundraisingQuery}` (routed MPP, ~$0.042): recent pre-seed/seed raise
   announcements and the "we're thrilled to announce" threads. Extract the company,
   round, amount, and the **lead investors** named.
6. **Fundraising news on LinkedIn** — Serper `POST /serper/search` with
   `${fundraisingQuery} site:linkedin.com/posts` (routed MPP, ~$0.0021): LinkedIn
   funding-announcement posts indexed by Google. Cross-reference against the Twitter
   raises; LinkedIn often names the partner who led.
7. **Distill the investor thesis** — take the funds leading those rounds (from steps
   5–6) and run Fiber `POST /v1/twitter/search` with `${investorQuery}` set to their
   handle/name (routed MPP, ~$0.042). Summarize those tweets into the *live thesis*
   the lead funds are signalling — what they say they're backing and why.
8. **Enrich + shortlist.** For the most promising company/founder:
   - Founder shortlist — Apollo `POST /apollo/people-search` keyed on
     `${thesis} founder` (routed MPP, ~$0.00525).
   - Company enrichment — Apollo `POST /apollo/org-enrichment` on `${domain}`
     (routed MPP, ~$0.0084): headcount, location, links.
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

- **Two rails, both routed.** Exa settles `routed-x402` on Base; every other step
  settles `routed-mpp` — all through the SELAT Router, so a reachable
  `SELAT_ROUTER_URL` is required for every step.
- **GET vs POST.** Every step here is **POST** (params in `body`) — Serper (HN, PH,
  LinkedIn), Exa, all three Fiber twitter/search calls, and both Apollo calls.
- **Site-scoped search reaches HN, Product Hunt, and LinkedIn.** There is no
  dedicated HN/PH/LinkedIn merchant; the Serper `site:` operator does it
  (`site:news.ycombinator.com`, `site:producthunt.com`,
  `site:linkedin.com/posts`). LinkedIn is reached through Google's index of public
  posts, so coverage is the funding announcements Google has indexed — corroborate
  against the Twitter fundraising step rather than treating either as complete.
- **Three Fiber twitter/search calls, different intent.** Step 4 (`${twitterQuery}`)
  finds **founders**; step 5 (`${fundraisingQuery}`) finds **raise announcements**;
  step 7 (`${investorQuery}`) finds **investors/funds**. Fiber returns tweets
  matching a **keyword**, not a known handle — discover handles from the results,
  then refine `investorQuery` to the lead funds named in the fundraising steps.
- **Recency lives in the query, not a date filter.** These are keyword searches, not
  a structured rounds database — put recency cues in `fundraisingQuery` (e.g.
  "raised this week / seed round 2026") and have the agent filter results by date.
- **`maxAmount` is a guardrail, not the price.** Per-step caps run `$0.02`–`$0.08`;
  the full-run cap is `$0.40`. Live quotes: Serper (each) ~$0.0021, Exa ~$0.0073,
  Fiber (each) ~$0.042, Apollo people-search ~$0.00525, Apollo org-enrichment
  ~$0.0084 (live total ≈ $0.15).
- **The live 402 is the source of truth.** If a step stops serving a challenge,
  `selat skill verify` flags the drift — omit it and re-add when the gateway
  serves it again.
- **AIsa endpoints are excluded.** This skill never calls `api.aisa.one`.

## Validation

> `--chain base` in the probe commands below is only the flag `selat-pay` requires today — a probe reads a free, chain-independent quote and never settles. A real paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Static: `selat skill validate ./skills/vc-ai-infra-scout`
- Live gate (free): `selat skill verify ./skills/vc-ai-infra-scout --thesis "AI inference infrastructure" --twitterQuery "AI inference infra founder" --fundraisingQuery "AI infrastructure startup raised seed pre-seed funding round" --investorQuery "AI infra seed fund partner" --domain modal.com`
- Paid confirm (settles real 200s): add `--pay` to the verify command.
- Single-step probes (no pay):
  - `selat-pay POST "https://mpp.orthogonal.com/fiber/v1/twitter/search" --body '{"query":"AI infrastructure startup raised seed pre-seed round"}' --chain base --probe-only`
  - `selat-pay POST "https://mpp.orthogonal.com/serper/search" --body '{"q":"AI infrastructure startup raised seed funding site:linkedin.com/posts"}' --chain base --probe-only`

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoints, rails, and live prices.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay
