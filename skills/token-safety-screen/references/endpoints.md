# Endpoints — token-safety-screen

Pre-buy safety screen across **two settlement modes** from the SELAT federated
catalogue: **MPP on Tempo** (Exa, Nansen) and a Circle Gateway-batched
nanopayment (`x402 via Circle Gateway`, SELAT catalog Twitter). Paid per call
via selat-pay (USDC via Circle Gateway), no API keys.

## Endpoints used

| # | Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|---|
| 1 | Scam/rugpull web reports — Exa | POST | `https://api.exa.ai/search` | MPP on Tempo | $0.00735 |
| 2 | Live X chatter — SELAT advanced_search | GET | `https://catalog.selat.ai/twitter/tweet/advanced_search?query=${token}%20(honeypot%20OR%20rugpull%20OR%20scam)&queryType=Latest` | x402 via Circle Gateway | $0.001 |
| 3 | Smart-money positioning — Nansen | POST | `https://api.nansen.ai/api/v1/smart-money/holdings` | MPP on Tempo | $0.0525 |

Full-run cap (`maxAmount`): **$0.35**; per-step caps **$0.02–$0.10**. Live total
≈ **$0.061** per full run.

## Rails & providers

This skill mixes rails (`rail: mixed` implied by step rails):

- **MPP on Tempo** — Exa (`api.exa.ai`) and Nansen (`api.nansen.ai`) settle MPP
  through the SELAT Router (`MPP on Tempo`). Sourced from the MPP catalog.
  Nansen is dual-protocol with a **gated** MPP challenge: a bare probe 402s
  with x402 only, and the MPP `WWW-Authenticate: Payment` (method `tempo`)
  surfaces only under an `Authorization: Payment` probe (selat-pay's probe 2
  sends it). The registry listing is accurate; a routed-MPP charge settles live.
- **Circle Gateway nanopayment** — the SELAT catalog Twitter advanced_search
  (`catalog.selat.ai`) serves an x402 challenge that settles as a Circle
  Gateway-batched nanopayment (`x402 via Circle Gateway`). This step does not
  require `SELAT_ROUTER_URL`.

## Parameter → API mapping

| Manifest param | API param | Where | Notes |
|---|---|---|---|
| `${token}` | `query` (Exa body) | POST body | Free-text; combined with fixed safety keywords |
| `${token}` | `query` (Twitter GET) | URL query string | **Pre-encoded template** — token substitutes into `...query=<token>%20(honeypot%20OR%20rugpull%20OR%20scam)&queryType=Latest` |
| `${network}` | `chains[0]` (Nansen body) | POST body | Array, not string; e.g. `{"chains":["solana"]}` |

Schemas corroborated against live APIs on 2026-08-29 (all three steps settled
HTTP 200 during `verify --pay`): Exa body shape (`query`/`numResults`/
`contents.text.maxCharacters`) mirrors the live Exa x402 contract; SELAT
Twitter advanced_search takes `query` + `queryType=Latest` as GET params;
Nansen holdings takes `chains` as an array of chain names.

## Live probes (free; no wallet)

```bash
# Exa (POST body)
selat-pay POST "https://api.exa.ai/search" \
  --body '{"query":"PEPE token scam rugpull honeypot report","numResults":6}' \
  --network base --probe-only

# SELAT Twitter (GET query) — note URL encoding
selat-pay GET "https://catalog.selat.ai/twitter/tweet/advanced_search?query=PEPE%20(honeypot%20OR%20rugpull%20OR%20scam)&queryType=Latest" \
  --network base --probe-only

# Nansen (POST body; `chains` is an array) — dual-protocol: gated MPP challenge
selat-pay POST "https://api.nansen.ai/api/v1/smart-money/holdings" \
  --body '{"chains":["ethereum"]}' --network base --probe-only
```

A served endpoint prints `detected ... price=$X on eip155:8453`. Exa and Nansen
show `MPP on Tempo` (Nansen via dual-protocol probe 2 — `mode=routed-mpp`);
the SELAT Twitter step shows `x402 via Circle Gateway`.
