---
name: current-weather
description: Use this skill when the user wants the current weather for a place — "what's the weather in London", "temperature in Tokyo", "is it raining in NYC", "how windy is it in Berlin". Returns temperature, feels-like, humidity, precipitation, wind, and a human-readable condition for any global city or lat/lon, keyless (Open-Meteo), paid per call (~$0.001) over x402 via the SELAT Router.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.2, and a funded Circle Gateway balance (settles on whichever supported chain the balance sits on).
metadata:
  author: muhammadbanna
  version: "1.0"
  rail: routed
  kind: single
---

# current-weather

## When To Use

Use when the user asks for **current** weather conditions (temperature, conditions, wind, humidity, rain) for a specific place. Not for forecasts (this endpoint is current-conditions only), not for historical data, not for anything else.

Trigger on phrasings like:
- "what's the weather in <place>" / "weather in <place>" / "temperature in <place>"
- "is it raining/snowing/windy in <place>"
- "how hot is it in <place>" / "current conditions <place>"
- any casual mix of a place name + a weather word ("nyc weather", "weather tokyo", "how's the weather in Bali")

Do NOT trigger on: financial "weather" (market/sentiment), weather forecasts/5-day outlooks, climate data, or astronomy (moon/aurora).

## Workflow

1. Extract the place from the user's request. Default to the exact city they named — do not guess or normalize unless it's obviously ambiguous ("Paris" → ask which Paris, or use the most likely and say so).
2. Run:
   `selat skill run current-weather --location "<place>"`
3. Tell the user: this is a ~$0.001 paid call from their Gateway balance — proceed (only if they haven't already approved this skill's spend).
4. Relay the result in plain language: temperature, feels-like, humidity, precipitation, wind speed + direction, and the condition description (e.g. "Mainly clear"). Keep raw JSON out of the reply.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `location` | yes | — | City name ("London") or "lat,lon" coordinates ("51.5,-0.12"). Case-insensitive. |

Output (from the provider, Open-Meteo data):
- `location.name` / `location.latitude` / `location.longitude` — resolved place
- `current.temperature_c`, `current.feels_like_c` — °C
- `current.humidity_pct` — relative humidity %
- `current.precipitation_mm`, `current.rain_mm` — precipitation
- `current.wind_speed_kmh`, `current.wind_direction_deg`
- `current.weather_code`, `current.weather_description` — condition (e.g. "Mainly clear")
- `current.time`, `current.timezone`, `cached`

## Gotchas

- **`body.location` is required** and validated before signing — selat-pay refuses the call (free, before payment) if it's missing or not a string.
- One call = one location. For multiple places, run once per place (each is a separate ~$0.001 charge).
- This is **current conditions only** — no forecast/history endpoints in this skill.
- `cached: true` means the provider served a recent cached reading; values are still current-hour.
- Temperature is Celsius; convert for US users ("21.7 °C ≈ 71 °F").
- Max spend per run is capped at $0.01 (actual price ≈ $0.001).

## Validation

- Probe (no pay): `selat-pay POST "https://weather.payapi.market/current" --chain base --body '{"location":"London"}' --probe-only`
- Paid verify: `selat-pay POST "https://weather.payapi.market/current" --chain base --body '{"location":"London"}'` → a successful run prints `status=200` and the weather JSON.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint this skill calls.
- selat-pay — https://github.com/SELAT-AI/selat-pay
