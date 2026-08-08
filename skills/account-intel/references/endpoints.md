# Endpoints — account-intel

Entity-centric footprint & reputation intelligence over **three rails** —
Circle Gateway nanopayment (Alchemy on-chain), MPP web news + YouTube
(Brave), and x402 web citations (Exa) — paid per call via selat-pay (USDC via
Circle Gateway), no API keys. Profiles ONE entity across X/Twitter, YouTube, the
web (news + citations), and any associated on-chain token.

## Endpoints used

| # | Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|---|
| 1 | X/Twitter profile — SELAT-native | GET | `https://catalog.selat.ai/twitter/user/info?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 2 | X/Twitter recent tweets — SELAT-native | GET | `https://catalog.selat.ai/twitter/user/last_tweets?userName=${handle}` | x402 via Circle Gateway | $0.001 |
| 3 | YouTube presence — Scrape Creators | GET | `https://mpp.orthogonal.com/scrapecreators/v1/youtube/search?query=${name}` | MPP on Tempo | $0.021 |
| 4 | Web reputation / news — Brave | POST | `https://brave.mpp.paywithlocus.com/brave/news-search` | MPP on Tempo | $0.03675 |
| 5 | Web context / citations — Exa | POST | `https://api.exa.ai/search` | MPP on Tempo | $0.00735 |
| 6 | On-chain token footprint — Alchemy | GET | `https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=${address}` | x402 via Circle Gateway | $0.001 |

Prices probe-verified 2026-07-10. Full-run cap (`maxAmount`): **$0.50**; per-step cap **$0.05** (Brave $0.06, Alchemy $0.02). Live total ≈ $0.068.

## Rails & providers

This skill spans **three rails**: Circle Gateway nanopayments plus x402 on Base + MPP
protocols through the SELAT Router.

- **x402 via Circle Gateway** — Alchemy (`x402.alchemy.com`) serves a native
  x402 challenge that resolves `x402 via Circle Gateway` — a Circle Gateway-batched
  nanopayment paid straight to the upstream on Base (`payTo` upstream),
  **bypassing the router**.
- **MPP on Tempo** — Scrape Creators (`mpp.orthogonal.com/scrapecreators`, YouTube
  search) and Brave news-search (via Locus, `brave.mpp.paywithlocus.com`) settle MPP
  through the SELAT Router. Sourced from the MPP catalog.
- **SELAT Router x402** — SELAT-native X/Twitter (`catalog.selat.ai`, `x402 via Circle
  Gateway`) and Exa (`api.exa.ai`, `MPP on Tempo`) settle through the SELAT Router.
  Sourced from SELAT's own catalog and the x402 Bazaar / MPP catalogs.

## Live probes (free; no wallet)

```bash
# x402 via Circle Gateway (GET query) — SELAT-native X/Twitter
selat-pay GET "https://catalog.selat.ai/twitter/user/info?userName=OpenAI" \
  --chain base --probe-only
# MPP on Tempo (GET query) — Scrape Creators YouTube
selat-pay GET "https://mpp.orthogonal.com/scrapecreators/v1/youtube/search?query=OpenAI" \
  --chain base --probe-only

# MPP (POST body) — Brave news
selat-pay POST "https://brave.mpp.paywithlocus.com/brave/news-search" \
  --body '{"q":"OpenAI"}' --chain base --probe-only

# x402 (POST body) — Exa citations
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"OpenAI","numResults":5}' --chain base --probe-only

# x402 via Circle Gateway (GET query) — Alchemy on-chain token
selat-pay GET "https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=0x0000000000000000000000000000000000000000" \
  --chain base --probe-only
```

A served endpoint prints `detected ... price=$X on eip155:8453`. The Brave step
shows `MPP on Tempo`; the SELAT-native X/Twitter step shows `x402 via Circle Gateway`, Exa shows `MPP on Tempo`;
the Alchemy step shows `x402 via Circle Gateway`; the Scrape Creators YouTube step shows `MPP on Tempo`.
