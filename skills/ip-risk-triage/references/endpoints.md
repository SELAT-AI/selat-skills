# Endpoints — ip-risk-triage

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 | POST | `https://ipinfo.mpp.paywithlocus.com/ipinfo/ip-lookup` | routed MPP | $0.001 |
| 2 | POST | `https://abstract-ip-intelligence.mpp.paywithlocus.com/abstract-ip-intelligence/lookup` | routed MPP | $0.006 |

- **IPinfo body:** `{"ip":"${ip}"}`. Returns geolocation, ASN, privacy,
  hosting, carrier, and company fields according to provider availability.
- **Abstract body:** `{"ip_address":"${ip}"}`. Returns VPN, proxy, Tor, bot,
  and related IP-intelligence signals.
- **Payment:** routed MPP via the SELAT Router. The live quote is authoritative;
  manifest caps include routing headroom.
- **Catalogue documentation:**
  - https://paywithlocus.com/mpp/ipinfo.md
  - https://paywithlocus.com/mpp/abstract-ip-intelligence.md
- **Provider documentation:**
  - https://ipinfo.io/developers
  - https://www.abstractapi.com/api/ip-intelligence
