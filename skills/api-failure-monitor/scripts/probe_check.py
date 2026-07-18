#!/usr/bin/env python3
"""
SELAT Pre-Flight Telemetry Probe & Circuit Breaker Evaluator

Probes SELAT API endpoints to evaluate health, round-trip latency, and HTTP 402/MPP challenges
before executing paid transactions. Returns structured JSON telemetry for agent runtimes.
"""

import sys
import json
import time
import argparse
import urllib.request
import urllib.error


def parse_args():
    parser = argparse.ArgumentParser(
        description="SELAT Pre-Flight Telemetry Probe & Circuit Breaker Evaluator"
    )
    parser.add_argument(
        "--url",
        default="https://router.selat.ai/v1/probe",
        help="Target API endpoint URL to probe (default: https://router.selat.ai/v1/probe)",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=3.0,
        help="Probe timeout in seconds (default: 3.0)",
    )
    parser.add_argument(
        "--max-latency",
        type=int,
        default=1500,
        help="Max acceptable latency in milliseconds (default: 1500)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate check without network calls",
    )
    return parser.parse_args()


def probe_endpoint(url, timeout, max_latency, dry_run=False):
    if dry_run:
        return {
            "status": "HEALTHY",
            "circuit_breaker": "CLOSED",
            "http_code": 200,
            "latency_ms": 42,
            "action": "PROCEED",
            "dry_run": True,
        }

    start_time = time.time()
    req = urllib.request.Request(url, method="OPTIONS")
    req.add_header("User-Agent", "SELAT-Telemetry-Probe/1.0")

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            latency_ms = int((time.time() - start_time) * 1000)
            code = response.status
            healthy = (200 <= code < 300 or code == 402) and latency_ms <= max_latency

            return {
                "status": "HEALTHY" if healthy else "DEGRADED",
                "circuit_breaker": "CLOSED" if healthy else "TRIPPED",
                "http_code": code,
                "latency_ms": latency_ms,
                "action": "PROCEED" if healthy else "HALT_AND_REROUTE",
            }
    except urllib.error.HTTPError as e:
        latency_ms = int((time.time() - start_time) * 1000)
        # HTTP 402 Payment Required is considered REACHABLE / HEALTHY in SELAT
        if e.code == 402:
            healthy = latency_ms <= max_latency
            return {
                "status": "HEALTHY" if healthy else "DEGRADED",
                "circuit_breaker": "CLOSED" if healthy else "TRIPPED",
                "http_code": 402,
                "latency_ms": latency_ms,
                "action": "PROCEED" if healthy else "HALT_AND_REROUTE",
            }
        return {
            "status": "UNHEALTHY",
            "circuit_breaker": "TRIPPED",
            "http_code": e.code,
            "latency_ms": latency_ms,
            "action": "HALT_AND_REROUTE",
        }
    except Exception as e:
        return {
            "status": "DOWN",
            "circuit_breaker": "TRIPPED",
            "error": str(e),
            "action": "HALT_AND_REROUTE",
        }


def main():
    args = parse_args()
    result = probe_endpoint(args.url, args.timeout, args.max_latency, args.dry_run)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["circuit_breaker"] == "CLOSED" else 1)


if __name__ == "__main__":
    main()
