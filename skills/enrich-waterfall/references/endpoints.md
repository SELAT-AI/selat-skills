# enrich-waterfall — endpoints

This reference records the corrected fixed manifest order and the free routed
quotes observed with `selat skill verify --live-probe` on 2026-08-30. A probe
sends the declared method and body to read the payment challenge but never signs
or settles payment. Re-probe immediately before every paid run because prices
and availability can change.

The bundle has 17 `routed-mpp` calls and one `routed-x402` call. Every call goes
through the SELAT Router. The manifest cap is a **per-call ceiling**, not the
expected price and not a cumulative run limit.

| # | Group | Merchant | Endpoint | Required input or fixed request detail | Live routed quote | Per-step cap |
|---:|---|---|---|---|---:|---:|
| 1 | person | Apollo | `POST apollo.mpp.paywithlocus.com/apollo/people-enrichment` | `email`, `firstName`, `lastName`, `company`, `domain`, `linkedinUrl` | $0.039900 | $0.050 |
| 2 | person | Hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-enrichment` | `email` | $0.013650 | $0.020 |
| 3 | person | Clado | `POST clado.mpp.paywithlocus.com/clado/linkedin-profile` | `linkedin_url=linkedinUrl` | $0.013650 | $0.020 |
| 4 | person/company | Hunter | `POST hunter.mpp.paywithlocus.com/hunter/combined-enrichment` | `email` | $0.024150 | $0.030 |
| 5 | company | Apollo | `POST apollo.mpp.paywithlocus.com/apollo/org-search` | `q_organization_name=company`, `per_page=5`, `page=1` | $0.005250 | $0.010 |
| 6 | company | Company Enrich | `GET mpp.orthogonal.com/company-enrich/companies/enrich?domain=…` | `domain` query parameter | $0.012862 | $0.020 |
| 7 | company | Apollo | `POST apollo.mpp.paywithlocus.com/apollo/org-enrichment` | `domain` | $0.039900 | $0.050 |
| 8 | company | Hunter | `POST hunter.mpp.paywithlocus.com/hunter/company-enrichment` | `domain` | $0.013650 | $0.020 |
| 9 | person | Hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-finder` | `domain`, `first_name`, `last_name` | $0.013650 | $0.020 |
| 10 | social | SELAT-native X/Twitter | `GET catalog.selat.ai/twitter/user/info?userName=…` | `xHandle`, without `@` | $0.001000 | $0.002 |
| 11 | person/social | Clado | `POST clado.mpp.paywithlocus.com/clado/scrape` | `linkedin_url=linkedinUrl` | $0.024150 | $0.030 |
| 12 | company/signals | Apollo | `POST apollo.mpp.paywithlocus.com/apollo/job-postings` | `organization_id=organizationId` | $0.005250 | $0.010 |
| 13 | signals | Brave Search | `POST brave.mpp.paywithlocus.com/brave/news-search` | company-news query, `count=10`, `freshness=pm` | $0.036750 | $0.050 |
| 14 | signals | Brave Search | `POST brave.mpp.paywithlocus.com/brave/news-search` | funding query, `count=10`, `freshness=py` | $0.036750 | $0.050 |
| 15 | signals | Diffbot KG | `POST diffbot-kg.mpp.paywithlocus.com/diffbot-kg/enhance` | `type=Organization`, `name[]`, `url[]`, `refresh=false`, `size=1` | $0.036750 | $0.050 |
| 16 | contact | Clado | `POST clado.mpp.paywithlocus.com/clado/contacts` | `linkedin_url`, `email_enrichment=true`, `phone_enrichment=true` | $0.150150 | $0.200 |
| 17 | person | Clado | `POST clado.mpp.paywithlocus.com/clado/search` | person/company query, `companies[]`, `limit=5`, `offset=0` | $0.055650 | $0.060 |
| 18 | verify | Hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-verifier` | supplied `email` | $0.008400 | $0.015 |

- **Observed live total:** $0.531512 for all 18 calls.
- **Sum of per-step caps:** $0.707. This is the maximum manifest exposure if
  every call reaches its own cap, not an automatic run-wide cap.
- **Required cumulative control:** arm a separately approved SELAT session
  budget before a paid run and stop it after success or failure.

## Request-schema notes

- Apollo `people-enrichment` accepts the supplied email, name, organization,
  domain, and LinkedIn URL in one object. The manifest does not enable Apollo's
  separately priced phone-reveal option; Clado handles the explicit contact
  reveal later.
- Apollo `job-postings` requires `organization_id`. The manifest runner cannot
  read it from the earlier organization calls, so the user must provide a
  matching `organizationId` before execution.
- Hunter `email-finder` uses `domain`, `first_name`, and `last_name`. The final
  verifier independently checks the user-supplied `email`; it does not consume
  the finder response.
- Clado `contacts` is dynamically priced. Both `email_enrichment` and
  `phone_enrichment` are explicit booleans, which is why its quote is higher
  than a bare LinkedIn lookup.
- Clado `search` is dynamically priced per result. `limit=5` bounds the request
  and the quote; it is a synchronous response, not an async job.
- Diffbot's current OpenAPI declares `name` and `url` as arrays. Sending a scalar
  string can produce a paid application error, so the manifest pins the array
  shapes and disables the higher-priced `refresh` option.
- Brave `news-search` requires `q`; the fixed `count` and `freshness` fields make
  the two intentionally duplicated news calls distinct and bounded.
- Company Enrich is a GET request with the domain in the query string. It
  replaced the former Abstract Company Enrichment route.

## Corrections made during QC

1. **Removed false conditional behavior.** The installed SELAT CLI executes
   every manifest step in order and continues across errors by default. It has
   no tier selector, stop condition, or output-to-input dataflow. The skill now
   describes an honest fixed 18-call bundle and requires every needed input.
2. **Removed unrelated defaults.** The former defaults mixed a Stripe email and
   company with a Bill Gates LinkedIn profile and treated a full name as a social
   username. All eight identifiers are now required and must be coherent.
3. **Replaced a dead route.** The former Abstract Company Enrichment endpoint
   returned no x402/MPP challenge on 2026-08-30. Company Enrich replaced it after
   a free probe confirmed `routed-mpp` at $0.012862.
4. **Removed two incomplete async calls.** StableSocial Instagram and TikTok
   profile requests return job receipts that require later polling. Because the
   manifest cannot pass `jobId` into a polling step, those calls did not deliver
   the promised profile data and were removed.
5. **Corrected Diffbot's body.** `name` and `url` are arrays, not strings.
6. **Made contact scope explicit.** The Clado contact step now requests both
   email and phone and uses the corresponding live dynamic quote.
7. **Bounded the premium search.** Clado search now requests five results instead
   of its much more expensive default of 30.
8. **Tightened caps.** The old per-step caps summed to $6.00. The corrected caps
   sum to $0.707 while leaving headroom over every current live quote.

## Provider schema sources

Request shapes were checked against the providers' public OpenAPI documents on
2026-08-30 and then corroborated by free live payment probes:

- Apollo: `https://apollo.mpp.paywithlocus.com/openapi.json`
- Hunter: `https://hunter.mpp.paywithlocus.com/openapi.json`
- Clado: `https://clado.mpp.paywithlocus.com/openapi.json`
- Brave Search: `https://brave.mpp.paywithlocus.com/openapi.json`
- Diffbot KG: `https://diffbot-kg.mpp.paywithlocus.com/openapi.json`
- Company Enrich: `https://mpp.orthogonal.com/company-enrich/openapi.json`

The live 402/MPP challenge remains authoritative for reachability, rail, and
price. OpenAPI validates request shape but does not prove that a paid call will
return useful data for a particular identity.
