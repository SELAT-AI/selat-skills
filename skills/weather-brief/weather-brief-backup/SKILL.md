---
name: weather-brief
description: Use this skill when the user wants the current weather, a short forecast, or air quality for a place — "what's the weather in Jakarta?", "is it raining in Tokyo?", "5-day forecast for London", "air quality today". Returns current conditions, temperature, 5-day forecast, and AQI for a lat/lon. Pays over routed MPP (USDC on Base) via the SELAT Router; no API key.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.3.2, and a funded Circle Gateway balance (settles on whichever supported chain the balance sits on).
metadata:
  author: kiyeps
  version: "1.0"
  rail: routed
  kind: multi
---

# weather-brief

## When To Use

Pick this skill when the user asks about current weather, a multi-day forecast,
or air quality for a specific place. It needs a latitude and longitude. For a
city name, first resolve it to lat/lon (geocode) — the agent can use a free
geocoding lookup or ask the user for coordinates. It is NOT for historical
weather or storm tracking.

## Workflow

1. Install: `selat skill install weather-brief`
2. Run: `selat skill run weather-brief --lat -6.2 --lon 106.8`
3. The CLI compiles each step into a `selat-pay` call and prints the result.

Steps (all routed MPP via the SELAT Router, cheapest-first):

- **OpenWeather** `POST /openweather/current-weather` — current conditions + temperature.
- **OpenWeather** `POST /openweather/forecast-5day` — 5-day forecast.
- **OpenWeather** `POST /openweather/air-quality` — air quality index.

Tell the user: "This costs about $0.006–0.009 per call — proceed?" before any paid
run, then relay the brief in plain language (current temp, conditions, 5-day
outlook, AQI). Keep raw JSON and wallet addresses out of what you relay.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `lat` | yes | — | Latitude, e.g. `-6.2` for Jakarta. |
| `lon` | yes | — | Longitude, e.g. `106.8` for Jakarta. |

Output: current temperature + conditions, 5-day forecast, and AQI for the location.

## Gotchas

- Requires numeric `lat`/`lon` (decimal degrees). For a city name, geocode first.
- Each step is a separate paid call (~$0.006–0.010). The manifest caps the whole
  run at $0.070; a normal 3-step brief lands around $0.021–0.033.
- The manifest is linear — it runs the steps in order. If the current-weather step
  fails, the agent should report what it got rather than assuming the rest ran.
- POST params go in the `body`, not the query string.

## Validation

> `--chain base` below is only the flag `selat-pay` requires for a probe — probing
> reads a free, chain-independent quote and never settles. A paid run resolves the
> settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe (no pay): `selat-pay POST "https://openweather.mpp.paywithlocus.com/openweather/current-weather" --body '{"lat":-6.2,"lon":106.8}' --chain base --probe-only`
- A successful run prints `status=200`.

## References

- `manifest.json` — the machine-readable payment recipe this skill runs.
- [`references/endpoints.md`](references/endpoints.md) — the catalogue endpoint(s) this skill calls.
- [`references/agent-skill-authoring-sop.md`](../../references/agent-skill-authoring-sop.md) — authoring standard.
- selat-pay — https://github.com/SELAT-AI/selat-pay