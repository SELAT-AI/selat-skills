#!/usr/bin/env node
/**
 * cheapest-viable-call — free pre-purchase shortlist for a capability request.
 *
 * Spends nothing. Cross-references two existing free `selat` calls for the
 * same intent instead of re-implementing discovery or probing:
 *
 *   selat search "<intent>" --top N --json        catalogue-advertised price
 *                                                  + declared input schema
 *   selat skill compare "<intent>" --limit N --json  live 402 probe: reachable,
 *                                                  router-quoted price, exact
 *                                                  failure signature when not
 *
 * `compare` already tells you what's reachable; it does not carry the
 * catalogue-advertised price at all, so it can't tell you when that price is
 * wrong. This script joins the two (by endpoint.url) to add the one signal
 * neither surfaces alone: catalogue-vs-live price divergence, plus a
 * schema-confidence flag so a caller knows *before* paying whether a required
 * parameter is even documented.
 *
 * Usage:
 *   node cheapest-viable-call.mjs "<intent>" [--limit N] [--json] [--dry-run]
 *   node cheapest-viable-call.mjs --help
 */
import { execFileSync } from "node:child_process";

const HELP = `cheapest-viable-call — free pre-purchase shortlist of payable endpoints for a capability.

Usage:
  cheapest-viable-call.mjs "<intent>" [--limit N] [--json] [--dry-run]
  cheapest-viable-call.mjs --help

Spends nothing — both underlying selat calls are free discovery/probes:
  selat search "<intent>" --top N --json
  selat skill compare "<intent>" --limit N --json

Flags:
  --limit N   Candidates to shortlist and probe (default 8)
  --json      Machine-readable output (default: human table to stdout)
  --dry-run   Print the two selat commands this would run, without running them
  --help, -h  Show this help

Exit codes:
  0  at least one payable survivor found
  1  ran cleanly, but zero candidates survived the probe
  2  a 'selat' subcommand failed or returned unparseable output
`;

function parseArgs(argv) {
  const o = { limit: 8, json: false, dryRun: false, intent: null };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") { o.help = true; continue; }
    if (a === "--limit") { o.limit = Number(argv[++i]); continue; }
    if (a === "--json") { o.json = true; continue; }
    if (a === "--dry-run") { o.dryRun = true; continue; }
    rest.push(a);
  }
  o.intent = rest.join(" ").trim() || null;
  return o;
}

function shq(s) {
  return /[^A-Za-z0-9_./-]/.test(s) ? `"${String(s).replace(/"/g, '\\"')}"` : s;
}

