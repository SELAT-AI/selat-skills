# enrich-waterfall — endpoints

Every endpoint below is probe-verified live-payable (2026-07-10) with
`selat-pay --probe-only`. All steps are routed over MPP via the SELAT Router
except the AIsa step, which is a direct Circle x402 call (Circle Gateway-batched).
Caps are a 5 USDC spending filter, not the live price. Live prices are the
router quote on the probe date.

| Tier | Merchant | Endpoint | Live price |
|---|---|---|---|
| resolve | apollo (Locus) | `POST apollo.mpp.paywithlocus.com/apollo/people-enrichment` | $0.0084 |
| resolve | hunter (Locus) | `POST hunter.mpp.paywithlocus.com/hunter/email-enrichment` | $0.01365 |
| resolve | clado (Locus) | `POST clado.mpp.paywithlocus.com/clado/linkedin-profile` | $0.01365 |
| resolve | hunter (Locus) | `POST hunter.mpp.paywithlocus.com/hunter/combined-enrichment` | $0.02415 |
| anchor | apollo (Locus) | `POST apollo.mpp.paywithlocus.com/apollo/org-search` | $0.00525 |
| anchor | abstract (Locus) | `POST abstract-company-enrichment.mpp.paywithlocus.com/abstract-company-enrichment/lookup` | $0.0063 |
| anchor | apollo (Locus) | `POST apollo.mpp.paywithlocus.com/apollo/org-enrichment` | $0.0084 |
| anchor | hunter (Locus) | `POST hunter.mpp.paywithlocus.com/hunter/company-enrichment` | $0.01365 |
| anchor | hunter (Locus) | `POST hunter.mpp.paywithlocus.com/hunter/email-finder` | $0.01365 |
| social | aisa (Circle x402, direct) | `GET api.aisa.one/apis/v2/twitter/user/info?userName=` | $0.00044 |
| social | clado (Locus) | `POST clado.mpp.paywithlocus.com/clado/scrape` | $0.02415 |
| social | stablesocial (MPP direct merchant) | `POST stablesocial.dev/api/instagram/profile` | $0.063 |
| social | stablesocial (MPP direct merchant) | `POST stablesocial.dev/api/tiktok/profile` | $0.063 |
| signals | apollo (Locus) | `POST apollo.mpp.paywithlocus.com/apollo/job-postings` | $0.00525 |
| signals | brave (Locus) | `POST brave.mpp.paywithlocus.com/brave/news-search` (`q="${company} news"`) | $0.03675 |
| signals | brave (Locus) | `POST brave.mpp.paywithlocus.com/brave/news-search` (`q="${company} funding round"`) | $0.03675 |
| signals | diffbot-kg (Locus) | `POST diffbot-kg.mpp.paywithlocus.com/diffbot-kg/enhance` | $0.03675 |
| escalate | clado (Locus) | `POST clado.mpp.paywithlocus.com/clado/contacts` | $0.04515 |
| escalate | clado (Locus) | `POST clado.mpp.paywithlocus.com/clado/search` | $0.31815 |
| verify | hunter (Locus) | `POST hunter.mpp.paywithlocus.com/hunter/email-verifier` | $0.0084 |

Sum of live prices if every step fires: ≈ $0.74. Manifest top-level cap: $5.00.

## Coverage notes

- **Tech stack and headcount** no longer have a dedicated tier: Apollo
  `org-enrichment` returns `technology_names` and headcount fields, and the
  Abstract lookup returns industry/SIC classification, so tech/workforce signals
  ride along with the company anchor calls.
- **Apollo `job-postings` needs `organization_id`**, which comes from the Apollo
  `org-enrichment` or `org-search` response — run one of those anchor steps
  first and pass the id through as `organizationId`.
- **Funding, news and business connections** come from Brave news search
  (query-based) and the Diffbot KG organization record (funding rounds and
  investors are in the same `enhance` response — one call covers both).
- **Company anchor by name (no domain)** uses Apollo `org-search`
  (`q_organization_name`); a company LinkedIn URL is no longer an input to the
  company anchor — anchor by domain or name instead.
- **Clado `search` is synchronous** — no job polling; the natural-language
  people search returns results in one paid call.
- **No YouTube/Reddit/single-post steps** in this skill; profile-level
  Instagram/TikTok lookups go by handle via StableSocial.
