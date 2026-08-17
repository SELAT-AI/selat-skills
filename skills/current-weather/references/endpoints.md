# Endpoints — current-weather

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| current weather | POST | `https://weather.payapi.market/current` | routed (x402 via Circle Gateway, Gateway-batched outbound) | $0.00105 |

- **Provider:** weather.payapi.market — current conditions for any global location (Open-Meteo data, keyless). Source catalog: bazaar.
- **Request body (required field):**
  ```json
  { "location": "London" }
  ```
  `location` accepts a city name ("London", "New York", "Tokyo") or `"lat,lon"` coordinates ("51.5,-0.12"). The provider resolves it to a canonical place (name + lat/lon in the response).
- **Payment:** routed via the SELAT Router (`https://router.selat.ai`), protocol x402, settlement `GatewayWalletBatched` on eip155:8453 (Base). Probe-confirmed live price **$0.001050/call** (provider asks $0.0010; router adds a small markup). The paid run resolves the settlement chain from the funded Circle Gateway balance.
- **Response shape (Open-Meteo):**
  ```json
  {
    "location": { "name": "London", "latitude": 51.50853, "longitude": -0.12574 },
    "current": {
      "temperature_c": 21.7,
      "feels_like_c": 21.2,
      "humidity_pct": 52,
      "precipitation_mm": 0,
      "rain_mm": 0,
      "wind_speed_kmh": 8.6,
      "wind_direction_deg": 323,
      "weather_code": 1,
      "weather_description": "Mainly clear",
      "time": "2026-08-17T10:30",
      "timezone": "Europe/London"
    },
    "cached": false
  }
  ```
- **Verified live 2026-08-17:** real paid call returned `status=200`, `outcome=settled` for `{"location":"London"}`.
