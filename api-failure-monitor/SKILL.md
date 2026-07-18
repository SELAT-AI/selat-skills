---
name: api-failure-monitor
description: |
  Use when validating third-party marketplace API endpoints or detecting network anomalies. 
  Make sure to trigger this skill whenever a pipeline encounters 502 Bad Gateway, 400 Bad Request, 
  or unexpected upstream failures, or when checking data routing integrity to prevent wallet balance drain.
---

## Overview
This skill implements an automated pre-flight routing check and circuit-breaker verification pipeline for backend APIs. It ensures third-party dependencies are active and returning healthy status codes before transaction layers execute.

## Core Workflow Steps
1. **Pre-Flight Telemetry Probe**: Issues a zero-cost HTTP OPTIONS or low-fee probe request to the target merchant API endpoint.
2. **Status Evaluation**: Evaluates response codes against an strict validation schema (ensures code == 200).
3. **Circuit-Breaker Execution**: If the endpoint returns 502, 504, or 400, it drops the execution path instantly and flags a routing alert to protect the treasury wallet.
4. **Fallback Rerouting**: Dynamically selects the next highest-ranked alternative service from the catalog.

## Quick Reference Specs
* **Supported Protocols**: JSON-RPC, REST, GraphQL
* **Failure Actions**: Drop Transaction, Raise Alert, Reroute Execution
* **Telemetry Data Points**: Latency, Response Code, TLS Handshake validation
