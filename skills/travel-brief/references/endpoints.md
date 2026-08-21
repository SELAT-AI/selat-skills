# Endpoints — travel-brief

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 7-day weather forecast | POST | `https://weather.payapi.market/forecast` | routed (Gateway-batched outbound) | $0.001 |
| IP geolocation context | POST | `https://ip-geo-api-production.up.railway.app/lookup/ip` | routed (Gateway-batched outbound) | $0.001 |
| Destination QR code | POST | `https://qr-code.api.klymax402.com/api/qr` | routed (Gateway-batched outbound) | $0.003 |

- **Provider (weather):** payapi.market — 7-day forecast by place name.
- **Provider (ip-geo):** ip-geo-api (source: ip-api.com) — IPv4 geolocation with ISP/ASN/datacenter flags.
- **Provider (qr):** klymax402 — PNG QR codes returned as base64 + data URI.
- **Payment:** all three routed via the SELAT Router (outbound leg: Gateway-batched x402 / erc-3009).

## Pinned request schemas (verified live 2026-08-22)

### POST https://weather.payapi.market/forecast

Body (JSON):

| Field | Type | Required | Notes |
|---|---|---|---|
| `location` | string | yes | Place name, e.g. `"London"`. Spaces are fine unencoded. |

Live response (200): `location{name, country, latitude, longitude}`, `days[]{date, temp_max_c, temp_min_c, precipitation_mm, rain_mm, wind_max_kmh, weather_code, weather_description, sunrise, sunset}`, `cached`.

Live quote observed: $0.00105 USDC on eip155:137 (catalog lists $0.001).

### POST https://ip-geo-api-production.up.railway.app/lookup/ip

Body (JSON):

| Field | Type | Required | Notes |
|---|---|---|---|
| `ip` | string | yes | IPv4 dotted quad, e.g. `"8.8.8.8"` |

Live response (200): `country`, `region_code`, `city`, `postal_code`, `latitude`, `longitude`, `timezone`, `isp`, `org`, `asn`, `is_datacenter`, `is_proxy`, `is_vpn`, `source`.

Live quote observed: $0.00105 USDC on eip155:137 (catalog lists $0.001).

### POST https://qr-code.api.klymax402.com/api/qr

Body (JSON):

| Field | Type | Required | Notes |
|---|---|---|---|
| `data` | string | yes | Text/URL to encode. Field name is `data` — `text`/`url` are rejected by the router schema check before payment. |

Live response (200): `qr_base64`, `data_uri` (image/png), `width` (290), `height` (290), `modules`, `inputData`, `inputLength`.

Live quote observed: $0.00315 USDC on eip155:137 (catalog lists $0.003).
