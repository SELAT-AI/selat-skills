---
name: api-failure-monitor
description: "Zero-cost pre-flight telemetry probe and circuit-breaker verification for SELAT API endpoints and paid agent pipelines."
license: Apache-2.0
compatibility: Requires Python 3.8+ and network access.
metadata:
  author: selat-ai
  version: "1.0"
---

# api-failure-monitor

## When To Use
- Use before triggering high-cost multi-step pipelines (e.g. `enrich-waterfall`, `email-campaign`, `sales-prospecting`) to verify upstream provider health.
- Use whenever an upstream node returns `502 Bad Gateway`, `504 Gateway Timeout`, or `429 Too Many Requests`.
- Use to test endpoint latency (P95/P99) and MPP challenge status before committing paid transactions.
- Use to protect treasury wallet balances against billing failures on degraded third-party nodes.

## Workflow
1. **Trigger Telemetry Probe**: Execute `python3 scripts/probe_check.py --url <ENDPOINT>` with optional `--max-latency` and `--timeout`.
2. **Evaluate Circuit Status**:
   - If `circuit_breaker == CLOSED` (HTTP status 200 or 402 MPP within SLA): Proceed with normal pipeline execution.
   - If `circuit_breaker == TRIPPED` (HTTP 5xx, 429, or timeout): Drop the execution path to prevent token/credit burn.
3. **Execute Fallback Rerouting**: Dynamically select the next highest-ranked alternative provider from the catalog matrix.

## Inputs And Outputs
- **Inputs**:
  - `target_url` (required): Target API endpoint URL to probe.
  - `max_latency_ms` (optional, default 1500): Threshold for round-trip latency in milliseconds.
  - `timeout` (optional, default 3.0): Probe timeout threshold in seconds.
- **Outputs**:
  - `status`: `HEALTHY`, `DEGRADED`, or `DOWN`.
  - `circuit_breaker`: `CLOSED` or `TRIPPED`.
  - `http_code`: Extracted HTTP status code (e.g. 200, 402, 502).
  - `latency_ms`: Round-trip probe duration in milliseconds.
  - `action`: Recommended runtime step (`PROCEED` or `HALT_AND_REROUTE`).

## Gotchas
- **HTTP 402 is REACHABLE**: In the SELAT ecosystem, HTTP 402 Payment Required is an expected status code indicating a live MPP endpoint challenge. Do not treat 402 as an upstream failure.
- **Silent 200 Error Bodies**: HTML error templates from Cloudflare/NGINX or JSON error structures `{ "status": "error" }` may return HTTP 200. The probe script inspects payload signatures to prevent false positives.

## Validation
- Validate static SOP & schema compliance:
  ```bash
  npm run validate
  ```
- Run dry-run telemetry probe test:
  ```bash
  python3 skills/api-failure-monitor/scripts/probe_check.py --url https://router.selat.ai/v1/probe --dry-run
  ```

## References
- See `references/endpoints.md` for error code definitions, threshold rules, and fallback routing mappings.
