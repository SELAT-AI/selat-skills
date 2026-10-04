# Endpoints — self-evolving-agent

Use only these endpoint families for `self-evolving-agent`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — Broad crypto social context | GET | `https://x402.ottoai.services/kol-sentiment` | x402 via Circle Gateway | $0.00315 | $0.004 |
| 2 — Asset market context | GET | `https://x402.ottoai.services/hyperliquid-market?asset=${asset}` | x402 via Circle Gateway | $0.00105 | $0.002 |
| 3 — Domain availability and price | POST | `https://stabledomains.dev/api/check` | MPP on Tempo | $0.0105–$0.0525 (by TLD) | $0.075 |

This is a fixed 3-call manifest. The step table matches `manifest.json`
exactly, and `selat skill run` pays for every step on every run. Live-probed
total (2026-10-04): **$0.0147** with a `.com`-class domain, **$0.0567** with an
`.ai`/`.io`-class domain. Sum of per-step caps: **$0.081**. The top-level
`maxAmount` (`$0.075`) is only a per-step fallback for a step without its own
cap. It is not a cumulative run cap.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 via Circle Gateway:** Otto AI (`x402.ottoai.services`). The probe reports `routed-x402`. The buyer pays from whichever chain holds the funded Gateway balance. This is not a pay-chain claim.
- **MPP on Tempo:** StableDomains (`stabledomains.dev`). The probe reports `routed-mpp`.

## Otto AI — `x402 via Circle Gateway`

serviceUrl: `https://x402.ottoai.services`

Live-probed prices (`routed-x402`, 2026-10-04): KOL sentiment `$0.00315`
(cap `$0.004`), Hyperliquid market `$0.00105` (cap `$0.002`). Both are **GET**.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Broad crypto social context | `/kol-sentiment` | none. The report is broad, not filtered by asset. Keep its `dataAsOf`, `generatedAt`, `degraded`, and source-health fields. |
| Asset market context | `/hyperliquid-market` | `asset` (string, required by the live schema — a Hyperliquid ticker such as `BTC`) |

A bare `/hyperliquid-market` URL still returns a valid quote, so a quote-only
probe would not catch a missing `asset`. The manifest always sends it.

```text
https://x402.ottoai.services/hyperliquid-market?asset=BTC
```

## StableDomains — `MPP on Tempo`

serviceUrl: `https://stabledomains.dev`

Live-probed price (`routed-mpp`, 2026-10-04) depends on the TLD of the domain
in the body:

| TLD class | Upstream | Routed quote |
| --- | --- | --- |
| `.com` `.net` `.org` `.co` `.biz` `.info` `.me` `.mobi` `.name` `.tv` `.uk` | $0.01 | $0.0105 |
| `.ai` `.app` `.cloud` `.dev` `.email` `.io` `.link` `.live` `.online` `.page` `.pro` `.shop` `.site` `.store` `.studio` `.tech` `.xyz` | $0.05 | $0.0525 |
| malformed or unsupported domain (e.g. `test`, `foo.bar.com`) | $0.10 | $0.105 — refused by the `$0.075` cap |

**POST with a JSON body** containing only `domain`. The check does not register
or reserve the domain.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Domain availability and price | `/api/check` | `domain` (string, required — full domain on one of the 28 supported TLDs above) |

```json
{ "domain": "agent-alpha-research.com" }
```

## Free probes

Whole skill (reads payment challenges only, never settles):

```bash
selat skill verify ./skills/self-evolving-agent --asset BTC --domainCandidate agent-alpha-research.com --live-probe
```

Single step (`--chain base` is only selat-pay's required flag; a probe never
settles, and paid runs use whichever chain holds your Gateway balance):

```bash
selat-pay GET "https://x402.ottoai.services/hyperliquid-market?asset=BTC" --chain base --max-amount 0.002 --probe-only --live-probe
selat-pay POST "https://stabledomains.dev/api/check" --body '{"domain":"agent-alpha-research.com"}' --chain base --max-amount 0.075 --probe-only --live-probe
```

## Not in this skill

Inbox creation, wallet setup or funding, domain registration, hosting or
compute purchases, and any trade-capable endpoint are outside this skill. They
are not manifest steps and the skill never calls them.
