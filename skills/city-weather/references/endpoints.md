# Endpoints — city-weather

weather.payapi.market's **Weather Data API** exposed as x402 endpoints, paid per
call via selat-pay (USDC), **routed** through the SELAT Router. No API key.

Schemas below are pinned from the upstream's own OpenAPI (`GET
https://weather.payapi.market/openapi.json`, title "Weather Data API", OpenAPI
3.1.0) and corroborated against the 402 `payment-required` bazaar schema returned
by the live endpoint. Prices are the catalogue list price; the live routed quote
runs a few percent higher (router margin).

## The steps this skill wires

| # | Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|---|
| 1 | Current conditions | POST | `https://weather.payapi.market/current` | routed x402 | $0.001 (live ≈ $0.00105) |
| 2 | Multi-day forecast | POST | `https://weather.payapi.market/forecast` | routed x402 | $0.001 (live ≈ $0.00105) |

`maxAmount`: full-run cap **$0.01** (headroom over the ~$0.0021 live total).

## All endpoints on this gateway (enriched)

| Endpoint | Method | ~Price | Wired here? |
|---|---|---|---|
| `/current` | POST | $0.001 | ✅ step 1 |
| `/forecast` | POST | $0.001 | ✅ step 2 |
| `/air-quality` | POST | $0.001 | ✗ (hand-build) |
| `/historical` | POST | $0.001 | ✗ (hand-build) |

### `POST /current` — Current weather conditions ($0.001)

Body (`CurrentRequest`):

| Field | Req | Type | Values / default |
|---|---|---|---|
| `location` | ✅ | string | City or place name, e.g. `London`, `New York` |
| `latitude` | | number \| null | Optional override, -90 to 90 |
| `longitude` | | number \| null | Optional override, -180 to 180 |

```bash
selat-pay POST "https://weather.payapi.market/current" \
  --body '{"location":"Jakarta"}' \
  --chain base --max-amount 0.005
```

Example response (from the merchant's bazaar schema):

```json
{
  "location": {"name":"London","country":"United Kingdom","latitude":51.50853,"longitude":-0.12574},
  "current": {
    "temperature_c": 12.4, "feels_like_c": 10.1, "humidity_pct": 78,
    "precipitation_mm": 0.0, "rain_mm": 0.0, "wind_speed_kmh": 14.3,
    "wind_direction_deg": 230, "weather_code": 2,
    "weather_description": "Partly cloudy", "time": "2026-05-02T10:00",
    "timezone": "Europe/London"
  },
  "cached": false
}
```

### `POST /forecast` — Multi-day weather forecast ($0.001)

Body (`ForecastRequest`):

| Field | Req | Type | Values / default |
|---|---|---|---|
| `location` | ✅ | string | City or place name |
| `days` | | integer | 1–16, default 7 |

⚠️ `days` must arrive as a JSON **integer**. The skill runner substitutes `${param}`
as strings only, so this skill hard-codes `days: 3` in the manifest body instead of
wiring it as a param.

```bash
selat-pay POST "https://weather.payapi.market/forecast" \
  --body '{"location":"Jakarta","days":3}' \
  --chain base --max-amount 0.005
```

### `POST /air-quality` — Air quality index ($0.001)

Body (`AirQualityRequest`): `{ "location": "<city>" }` — required `location` only.

### `POST /historical` — Historical weather ($0.001)

Body (`HistoricalRequest`):

| Field | Req | Type | Values / default |
|---|---|---|---|
| `location` | ✅ | string | City or place name |
| `start_date` | ✅ | string | `YYYY-MM-DD` |
| `end_date` | ✅ | string | `YYYY-MM-DD` |
