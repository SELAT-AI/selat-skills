# Endpoints — gtm-enrichment-smart

Use only these endpoint families for `gtm-enrichment-smart`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Person enrich | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-enrichment` | MPP on Tempo | $0.0399 |
| 2 — Person + company combined | POST | `https://hunter.mpp.paywithlocus.com/hunter/combined-enrichment` | MPP on Tempo | $0.02415 |
| 3 — Email deliverability | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-verifier` | MPP on Tempo | $0.0084 |
| 4 — Company brand | GET | `https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=${domain}` | MPP on Tempo | $0.012862 |
| 5 — Company gap-fill | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-enrichment` | MPP on Tempo | $0.0399 |
| 6 — Person tie-breaker | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-enrichment` | MPP on Tempo | $0.01365 |
| 7 — Company fallback | POST | `https://hunter.mpp.paywithlocus.com/hunter/company-enrichment` | MPP on Tempo | $0.01365 |
| 8 — Social proof | GET | `https://catalog.selat.ai/twitter/user/info?userName=${twitterHandle}` | x402 via Circle Gateway | $0.001 |

This is a fixed 8-call manifest. The step table matches `manifest.json` exactly.
Later steps are labeled conditional in the manifest; they still ship as steps.
Apollo `job-postings` is **not a manifest step**.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **x402 via Circle Gateway:** SELAT-native Twitter (`catalog.selat.ai`). Verify prints `routed-x402`. Buyer is the funded Gateway chain. This is not a pay-chain claim.
- **MPP on Tempo:** Apollo and Hunter via Locus (`*.mpp.paywithlocus.com`). Orthogonal Company Enrich via `mpp.orthogonal.com`.

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed price: `$0.0399` for people-enrichment / org-enrichment
(`routed-mpp`); job-postings `$0.00525`. All endpoints are **POST with a JSON
body**. Capture `organization.id` from people-enrichment if you later invoke
job-postings by hand.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Person enrich | `/apollo/people-enrichment` | `email` (string, required), `reveal_personal_emails` (boolean) |
| Company gap-fill | `/apollo/org-enrichment` | `domain` (string, required) |

```json
{ "email": "test@stripe.com", "reveal_personal_emails": true }
```

Optional escalation endpoints (same host — **not in the default manifest**;
call via `selat-pay` when the request needs them):

| Capability | Endpoint | Use |
| --- | --- | --- |
| Job postings / hiring signals | `/apollo/job-postings` | Body `{"organization_id":"${organizationId}"}`. Only invoke once an org id was captured. Live-probed `$0.00525` (`routed-mpp`). |

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`): combined-enrichment `$0.02415`,
email-verifier `$0.0084`, email-enrichment / company-enrichment `$0.01365`.
All endpoints are **POST with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Person + company combined | `/hunter/combined-enrichment` | `email` (string, required) |
| Email deliverability | `/hunter/email-verifier` | `email` (string, required) |
| Person tie-breaker | `/hunter/email-enrichment` | `email` (string, required) |
| Company fallback | `/hunter/company-enrichment` | `domain` (string, required) |

```json
{ "email": "test@stripe.com" }
```

## Orthogonal Company Enrich — `MPP on Tempo`

serviceUrl: `https://mpp.orthogonal.com/company-enrich`

Live-probed price: `$0.012862` (`routed-mpp`, 2026-09-12). Domain lookup is
**GET with a query-string `domain`**. Replaces the dead Abstract Company
Enrichment `POST /abstract-company-enrichment/lookup`. Skip for free-email
domains. Per-step cap `$0.02`.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Company brand | `/companies/enrich` | `domain` (string, required) — bare host, no protocol or path |

```text
https://mpp.orthogonal.com/company-enrich/companies/enrich?domain=stripe.com
```

## SELAT-native Twitter — `x402 via Circle Gateway`

serviceUrl: `https://catalog.selat.ai`

Live-probed price: `$0.001` per call (`routed-x402`). All endpoints are **GET
with query-string params**. Manifest labels this step as only if a Twitter
handle was found.

| Capability/Step | Endpoint | Query params |
| --- | --- | --- |
| Social proof | `/twitter/user/info` | `userName` (string, required — handle, no `@`) |

Query pattern:

```text
https://catalog.selat.ai/twitter/user/info?userName=elonmusk
```