// `selat search`/`selat skill compare` exit non-zero when zero candidates are
// reachable (documented: "Exit code 0 when at least one candidate is
// reachable") but still print a valid JSON body to stdout in that case — a
// real "nothing payable" result, not a command failure. Only treat it as a
// hard error when stdout isn't parseable JSON at all.
function runJson(cmd, cmdArgs) {
  try {
    return JSON.parse(execFileSync(cmd, cmdArgs, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
  } catch (e) {
    if (e.stdout) {
      try { return JSON.parse(e.stdout); } catch { /* fall through */ }
    }
    throw e;
  }
}

function schemaConfidence(inputSchema) {
  if (!inputSchema) {
    return { level: "schema-unknown", note: "no declared schema in the catalogue — a call may be charged and still fail on a missing param" };
  }
  const params = inputSchema.parameters || [];
  if (inputSchema.required == null) {
    return { level: "schema-unknown", note: "catalogue does not mark parameters required/optional (required: null) — a call may be charged and still fail on a missing param" };
  }
  if (params.length === 0) {
    return { level: "no-params-declared", note: "catalogue declares zero parameters for this endpoint" };
  }
  return { level: "declared", note: `${params.length} parameter(s) declared, required=${JSON.stringify(inputSchema.required)}` };
}

const DIVERGENCE_FLAG_PCT = 15; // catalogue-vs-live gaps at or beyond this are flagged

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }
  if (!args.intent) {
    console.log(HELP);
    process.exit(1);
  }

  const SELAT = process.env.SELAT_RUNNER || "selat";
  const searchArgs = ["search", args.intent, "--top", String(args.limit), "--json"];
  const compareArgs = ["skill", "compare", args.intent, "--limit", String(args.limit), "--json"];

  if (args.dryRun) {
    console.log(`Would run (no spend either way):\n  ${SELAT} ${searchArgs.map(shq).join(" ")}\n  ${SELAT} ${compareArgs.map(shq).join(" ")}`);
    process.exit(0);
  }

  console.error(`▸ discovering candidates for "${args.intent}" (free — no spend)…`);
  let searchOut;
  try {
    searchOut = runJson(SELAT, searchArgs);
  } catch (e) {
    console.error(`error: '${SELAT} ${searchArgs.join(" ")}' produced no usable JSON output (${e.status != null ? `exit ${e.status}` : e.code || "spawn error"})`);
    process.exit(2);
  }

  console.error(`▸ free-probing candidates at their catalog serviceUrl (never settles)…`);
  let compareOut;
  try {
    compareOut = runJson(SELAT, compareArgs);
  } catch (e) {
    console.error(`error: '${SELAT} ${compareArgs.join(" ")}' produced no usable JSON output (${e.status != null ? `exit ${e.status}` : e.code || "spawn error"})`);
    process.exit(2);
  }

  // Index catalogue-advertised price + declared schema by endpoint URL — this
  // is the data `compare` does not carry.
  const byUrl = new Map();
  for (const r of searchOut.results || []) {
    const url = r.endpoint?.url;
    if (!url) continue;
    const catalogueUsd = r.minAmountUsd ?? (r.payments || [])[0]?.amountUsd ?? null;
    byUrl.set(url, {
      catalogueUsd,
      inputSchema: r.endpoint?.inputSchema ?? null
    });
  }

  const survivors = [];
  const discarded = [];

  for (const c of compareOut.candidates || []) {
    const url = c.endpoint?.url;
    const cat = byUrl.get(url) || null;
    if (!c.probe || !c.probe.reachable) {
      discarded.push({
        service: c.service?.name ?? c.service?.id ?? url,
        endpoint: url,
        failureSignature: c.probe?.error ?? "unreachable (no probe error captured)"
      });
      continue;
    }
    const liveUsd = c.probe.livePriceUsd;
    const catalogueUsd = cat?.catalogueUsd ?? null;
    let divergencePct = null;
    if (liveUsd != null && catalogueUsd != null && catalogueUsd > 0) {
      divergencePct = +(((liveUsd - catalogueUsd) / catalogueUsd) * 100).toFixed(1);
    }
    survivors.push({
      service: c.service?.name ?? c.service?.id ?? url,
      endpoint: url,
      method: c.endpoint?.method ?? "GET",
      livePriceUsd: liveUsd,
      catalogueUsd,
      divergencePct,
      divergenceFlag: divergencePct != null && Math.abs(divergencePct) >= DIVERGENCE_FLAG_PCT,
      priceNote: catalogueUsd == null ? "catalogue price unavailable for this endpoint — live probe price only, unverified against a second source" : null,
      schema: cat ? schemaConfidence(cat.inputSchema) : schemaConfidence(null)
    });
  }

  survivors.sort((a, b) => (a.livePriceUsd ?? Infinity) - (b.livePriceUsd ?? Infinity));

  const result = {
    intent: args.intent,
    checkedAt: new Date().toISOString(),
    candidatesProbed: (compareOut.candidates || []).length,
    payableCount: survivors.length,
    discardedCount: discarded.length,
    survivors,
    discarded
  };

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\n${result.payableCount}/${result.candidatesProbed} candidates payable for "${args.intent}"\n`);
    if (survivors.length === 0) {
      console.log("No payable candidates survived the probe. See discarded[] for exact failure signatures (rerun with --json).");
    } else {
      for (const s of survivors) {
        const price = s.livePriceUsd != null ? `$${s.livePriceUsd.toFixed(6)}` : "price unknown";
        const div = s.divergencePct != null
          ? `${s.divergenceFlag ? "⚠ " : ""}${s.divergencePct > 0 ? "+" : ""}${s.divergencePct}% vs catalogue`
          : "no catalogue price to compare";
        console.log(`- ${s.service}`);
        console.log(`    ${s.method} ${s.endpoint}`);
        console.log(`    live: ${price}  (${div})`);
        console.log(`    schema: ${s.schema.level} — ${s.schema.note}`);
      }
    }
    if (discarded.length > 0) {
      console.log(`\n${discarded.length} discarded (failed the free probe):`);
      for (const d of discarded) {
        console.log(`- ${d.service}: ${d.failureSignature}`);
      }
    }
  }

  process.exit(survivors.length > 0 ? 0 : 1);
}

main();
