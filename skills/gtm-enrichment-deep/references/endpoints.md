# Endpoints — gtm-enrichment-deep

Use only these endpoint families for `gtm-enrichment-deep`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify` probes it free.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 — Enrich person | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-enrichment` | MPP on Tempo | $0.0399 |
| 2 — Enrich company | POST | `https://hunter.mpp.paywithlocus.com/hunter/company-enrichment` | MPP on Tempo | $0.01365 |
| 3 — Fallback org enrich | POST | `https://apollo.mpp.paywithlocus.com/apollo/org-enrichment` | MPP on Tempo | $0.0399 |

This is a fixed 3-call manifest. The step table matches `manifest.json` exactly.
Step 3 is labeled in the manifest as run only if Hunter returned no funding
data — it is still a shipped step.

- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Apollo and Hunter via Locus (`*.mpp.paywithlocus.com`).

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed price: `$0.0399` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**. One `people-enrichment` call covers person identity and
LinkedIn — there is no separate LinkedIn-match fallback.

Neither Hunter nor Apollo returns an AI/B2B-SaaS classification field.
Classification must be inferred from the returned description/keywords and
marked low confidence.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Enrich person | `/apollo/people-enrichment` | `email`, `first_name`, `last_name`, `organization_name`, `domain`, `reveal_personal_emails` (boolean) |
| Fallback org enrich | `/apollo/org-enrichment` | `domain` (string, required) |

```json
{ "email": "test@stripe.com", "first_name": "John", "last_name": "Doe", "organization_name": "Stripe", "domain": "stripe.com", "reveal_personal_emails": true }
```

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed price: `$0.01365` per call (`routed-mpp`). All endpoints are **POST
with a JSON body**.

| Capability/Step | Endpoint | Body params |
| --- | --- | --- |
| Enrich company | `/hunter/company-enrichment` | `domain` (string, required) |

```json
{ "domain": "stripe.com" }
```
