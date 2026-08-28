# Endpoints — weather-brief

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| current weather | POST | `https://openweather.mpp.paywithlocus.com/openweather/current-weather` | routed (MPP via SELAT Router) | $0.006 |
| 5-day forecast | POST | `https://openweather.mpp.paywithlocus.com/openweather/forecast-5day` | routed (MPP via SELAT Router) | $0.008 |
| air quality | POST | `https://openweather.mpp.paywithlocus.com/openweather/air-quality` | routed (MPP via SELAT Router) | $0.006 |

- **Provider:** OpenWeather.
- **Payment:** routed via the SELAT Router (outbound leg: MPP on Tempo). Live
  probe confirms `mpp=yes`, `mode=routed-mpp`, prices `$0.006300` (current),
  `$0.008400` (forecast-5day), `$0.006300` (air-quality) on eip155:137 (gateway
  price runs a few percent above the catalogue).

## Param mapping

| Manifest `${param}` | Upstream field | Type | Required | Notes |
|---|---|---|---|---|
| `${lat}` | `lat` | number (as string) | yes | Decimal latitude, e.g. `-6.2`. |
| `${lon}` | `lon` | number (as string) | yes | Decimal longitude, e.g. `106.8`. |

## Verification notes

- All three endpoints surface an MPP 402 challenge at the `serviceUrl`
  (`openweather.mpp.paywithlocus.com`), not the provider host — confirmed with
  `selat-pay ... --live-probe` (free, no settlement).
- The `body` must use `lat`/`lon` (not `q` or `city`); probing with `{"q":"..."}`
  returned "no challenge", while `{"lat":-6.2,"lon":106.8}` surfaces MPP.
- `forecast-5day` and `onecall` both work; this skill uses forecast-5day for the
  forecast step (cheaper than onecall) and air-quality for the AQI step.