# Endpoints — lead-enrichment

Use only these endpoint families for `lead-enrichment`. Hosts below are
the catalogue **`serviceUrl`s** (the payable hosts that serve the 402), not
descriptive provider URLs. Catalogue prices are indicative; the live 402 quote
is authoritative — `selat skill verify --live-probe` probes it free.

| Step | Method | URL | Rail | ~Price | Cap |
|---|---|---|---|---|---|
| 1 — Derive work-email candidate | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-finder` | MPP on Tempo | $0.01365 | $0.020 |
| 2 — Verify supplied work email | POST | `https://hunter.mpp.paywithlocus.com/hunter/email-verifier` | MPP on Tempo | $0.0084 | $0.012 |
| 3 — Professional identity cross-check | POST | `https://apollo.mpp.paywithlocus.com/apollo/people-enrichment` | MPP on Tempo | $0.0399 | $0.050 |
| 4 — Phone enrichment | POST | `https://clado.mpp.paywithlocus.com/clado/contacts` | MPP on Tempo | $0.10815 | $0.150 |
| 5 — Employer firmographics | POST | `https://hunter.mpp.paywithlocus.com/hunter/company-enrichment` | MPP on Tempo | $0.01365 | $0.020 |

This is a fixed 5-call manifest. The step table matches `manifest.json` exactly;
`selat skill run` always executes all five steps.

- **Live-probed 2026-10-04** (`selat-pay --probe-only --live-probe`, free, never
  signs): every step returned a 402, mode `routed-mpp`, within its step cap.
- **Expected fixed-run total:** $0.183750. **Sum of step caps:** $0.252.
- **Top-level `maxAmount` ($0.15)** is only the per-step fallback for a step that
  omits its own cap. It is not a full-run cap; arm a separately approved
  `selat budget` for the cumulative run.
- **SELAT Router:** All calls route via `https://router.selat.ai` with protocol detection (MPP ↔ x402).
- **MPP on Tempo:** Hunter, Apollo, and Clado via Locus (`*.mpp.paywithlocus.com`).

## Hunter MPP — `MPP on Tempo`

serviceUrl: `https://hunter.mpp.paywithlocus.com`

Live-probed prices (`routed-mpp`): email-finder / company-enrichment `$0.01365`,
email-verifier `$0.0084`. All endpoints are **POST with a JSON body**.

| Step | Endpoint | Body params |
| --- | --- | --- |
| 1 — find email | `/hunter/email-finder` | `domain` ← `${domain}`, `first_name` ← `${firstName}`, `last_name` ← `${lastName}` |
| 2 — verify email | `/hunter/email-verifier` | `email` (string, required) ← `${email}` |
| 5 — enrich company | `/hunter/company-enrichment` | `domain` (string, required) ← `${domain}` |

```json
{ "domain": "acmecorp.com", "first_name": "Dana", "last_name": "Whitfield" }
```

Step 2 verifies the caller-supplied `email`; it never consumes step 1's
candidate (the runner has no inter-step dataflow). Compare the two during
synthesis.

The 2026-10-04 probe's transactability reading for `/hunter/email-finder` showed
0 of 7 captured network payments answered 2xx (last status 502), and
`/hunter/company-enrichment` showed 1 of 4 (last status 200). A free probe
proves payability, not delivery; a paid failure can still charge.

## Apollo MPP — `MPP on Tempo`

serviceUrl: `https://apollo.mpp.paywithlocus.com`

Live-probed price: `$0.0399` per call (`routed-mpp`). **POST with a JSON body**.

| Step | Endpoint | Body params |
| --- | --- | --- |
| 3 — identity cross-check | `/apollo/people-enrichment` | `email`, `first_name`, `last_name`, `organization_name` ← `${company}`, `domain`, `linkedin_url` ← `${linkedinUrl}`; `reveal_personal_emails` fixed `false`; `reveal_phone_number` fixed `false` |

```json
{ "email": "dana.whitfield@acmecorp.com", "first_name": "Dana", "last_name": "Whitfield", "organization_name": "Acme Corp", "domain": "acmecorp.com", "linkedin_url": "https://www.linkedin.com/in/dana-whitfield-acme", "reveal_personal_emails": false, "reveal_phone_number": false }
```

## Clado MPP — `MPP on Tempo`

serviceUrl: `https://clado.mpp.paywithlocus.com`

Live-probed price: `$0.10815` per call with the manifest body (`routed-mpp`).
**POST with a JSON body**. Pricing is request-dependent: LinkedIn-only quotes
`$0.04515`; `phone_enrichment: true` quotes `$0.10815`; email plus phone
enrichment quoted `$0.15015` (2026-08-30).

| Step | Endpoint | Body params |
| --- | --- | --- |
| 4 — phone enrichment | `/clado/contacts` | `linkedin_url` (string, required) ← `${linkedinUrl}`, `email` ← `${email}`, `email_enrichment` fixed `false`, `phone_enrichment` fixed `true` |

```json
{ "linkedin_url": "https://www.linkedin.com/in/dana-whitfield-acme", "email": "dana.whitfield@acmecorp.com", "email_enrichment": false, "phone_enrichment": true }
```

`phone_enrichment: true` asks Clado for whatever phone numbers it holds for
the profile. It does not filter to business lines, and the free probe does not
show which number types come back. Label any returned number by the type
Clado reports, or as "type unknown".

## Free verification

Use synthetic, coherent inputs. The probe sends each declared method and body
to read the payment challenge; it never signs or settles.

```bash
SELAT_ROUTER_URL=https://router.selat.ai \
  selat skill verify ./skills/lead-enrichment \
  --firstName "Dana" \
  --lastName "Whitfield" \
  --company "Acme Corp" \
  --domain acmecorp.com \
  --email "dana.whitfield@acmecorp.com" \
  --linkedinUrl "https://www.linkedin.com/in/dana-whitfield-acme" \
  --live-probe
```

Single-step probe (the `--chain base` token is only selat-pay's required flag;
a probe never settles and the router quotes every Gateway chain identically):

```bash
selat-pay POST https://clado.mpp.paywithlocus.com/clado/contacts \
  --chain base --max-amount 0.15 --probe-only --live-probe \
  --body '{"linkedin_url":"https://www.linkedin.com/in/dana-whitfield-acme","email":"dana.whitfield@acmecorp.com","email_enrichment":false,"phone_enrichment":true}'
```

Returned email or phone data is not consent to contact someone. The skill sends
nothing.
