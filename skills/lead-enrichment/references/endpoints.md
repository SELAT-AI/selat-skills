# Endpoints — lead-enrichment

Use only these endpoint families for `lead-enrichment`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Find email | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-finder` | MPP on Tempo | $0.01365 |
| 2 — Verify email | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-verifier` | MPP on Tempo | $0.0084 |
| 3 — Enrich lead | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-enrichment` | MPP on Tempo | $0.0399 |
| 4 — Find phone | POST | `https://clado.mpp.paywithlocus.com/clado/contacts` | MPP on Tempo | $0.04515 |
| 5 — Enrich company | POST | `https://hunter.mpp.paywithlocus.com/hunter/company-enrichment` | MPP on Tempo | $0.01365 |

This is a fixed 5-call manifest. The step table matches `manifest.json` exactly.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Hunter, Apollo, and Clado via Locus (`*.mpp.paywithlocus.com`).

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`): email-finder / company-enrichment `$0.01365`,
email-verifier `$0.0084`. All endpoints are **POST with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Find email | `/hunter/email-finder` | `domain`, `first_name`, `last_name` |
| Verify email | `/hunter/email-verifier` | `email` (string, required) |
| Enrich company | `/hunter/company-enrichment` | `domain` (string, required) |

```json
{ "domain": "stripe.com", "first_name": "John", "last_name": "Doe" }
```

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed price: `$0.0399` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Enrich lead | `/apollo/people-enrichment` | `first_name`, `last_name`, `organization_name`, `linkedin_url` |

```json
{ "first_name": "John", "last_name": "Doe", "organization_name": "Stripe", "linkedin_url": "https://linkedin.com/in/williamhgates" }
```

## Clado MPP — `MPP on Tempo`

serviceUrl: `https://clado.mpp.paywithlocus.com`

Live-probed price: `$0.04515` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**. Phone lookup requires a LinkedIn URL.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Find phone | `/clado/contacts` | `linkedin_url` (string, required) |

```json
{ "linkedin_url": "https://linkedin.com/in/williamhgates" }
```
