# API Failure Monitor — Telemetry & Rerouting Reference

## Telemetry Response Schema

The probe script outputs a JSON payload with the following fields:

| Field | Type | Description |
|---|---|---|
| `status` | `string` | `HEALTHY` (within SLA & 200/402), `DEGRADED` (latency > SLA), or `UNHEALTHY`/`DOWN` (HTTP error or network fail). |
| `circuit_breaker` | `string` | `CLOSED` (safe to proceed) or `TRIPPED` (halt paid execution). |
| `http_code` | `number` | HTTP status code returned by target node (e.g. 200, 402, 429, 502). |
| `latency_ms` | `number` | Total round-trip latency in milliseconds. |
| `action` | `string` | Recommended runtime directive (`PROCEED` or `HALT_AND_REROUTE`). |

## HTTP Code Decision Matrix

| HTTP Status Code | Meaning | Circuit Breaker | Action |
|---|---|---|---|
| **200 OK** | Endpoint fully functional | `CLOSED` | `PROCEED` |
| **402 Payment Required** | Valid SELAT MPP Challenge | `CLOSED` | `PROCEED` |
| **429 Rate Limited** | Upstream rate limit reached | `TRIPPED` | `HALT_AND_REROUTE` |
| **500 Internal Error** | Server-side bug | `TRIPPED` | `HALT_AND_REROUTE` |
| **502 Bad Gateway** | Upstream provider offline | `TRIPPED` | `HALT_AND_REROUTE` |
| **504 Gateway Timeout** | Response timed out | `TRIPPED` | `HALT_AND_REROUTE` |
