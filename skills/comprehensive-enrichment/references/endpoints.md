# comprehensive-enrichment — endpoints

The table records the fixed manifest order and the free routed quote observed by
`selat skill verify --live-probe` on 2026-08-29. A probe may invoke the declared
method/body but never settles payment. Live quotes can change and are always the
price source of truth.

All 13 calls are read-only MPP services reached through the SELAT Router. The
manifest cap is a **per-call ceiling**, not the expected price and not a
cumulative run limit.

| # | Merchant | Endpoint | Required input(s) | Live routed quote | Per-step cap |
|---:|---|---|---|---:|---:|
| 1 | Clado | `POST clado.mpp.paywithlocus.com/clado/search` | `firstName`, `lastName`, `company` | $0.318150 | $0.40 |
| 2 | Apollo | `POST apollo.mpp.paywithlocus.com/apollo/people-enrichment` | `firstName`, `lastName`, `company`, `linkedinUrl` | $0.039900 | $0.05 |
| 3 | Hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-enrichment` | `email` | $0.013650 | $0.02 |
| 4 | Hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-finder` | `domain`, `firstName`, `lastName` | $0.013650 | $0.02 |
| 5 | Hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-verifier` | `email` | $0.008400 | $0.015 |
| 6 | Clado | `POST clado.mpp.paywithlocus.com/clado/contacts` | `linkedinUrl` | $0.045150 | $0.06 |
| 7 | Exa | `POST exa.mpp.tempo.xyz/search` (person research) | `firstName`, `lastName`, `company` | $0.005250 | $0.01 |
| 8 | Company Enrich | `GET mpp.orthogonal.com/company-enrich/companies/enrich?domain=…` | `domain` | $0.012862 | $0.02 |
| 9 | Hunter | `POST hunter.mpp.paywithlocus.com/hunter/domain-search` | `domain` | $0.108150 | $0.15 |
| 10 | Diffbot KG | `POST diffbot-kg.mpp.paywithlocus.com/diffbot-kg/enhance` | `company` | $0.036750 | $0.05 |
| 11 | Firecrawl | `POST firecrawl.mpp.tempo.xyz/v1/extract` | `pricingUrl` | $0.005250 | $0.01 |
| 12 | Exa | `POST exa.mpp.tempo.xyz/findSimilar` | `domain` | $0.005250 | $0.01 |
| 13 | Exa | `POST exa.mpp.tempo.xyz/search` (company research) | `company` | $0.005250 | $0.01 |

- **Observed live total:** $0.617662 for all 13 calls.
- **Sum of per-step caps:** $0.825. This is a worst-case manifest ceiling only;
  use a separately approved session budget as the cumulative tripwire.
- **Replacement made during QC:** the old Abstract Company Enrichment endpoint
  still appeared in the federated catalogue at $0.006 but returned no live
  x402/MPP challenge. The Company Enrich GET endpoint replaced it after a free
  probe confirmed `routed-mpp`, a required `domain` query parameter, and a live
  routed quote of $0.012862.

Operational notes:

- The manifest is a fixed pipeline. The current CLI runs all 13 entries and has
  no `--steps` or skip selector.
- Steps do not pass response fields into later calls. The caller must provide a
  coherent work email, name, employer/company, domain, LinkedIn person URL, and
  public pricing/features URL before payment.
- Clado search is synchronous—natural-language people search returns in one
  call, with no job polling.
- Clado contacts requires `linkedin_url`; it is the phone-enrichment call.
- The Diffbot KG Organization response covers both funding and investors.
- Hunter email verification validates the supplied `email`; it does not consume
  the output of the preceding email-finder call.
- Firecrawl can return a paid application error for an empty, private, or
  login-gated `pricingUrl`.
