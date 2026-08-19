---
name: domain-trust-check
description: Use this skill when someone needs to decide whether a domain or website is legitimate and safe to trust, transact with, click, or accept email from — e.g. "is this domain legit", "check this domain before I pay them", "vet this supplier's website", "how old is this domain", "is this a phishing site", "does this domain have SPF/DMARC", "is their SSL about to expire", "check this site's security headers". Fuses registration age (RDAP), DNS, email authentication, TLS posture, live reachability, HTTP security headers, and an independent Wayback first-capture age cross-check into one verdict. Paid per call via x402 through the SELAT Router.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Gateway balance (settles on whichever supported chain the balance sits on).
metadata:
  author: selat-community
  version: "1.0"
  rail: routed
  kind: multi
---

# domain-trust-check

Answer one question about a domain: **is it safe to trust?** Registration age,
DNS, email authentication, TLS, live reachability, security headers, and an
independent age cross-check — in one paid run of about **$0.044**.

## When To Use

Use when a decision depends on whether a domain is what it claims to be:

- Before paying, contracting, or sharing data with an unfamiliar counterparty.
- Triaging a suspicious link, sender domain, or inbound lead.
- Vetting a supplier, merchant, or partner domain during onboarding.
- Auditing a domain you own for expiring TLS or missing email authentication.

Pair it with an enrichment skill (`lead-enrichment`, `account-intel`) when you
also need to know *who* is behind the company — this skill covers whether the
**domain** stands up, not who owns the business.

Do **not** use it to check a crypto address or wallet; that is a different
lookup entirely.

## Workflow

1. Install once: `selat skill install domain-trust-check`
2. Resolve inputs. `domain` is the bare host (`stripe.com`, no scheme/path).
   Set `site` to the matching `https://` URL — it defaults to
   `https://example.com`, so **always pass it explicitly** or three of the four
   steps will audit the wrong site.
3. **Tell the user the price and get a go-ahead before running** — this costs
   about **$0.044** per domain.
4. Run:

   ```bash
   selat skill run domain-trust-check --domain stripe.com --site https://stripe.com
   ```

5. Read the four responses together and give the user a plain-language verdict
   (see *Reading The Result*). Report the age, the single biggest risk, and a
   clear recommendation — not raw JSON.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `domain` | yes | `example.com` | Bare domain, no scheme or path (`stripe.com`) |
| `site` | no | `https://example.com` | Full `https://` URL of the same host |

Steps and what each contributes:

| # | Step | Adds |
|---|---|---|
| 1 | `domain/check` | RDAP registration + expiry date, DNS records, SPF/DKIM/DMARC, TLS validity |
| 2 | `url/check-status` | Does it actually resolve and respond; redirect chain |
| 3 | `web/headers` | HSTS, CSP, X-Frame-Options, X-Content-Type-Options |
| 4 | `web/archive` | Wayback first capture — age evidence independent of the registrar |

## Reading The Result

Weigh the signals; no single one is decisive.

**Strong risk signals**

- Registration **less than ~90 days old**, especially with a long expiry-free
  window — the most reliable single fraud indicator.
- WHOIS says the domain is old, but Wayback has **no capture, or a first
  capture far more recent than the registration date** — consistent with a
  lapsed domain that was re-registered by someone new. This mismatch is the
  reason step 4 exists; a registrar record alone cannot show it.
- **No SPF or DMARC** — the domain can be spoofed in email, so a message
  claiming to come from it proves nothing.
- TLS **already expired**, or a certificate whose host does not match.
- Does not resolve, or redirects off to an unrelated host.

**Reassuring signals**

- Multi-year registration history corroborated by an early Wayback capture.
- DMARC at `p=quarantine` or `p=reject`, valid TLS with comfortable runway.
- HSTS present; CSP present.

Missing security headers alone are weak evidence — plenty of legitimate sites
lack CSP. Treat them as posture, not proof.

**Tell the user**: the domain's age, whether email from it can be trusted, the
single biggest risk found, and a plain recommendation. Keep endpoint URLs and
raw JSON out of the reply unless asked.

## Gotchas

- **Always pass `site` explicitly.** It defaults to `https://example.com`; leave
  it unset and steps 2–4 silently audit that placeholder instead of the target,
  returning a clean-looking report about the wrong site.
- **`domain` takes no scheme and no path.** Pass `stripe.com`, not
  `https://stripe.com/pricing`. `site` is the one that takes the full URL.
- **Keep `domain` and `site` pointed at the same host**, or the age evidence and
  the live checks describe different things and the verdict is meaningless.
- **A missing Wayback capture is not proof of fraud.** Intranet, staging, and
  `noarchive` sites legitimately have none. Read it alongside step 1.
- **This is reconnaissance, not a malware verdict.** It reports posture and age;
  it does not scan content or check blocklists. Say so rather than implying a
  site is "clean".
- **Payment settles before the upstream validates the request**, so a malformed
  domain still costs money. Sanity-check the input before spending.
- New domains are not automatically malicious, and old domains are not
  automatically safe — a compromised legitimate domain looks old and well
  configured.

## Validation

- Probe (free, no spend):
  `selat-pay GET "https://api.x402node.dev/domain/check?domain=example.com" --chain base --probe-only`
- Live-check every step: `selat skill verify ./skills/domain-trust-check --domain example.com --site https://example.com`
- A successful run prints `status=200` for all four steps.

> `--chain base` above is only the flag `selat-pay` requires for a probe — probing
> reads a free, chain-independent quote and never settles. A paid run resolves the
> settlement chain from your funded Circle Gateway balance, not the manifest.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoints, schemas, and live prices.
- selat-pay — https://github.com/SELAT-AI/selat-pay

Provider API and trademarks belong to their owners; this skill only calls their
public x402-metered endpoints.
