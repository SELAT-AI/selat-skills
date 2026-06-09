#!/usr/bin/env node
/**
 * Reliability probe — the auto-verify registry job.
 *
 * For every skill in skills/, probe each step's live HTTP-402 challenge with
 * `selat-pay --probe-only` (FREE — reads the quote, never signs or pays, so this
 * needs no funded wallet and no secrets) and record reachability, the real
 * quoted USDC price, the rail, latency, and whether the live price is within the
 * step's maxAmount cap. Writes the aggregate to reliability.json at the repo
 * root — a community-readable reliability registry, fetchable over raw like
 * index.json and consumable by the CLI/web.
 *
 * This is the scheduled half of the contribution gate: `selat skill verify`
 * proves a skill once at submit time; this re-verifies the whole catalogue on a
 * cron so reliability reflects current reality, not the day it was merged.
 *
 * Self-contained (no selat-cli import) but mirrors lib/skill-registry.mjs
 * (compileStep + parseProbeStdout) so probe argv and parsing match the CLI.
 *
 * Requires `selat-pay` (>= 0.3.2) on PATH. Honors SELAT_ROUTER_URL (for routed
 * steps) via selat-pay's own dotenv/env. Always exits 0 unless it cannot run at
 * all — a down upstream is data to record, not a CI failure.
 */
