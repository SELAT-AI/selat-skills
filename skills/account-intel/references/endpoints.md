# Endpoints — account-intel

Entity-centric footprint & reputation intelligence over **two payment
protocols** — x402 via Circle Gateway and MPP on Tempo — paid per call via
selat-pay (USDC via Circle Gateway), no API keys. Profiles ONE entity across
X/Twitter, YouTube, the web (news + citations), and holdings context from a
user-supplied associated EVM wallet. Because the runner executes all six steps,
that wallet address is required and must be non-zero.

## Endpoints used

| # | Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|---|
| 1 | X/Twitter profile — SELAT-native | GET | `https://catalog.selat.ai/twitter/user/info?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 2 | X/Twitter recent tweets — SELAT-native | GET | `https://catalog.selat.ai/twitter/user/last_tweets?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 3 | YouTube presence — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/youtube/search?query=${name}` | MPP on Tempo | $0.021 |
| 4 | Web reputation / news — Brave | POST | `https://brave.mpp.paywithlocus.com/brave/news-search` | MPP on Tempo | $0.03675 |
| 5 | Web context / citations — Exa | POST | `https://api.exa.ai/search` | MPP on Tempo | $0.00735 |
| 6 | On-chain wallet holdings — Alchemy | POST | `https://x402.alchemy.com/data/v1/assets/tokens/by-address` | x402 via Circle Gateway | $0.001 |

Prices probe-verified 2026-08-29. Live total: **$0.06810**. Per-step caps
sum to **$0.28** (`$0.05`, `$0.05`, `$0.05`, `$0.06`, `$0.05`, `$0.02`).
The top-level `$0.50` `maxAmount` is a fallback per-step cap, not a cumulative
run cap; all current steps override it. The cumulative guardrail is the armed
session budget.

## Rails & providers

This skill declares **two protocols** and currently observes two routed modes:

- **x402 via Circle Gateway / `routed-x402`** — the two SELAT-native X/Twitter
  reads and Alchemy tokens-by-wallet.
- **MPP on Tempo / `routed-mpp`** — Scrape Creators YouTube search, Brave news
  search (via Locus), and Exa web search settle through the SELAT Router.

Do not infer direct versus routed settlement from the provider hostname. The
free live probe is authoritative. All six endpoints reported routed modes on
2026-08-29; older reliability snapshots recorded some x402 calls as direct.

## Live probes (free; no wallet)

```bash
# x402 via Circle Gateway (GET query) — SELAT-native X/Twitter
selat-pay GET "https://catalog.selat.ai/twitter/user/info?userName=OpenAI" \
  --chain base --probe-only --live-probe
selat-pay GET "https://catalog.selat.ai/twitter/user/last_tweets?userName=OpenAI" \
  --chain base --probe-only --live-probe
# MPP on Tempo (GET query) — Scrape Creators YouTube
selat-pay GET "https://mpp.orthogonal.com/scrapecreators/v1/youtube/search?query=OpenAI" \
  --chain base --probe-only --live-probe

# MPP (POST body) — Brave news
selat-pay POST "https://brave.mpp.paywithlocus.com/brave/news-search" \
  --body '{"q":"OpenAI"}' --chain base --probe-only --live-probe

# MPP on Tempo (POST body) — Exa citations
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"OpenAI","numResults":5}' --chain base --probe-only --live-probe

# x402 via Circle Gateway (POST body) — Alchemy wallet holdings
selat-pay POST "https://x402.alchemy.com/data/v1/assets/tokens/by-address" \
  --body '{"addresses":[{"address":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","networks":["eth-mainnet"]}],"withMetadata":true,"withPrices":true,"includeNativeTokens":true,"includeErc20Tokens":true}' \
  --chain base --probe-only --live-probe
```

A served endpoint prints `detected ... price=$X`. On 2026-08-29 the two
X/Twitter steps and Alchemy reported `routed-x402`; Scrape Creators, Brave, and
Exa reported `routed-mpp`.
