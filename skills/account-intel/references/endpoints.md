# Endpoints — account-intel

Entity-centric footprint & reputation intelligence over **three rails** —
direct Circle nanopayments (AIsa social + Alchemy on-chain), MPP web news
(Brave), and x402 web citations (Exa) — paid per call via selat-pay (USDC via
Circle Gateway), no API keys. Profiles ONE entity across X/Twitter, YouTube, the
web (news + citations), and any associated on-chain token.

## Endpoints used

| # | Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|---|
| 1 | X/Twitter profile — AIsa | GET | `https://api.aisa.one/apis/v2/twitter/user/info?userName=${handle}` | direct (Base) | $0.00044 |
| 2 | X/Twitter recent tweets — AIsa | GET | `https://api.aisa.one/apis/v2/twitter/user/last_tweets?userName=${handle}` | direct (Base) | $0.0036 |
| 3 | YouTube presence — AIsa | GET | `https://api.aisa.one/apis/v2/youtube/search?query=${name}` | direct (Base) | $0.0024 |
| 4 | Web reputation / news — Brave | POST | `https://brave.mpp.paywithlocus.com/brave/news-search` | routed MPP | $0.0368 |
| 5 | Web context / citations — Exa | POST | `https://api.exa.ai/search` | routed x402 (Base) | $0.007 |
| 6 | On-chain token footprint — Alchemy | GET | `https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=${address}` | direct (Base) | $0.001 |

Prices probe-verified 2026-07-10. Full-run cap (`maxAmount`): **$0.50**; per-step cap **$0.05** (Brave $0.06, Alchemy $0.02). Live total ≈ $0.051.

## Rails & providers

This skill spans **three rails**: one direct Circle nanopayment plus two routed
protocols through the SELAT Router.

- **direct** — AIsa (`api.aisa.one`, Circle x402 catalog; X/Twitter profile +
  recent tweets, YouTube search) and Alchemy (`x402.alchemy.com`) serve native
  x402 challenges that resolve `mode=direct` — Circle Gateway-batched
  nanopayments paid straight to the upstream on Base (`payTo` upstream),
  **bypassing the router**.
- **routed MPP** — Brave news-search (via Locus, `brave.mpp.paywithlocus.com`)
  settles MPP through the SELAT Router (`mode=routed-mpp`). Sourced from the MPP
  catalog.
- **routed x402** — Exa (`api.exa.ai`) serves a native x402 challenge; the router
  settles it on Base (`mode=routed-x402`). Sourced from the Agentic Market / MPP catalogs.

## Live probes (free; no wallet)

```bash
# direct (GET query) — AIsa X/Twitter + YouTube
selat-pay GET "https://api.aisa.one/apis/v2/twitter/user/info?userName=OpenAI" \
  --chain base --probe-only
selat-pay GET "https://api.aisa.one/apis/v2/youtube/search?query=OpenAI" \
  --chain base --probe-only

# MPP (POST body) — Brave news
selat-pay POST "https://brave.mpp.paywithlocus.com/brave/news-search" \
  --body '{"q":"OpenAI"}' --chain base --probe-only

# x402 (POST body) — Exa citations
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"OpenAI","numResults":5}' --chain base --probe-only

# direct (GET query) — Alchemy on-chain token
selat-pay GET "https://x402.alchemy.com/data/v1/assets/tokens/by-address?address=0x0000000000000000000000000000000000000000" \
  --chain base --probe-only
```

A served endpoint prints `detected ... price=$X on eip155:8453`. The Brave step
shows `mode=routed-mpp`; Exa shows `mode=routed-x402`; the AIsa + Alchemy steps
show `mode=direct`.
