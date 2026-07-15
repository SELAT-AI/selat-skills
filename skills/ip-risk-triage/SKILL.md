---
name: ip-risk-triage
description: Use this skill when the user wants to investigate a public IPv4 or IPv6 address for VPN, proxy, Tor, bot, hosting, ASN, network-owner, or coarse geolocation signals; cross-check an unfamiliar login or server IP; or compare independent IP-intelligence providers. It uses routed MPP calls to IPinfo and Abstract IP Intelligence.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Gateway balance for paid runs.
metadata:
  author: kautsar101
  version: "1.0"
  rail: routed
  kind: multi
---

# ip-risk-triage

## When To Use

Use this skill to triage a public IP address when the user needs network identity,
privacy-service detection, hosting classification, or a cross-provider check. Do
not use it to identify a person, locate someone precisely, inspect a domain name,
or analyze a blockchain address.

## Workflow

1. Require one explicit public IPv4 or IPv6 address. Reject private, loopback,
   link-local, multicast, malformed, and domain-name inputs.
2. Use the latest free probe prices to tell the user the expected total and the
   `0.015` USDC cumulative ceiling from the two per-step caps, then ask for
   approval before any paid run.
3. After approval, run both steps for the same IP address. Replace the example
   address with the explicit public IP supplied by the user:

   ```bash
   selat skill run ip-risk-triage --ip 8.8.8.8
   ```

4. Use IPinfo for ASN, network owner, coarse location, hosting, and available
   privacy flags.
5. Use Abstract IP Intelligence for independent VPN, proxy, Tor, and bot signals.
6. Normalize missing fields as `unknown`; never convert absence into `false`.
7. Compare the providers and call out every conflicting security or location
   signal with provider attribution.
8. Report observable signals and caveats. Do not claim that an IP is malicious,
   that it belongs to a specific person, or that its geolocation is exact.

Both steps are routed MPP calls through the SELAT Router. Catalogue prices are
estimates; the live quote is authoritative.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `ip` | no | `8.8.8.8` | Public IPv4 or IPv6 address to investigate |

Output: a concise report containing the target IP, ASN/network owner, coarse
country or region when available, privacy and hosting signals by provider,
provider disagreements, and limitations.

## Gotchas

- IP geolocation is approximate and must not be presented as a street address or
  a person's physical location.
- VPN, proxy, Tor, bot, and hosting flags are risk signals, not proof of abuse.
- Some provider plans omit fields. Preserve those values as `unknown`.
- Do not send private or reserved addresses; their results are not meaningful.
- Do not retry a failed paid call without fresh user approval.
- The catalogue total is about `0.007` USDC before routing. The step caps are
  `0.005` and `0.01` USDC, so their cumulative ceiling is `0.015` USDC. The
  manifest-level `0.02` value is a fallback safety ceiling, not the price.

## Validation

- Static check: `selat skill validate ./skills/ip-risk-triage`
- Free live-price check: `selat skill verify ./skills/ip-risk-triage`
- A successful verification reports both steps within their caps and writes a
  probe-only receipt.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint(s) this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay

_Third-party: “IPinfo” and “Abstract API” are trademarks of their respective
owners. This skill calls their public MPP gateways and is not affiliated with or
endorsed by either provider._