import { readdirSync, existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = join(ROOT, "skills");
const OUT = join(ROOT, "reliability.json");
const TIMEOUT_MS = Number(process.env.SELAT_PROBE_TIMEOUT_MS || 30000);
const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const BODY_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

// ── param resolution for unattended probing ─────────────────────────────────
// Use each param's `default`; for required params without one, pick a sane
// placeholder. The 402 challenge precedes upstream param validation, so a
// placeholder still surfaces real price/rail/reachability.
function placeholderFor(key, nowSec) {
  const k = key.toLowerCase();
  if (k.includes("start_time") || k === "from" || k === "since") return String(nowSec - 2 * 86400);
  if (k.includes("end_time") || k === "to" || k === "until") return String(nowSec);
  if (k.includes("address")) return "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // USDC (Ethereum)
  if (k.includes("chain")) return "ethereum";
  if (k === "symbols" || k === "symbol" || k === "token" || k === "tokens") return "ETH";
  if (k === "query" || k === "q" || k === "search") return "crypto";
  return "test";
}

function resolveParams(manifest, nowSec) {
  const out = {};
  for (const [key, spec] of Object.entries(manifest.params || {})) {
    out[key] = spec && spec.default != null ? String(spec.default) : placeholderFor(key, nowSec);
  }
  return out;
}

// ── substitution + compile (mirrors lib/skill-registry.mjs) ─────────────────
function substitute(template, params, urlEncode) {
  return String(template).replace(/\$\{([a-zA-Z0-9_]+)(\|join)?\}/g, (_, key, join) => {
    let value = params[key];
    if (value == null) throw new Error(`unknown parameter \${${key}} in template`);
    if (join && Array.isArray(value)) value = value.join(",");
    value = String(value);
    return urlEncode ? encodeURIComponent(value) : value;
  });
}

function substituteDeep(value, params) {
  if (typeof value === "string") return substitute(value, params, false);
  if (Array.isArray(value)) return value.map((v) => substituteDeep(v, params));
  if (value && typeof value === "object") {
    const o = {};
    for (const [k, v] of Object.entries(value)) o[k] = substituteDeep(v, params);
    return o;
  }
  return value;
}

function compileStep(manifest, step, params) {
  const method = String(step.method).toUpperCase();
  if (!HTTP_METHODS.includes(method)) throw new Error(`unsupported method: ${step.method}`);
  const chain = step.chain ?? manifest.chain;
  const maxAmount = step.maxAmount ?? manifest.maxAmount;
  if (!chain) throw new Error("no chain set");
  if (maxAmount == null) throw new Error("no maxAmount set");
  const url = substitute(step.url, params, true);
  const argv = [method, url, "--chain", String(chain), "--max-amount", String(maxAmount)];
  if (step.body != null && BODY_METHODS.includes(method)) {
    const body = typeof step.body === "string"
      ? substitute(step.body, params, false)
      : JSON.stringify(substituteDeep(step.body, params));
    argv.push("--body", body);
  }
  for (const a of argv) if (/[\0\r\n]/.test(a)) throw new Error("compiled argv has a control character");
  return argv;
}

function parseProbeStdout(stdout) {
  let json = null;
  try { json = JSON.parse(String(stdout).trim()); }
  catch {
    const a = String(stdout).indexOf("{"), b = String(stdout).lastIndexOf("}");
    if (a !== -1 && b > a) { try { json = JSON.parse(String(stdout).slice(a, b + 1)); } catch {} }
  }
  if (!json || !json.mode) return { mode: null, livePriceUsd: null };
  const amt = json.quote?.price?.amount;
  const livePriceUsd = amt != null && Number.isFinite(Number(amt)) ? Number(amt) / 1_000_000 : null;
  return { mode: json.mode, livePriceUsd };
}

function deriveRail(manifest) {
  const rails = [...new Set((manifest.steps || []).map((s) => s.rail).filter(Boolean))];
  return rails.length === 0 ? "routed" : rails.length === 1 ? rails[0] : "mixed";
}

// ── probe one step ──────────────────────────────────────────────────────────
function probeStep(manifest, step, params) {
  const cap = Number(step.maxAmount ?? manifest.maxAmount);
  const base = {
    label: step.label ?? null,
    rail: step.rail ?? null,
    method: String(step.method).toUpperCase(),
    maxAmount: Number.isFinite(cap) ? cap : null,
  };
  let argv;
  try { argv = compileStep(manifest, step, params); }
  catch (e) { return { ...base, url: step.url, mode: null, reachable: false, livePriceUsd: null, withinCap: false, latencyMs: null, error: `compile: ${e.message}` }; }

  const url = argv[1];
  const t0 = Date.now();
  const r = spawnSync("selat-pay", [...argv, "--probe-only"], { encoding: "utf8", timeout: TIMEOUT_MS, maxBuffer: 16 * 1024 * 1024 });
  const latencyMs = Date.now() - t0;

  if (r.error) {
    const msg = r.error.code === "ETIMEDOUT" ? `probe timed out after ${TIMEOUT_MS}ms`
      : r.error.code === "ENOENT" ? "selat-pay not found on PATH"
      : r.error.message;
    return { ...base, url, mode: null, reachable: false, livePriceUsd: null, withinCap: false, latencyMs, error: msg };
  }

  const { mode, livePriceUsd } = parseProbeStdout(r.stdout || "");
  const reachable = r.status === 0 && mode != null;
  const withinCap = reachable && livePriceUsd != null && Number.isFinite(cap)
    ? livePriceUsd <= cap
    : reachable && livePriceUsd == null;
  let error = null;
  if (!reachable) error = (r.stderr || "").match(/\[selat-pay\] error: (.+)/)?.[1]?.trim() || "no x402/MPP challenge";
  else if (livePriceUsd != null && Number.isFinite(cap) && livePriceUsd > cap) error = `live price $${livePriceUsd} exceeds maxAmount $${cap}`;

  return { ...base, url, mode, reachable, livePriceUsd, withinCap, latencyMs, error };
}

// ── main ────────────────────────────────────────────────────────────────────
function main() {
  if (!existsSync(SKILLS_DIR)) { console.error(`no skills/ directory at ${SKILLS_DIR}`); process.exit(1); }
  const nowSec = Math.floor(Date.now() / 1000);
  const generatedAt = new Date().toISOString();

  const folders = readdirSync(SKILLS_DIR)
    .filter((f) => !f.startsWith(".") && statSync(join(SKILLS_DIR, f)).isDirectory())
    .sort();

  const skills = [];
  for (const folder of folders) {
    const manifestPath = join(SKILLS_DIR, folder, "manifest.json");
    if (!existsSync(manifestPath)) { console.error(`skip ${folder}: no manifest.json`); continue; }
    let manifest;
    try { manifest = JSON.parse(readFileSync(manifestPath, "utf8")); }
    catch (e) { skills.push({ name: folder, rail: null, status: "down", checkedAt: generatedAt, steps: [], error: `manifest: ${e.message}` }); continue; }

    const params = resolveParams(manifest, nowSec);
    const steps = (manifest.steps || []).map((s) => probeStep(manifest, s, params));
    const reachableCount = steps.filter((s) => s.reachable).length;
    const status = reachableCount === 0 ? "down"
      : steps.every((s) => s.reachable && s.withinCap) ? "ok"
      : "degraded";
    skills.push({ name: manifest.name || folder, rail: deriveRail(manifest), status, checkedAt: generatedAt, steps });
    const icon = status === "ok" ? "✓" : status === "degraded" ? "~" : "✗";
    console.log(`${icon} ${(manifest.name || folder).padEnd(28)} ${status.padEnd(9)} ${reachableCount}/${steps.length} steps reachable`);
  }

  const summary = {
    skills: skills.length,
    ok: skills.filter((s) => s.status === "ok").length,
    degraded: skills.filter((s) => s.status === "degraded").length,
    down: skills.filter((s) => s.status === "down").length,
  };

  const registry = {
    schema: "selat-reliability/v1",
    generatedAt,
    method: "selat-pay --probe-only (free live-402 quote; no paid call)",
    router: process.env.SELAT_ROUTER_URL || null,
    summary,
    skills,
  };
  writeFileSync(OUT, JSON.stringify(registry, null, 2) + "\n", "utf8");
  console.log(`\n${summary.ok} ok · ${summary.degraded} degraded · ${summary.down} down · ${summary.skills} skills → ${OUT}`);
}

main();
