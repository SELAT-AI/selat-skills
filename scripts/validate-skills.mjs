#!/usr/bin/env node
/**
 * Self-contained validator for the selat-skills repo (no dependencies).
 * Validates every skill in skills/ against the Agent Skill SOP, checks that each
 * manifest is internally consistent (params ↔ templates, reserved names, rail/kind
 * frontmatter), that documented probe commands are runnable (--live-probe), and
 * that index.json + the README skills table match what `npm run catalog`
 * generates. Errors fail CI (exit 1); warnings are advisory.
 *
 *   node scripts/validate-skills.mjs
 */
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, SKILLS, buildCatalog, deriveIndexEntry, indexJson, spliceReadme } from "./lib/catalog.mjs";
const SCHEMA = "selat-skill/v1";
const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
const NAME_RE = /^[a-z0-9][a-z0-9-]*$/;
// Flags `selat skill run|verify` consume itself; a param with one of these
// names never reaches the skill (e.g. --chain picks the settlement chain).
const RESERVED_PARAMS = ["chain", "max-amount", "json", "allow-high-max-amount", "pay", "live-probe"];
const TEMPLATE_RE = /\$\{([a-zA-Z0-9_]+)(\|join)?\}/g;
const REQUIRED_SECTIONS = ["When To Use", "Workflow", "Inputs And Outputs", "Gotchas", "Validation", "References"];

let errors = 0;
let warnings = 0;
const err = (s, m) => { errors++; console.error(`  ✗ [${s}] ${m}`); };
const warn = (s, m) => { warnings++; console.warn(`  ⚠ [${s}] ${m}`); };
// Content checks added 2026-10-04 (params ↔ templates, reserved names, rail/kind
// frontmatter, --live-probe in documented commands). They warn by default while
// the open skill-repair PRs land; `--strict` (or SELAT_VALIDATE_STRICT=1) makes
// them errors. Flip STRICT_DEFAULT to true once main passes strict.
const STRICT_DEFAULT = false;
const STRICT = STRICT_DEFAULT || process.argv.includes("--strict") || process.env.SELAT_VALIDATE_STRICT === "1";
const flag = (s, m) => (STRICT ? err : warn)(s, m);

function validateManifest(name, m) {
  if (!m || typeof m !== "object") return err(name, "manifest.json is not an object");
  if (m.schema !== SCHEMA) err(name, `manifest.schema must be "${SCHEMA}"`);
  if (m.name !== name) err(name, `manifest.name "${m.name}" must equal folder "${name}"`);
  if (!NAME_RE.test(m.name || "")) err(name, "manifest.name must be kebab-case");
  if (!Array.isArray(m.steps) || m.steps.length === 0) err(name, "manifest.steps must be a non-empty array");
  else m.steps.forEach((st, i) => {
    if (!METHODS.includes(String(st.method || "").toUpperCase())) err(name, `step ${i}: method must be one of ${METHODS.join(", ")}`);
    if (typeof st.url !== "string" || !st.url) err(name, `step ${i}: url is required`);
  });
  if (m.params && typeof m.params !== "object") return err(name, "manifest.params must be an object");

  // params ↔ templates: every ${x} is declared, every declared param is used.
  const declared = Object.keys(m.params || {});
  const used = new Set();
  const collect = (v) => {
    if (typeof v === "string") for (const [, k] of v.matchAll(TEMPLATE_RE)) used.add(k);
    else if (Array.isArray(v)) v.forEach(collect);
    else if (v && typeof v === "object") Object.values(v).forEach(collect);
  };
  (m.steps || []).forEach((st) => { collect(st.url); collect(st.body); });
  for (const k of used) if (!declared.includes(k)) flag(name, `template uses \${${k}} but params does not declare "${k}"`);
  for (const k of declared) if (!used.has(k)) flag(name, `param "${k}" is declared but no step uses it (it would be accepted and silently ignored)`);
  for (const k of declared) if (RESERVED_PARAMS.includes(k)) flag(name, `param "${k}" collides with the reserved selat skill flag --${k}; rename it`);
  for (const [k, spec] of Object.entries(m.params || {})) {
    if (spec && spec.required === true && spec.default != null && spec.default !== "")
      warn(name, `param "${k}" is required but has a default ("${spec.default}"); the CLI uses the default when the input is missing, so a run silently pays for that value`);
  }
}

// Live price vs cap, from the last scheduled probe (reliability.json). A warning,
// not an error: upstream price moves shouldn't fail unrelated PRs.
function checkLivePrices(name, m, reliability) {
  const rec = reliability?.skills?.find((s) => s.name === name);
  if (!rec) return;
  (m.steps || []).forEach((st, i) => {
    const r = rec.steps?.[i];
    if (!r || r.livePriceUsd == null || (r.label ?? null) !== (st.label ?? null)) return;
    const cap = Number(st.maxAmount ?? m.maxAmount);
    if (Number.isFinite(cap) && r.livePriceUsd > cap)
      warn(name, `step ${i + 1} cap $${cap} is below the last live quote $${r.livePriceUsd} (reliability.json ${reliability.generatedAt}); the step will refuse to pay`);
  });
}

// Documented commands must run as written: `selat skill verify` and
// `selat-pay ... --probe-only` both require --live-probe. Only code is checked
// (fenced blocks and inline code spans), not prose that names the command.
function checkProbeCommands(label, text) {
  const lines = text.split("\n");
  let fenced = false;
  const cmds = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) { fenced = !fenced; continue; }
    if (fenced) {
      let line = lines[i], j = i;
      while (/\\\s*$/.test(line) && j + 1 < lines.length) line = line.replace(/\\\s*$/, " ") + lines[++j];
      cmds.push([i + 1, line]); i = j;
    } else {
      for (const [, span] of lines[i].matchAll(/`([^`]+)`/g)) cmds.push([i + 1, span]);
    }
  }
  for (const [n, c] of cmds) {
    const verify = /selat skill verify\s+[^\s-]/.test(c);
    const probe = /selat-pay\s+(GET|POST|PUT|PATCH|DELETE|"|'|\$|https?:)/.test(c) && /--probe-only/.test(c);
    if ((verify || probe) && !/--live-probe/.test(c))
      flag(label, `line ${n}: \`${verify ? "selat skill verify" : "selat-pay --probe-only"}\` without --live-probe fails as written`);
  }
}

// Dependency-free guard for the frontmatter YAML failures that render-break on
// GitHub. We don't full-parse YAML (no deps in this repo), but we catch the
// classes that have actually bitten us: tabs in indentation, and an unquoted
// top-level scalar whose value contains ": " (a colon-space, which YAML reads as
// a nested mapping → "mapping values are not allowed here").
function lintFrontmatter(name, fm) {
  const lines = fm.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\t|^ *\t/.test(line)) { err(name, `SKILL.md frontmatter line ${i + 1}: uses a tab; YAML requires spaces`); continue; }
    // top-level "key: value" (no indentation) with a scalar value
    const m = line.match(/^([A-Za-z0-9_-]+):[ \t]+(\S.*)$/);
    if (!m) continue;
    const [, key, raw] = m;
    const v = raw.trim();
    // quoted / block / flow values are safe
    if (/^["'|>[{]/.test(v)) continue;
    if (/:[ \t]/.test(v)) {
      err(name, `SKILL.md frontmatter "${key}" has an unquoted ": " — quote the value or remove the colon (GitHub YAML renders it as a mapping otherwise)`);
    }
  }
}

function validateSkill(name) {
  const dir = join(SKILLS, name);
  let manifestObj = null;
  // manifest.json (required)
  if (!existsSync(join(dir, "manifest.json"))) err(name, "missing manifest.json");
  else {
    let m;
    try { m = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")); }
    catch { err(name, "manifest.json is not valid JSON"); }
    if (m) { validateManifest(name, m); checkLivePrices(name, m, reliability); manifestObj = m; }
  }
  // SKILL.md (required)
  if (!existsSync(join(dir, "SKILL.md"))) err(name, "missing SKILL.md");
  else {
    const md = readFileSync(join(dir, "SKILL.md"), "utf8");
    const fm = md.match(/^---\n([\s\S]*?)\n---/);
    const nm = fm && fm[1].match(/^name:\s*(.+)$/m);
    if (!nm) err(name, "SKILL.md missing YAML frontmatter name");
    else if (nm[1].trim() !== name) err(name, `SKILL.md frontmatter name "${nm[1].trim()}" must equal folder "${name}"`);
    if (!/^description:\s*\S/m.test(md)) err(name, "SKILL.md frontmatter missing description");
    if (!fm) err(name, "SKILL.md missing YAML frontmatter (--- ... --- at top)");
    else lintFrontmatter(name, fm[1]);
    if (fm && manifestObj) {
      const derived = deriveIndexEntry(manifestObj);
      const rail = fm[1].match(/^\s+rail:\s*["']?([^"'\n]+?)["']?\s*$/m)?.[1];
      const kind = fm[1].match(/^\s+kind:\s*["']?([^"'\n]+?)["']?\s*$/m)?.[1];
      if (rail && rail !== derived.rail) flag(name, `SKILL.md metadata.rail "${rail}" must match the rail derived from manifest steps ("${derived.rail}")`);
      if (kind && kind !== derived.kind) flag(name, `SKILL.md metadata.kind "${kind}" must match the manifest (${derived.kind}: ${(manifestObj.steps || []).length} step(s))`);
    }
    checkProbeCommands(name, md);
    for (const s of REQUIRED_SECTIONS) if (!new RegExp(`^##\\s+${s}\\s*$`, "m").test(md)) warn(name, `SKILL.md missing section: ## ${s}`);
    if (/\bTODO\b/.test(md)) err(name, "SKILL.md still contains TODO placeholders");
  }
  // evals/evals.json (required by SOP)
  if (!existsSync(join(dir, "evals", "evals.json"))) warn(name, "missing evals/evals.json");
  else {
    try {
      const ev = JSON.parse(readFileSync(join(dir, "evals", "evals.json"), "utf8"));
      if (ev.skill_name && ev.skill_name !== name) err(name, `evals.json skill_name "${ev.skill_name}" must equal folder "${name}"`);
      if (!Array.isArray(ev.evals) || ev.evals.length === 0) warn(name, "evals.json has no evals");
    } catch { err(name, "evals/evals.json is not valid JSON"); }
  }
  // references/*.md (endpoints.md recommended)
  if (!existsSync(join(dir, "references", "endpoints.md"))) warn(name, "missing references/endpoints.md");
  if (existsSync(join(dir, "references"))) {
    for (const f of readdirSync(join(dir, "references")).filter((f) => f.endsWith(".md")))
      checkProbeCommands(`${name}/references/${f}`, readFileSync(join(dir, "references", f), "utf8"));
  }
}

const dirs = readdirSync(SKILLS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();

let reliability = null;
try { reliability = JSON.parse(readFileSync(join(ROOT, "reliability.json"), "utf8")); } catch {}

for (const name of dirs) validateSkill(name);

// index.json + README skills table must equal what `npm run catalog` generates
// from the manifests (the manifest is the single source of truth).
const { index, table } = buildCatalog();
let indexRaw = null;
try { indexRaw = readFileSync(join(ROOT, "index.json"), "utf8"); JSON.parse(indexRaw); }
catch { err("index.json", "missing or not valid JSON — run `npm run catalog`"); indexRaw = null; }
if (indexRaw != null && indexRaw !== indexJson(index)) {
  const have = new Map((JSON.parse(indexRaw).skills || []).map((s) => [s.name, JSON.stringify(s)]));
  const stale = index.skills.filter((s) => have.get(s.name) !== JSON.stringify(s)).map((s) => s.name);
  const extra = [...have.keys()].filter((n) => !dirs.includes(n));
  err("index.json", `out of date with the manifests${stale.length ? ` (${stale.join(", ")})` : ""}${extra.length ? `; lists missing skills: ${extra.join(", ")}` : ""} — run \`npm run catalog\``);
}
const readme = existsSync(join(ROOT, "README.md")) ? readFileSync(join(ROOT, "README.md"), "utf8") : "";
const spliced = spliceReadme(readme, table);
if (spliced == null) err("README.md", "missing the generated skills-table markers");
else if (spliced !== readme) err("README.md", "skills table is out of date with the manifests — run `npm run catalog`");

// Repo docs that show contributors how to probe.
for (const f of ["README.md", "CONTRIBUTING.md"]) if (existsSync(join(ROOT, f))) checkProbeCommands(f, readFileSync(join(ROOT, f), "utf8"));
const CREATOR = join(ROOT, "meta", "skill-creator");
if (existsSync(CREATOR)) {
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
  for (const f of walk(CREATOR).filter((f) => f.endsWith(".md")))
    checkProbeCommands(f.slice(ROOT.length + 1), readFileSync(f, "utf8"));
}

// Lint frontmatter of guidance skills under meta/ too (they render on GitHub but
// aren't payment skills, so they skip the per-skill checks above).
const META_DIR = join(ROOT, "meta");
if (existsSync(META_DIR)) {
  for (const d of readdirSync(META_DIR, { withFileTypes: true }).filter((x) => x.isDirectory())) {
    const p = join(META_DIR, d.name, "SKILL.md");
    if (!existsSync(p)) continue;
    const fm = readFileSync(p, "utf8").match(/^---\n([\s\S]*?)\n---/);
    if (!fm) err(`meta/${d.name}`, "SKILL.md missing YAML frontmatter");
    else lintFrontmatter(`meta/${d.name}`, fm[1]);
  }
}

console.log(`\n${errors ? "✗" : "✓"} validated ${dirs.length} skills against ${SCHEMA}${STRICT ? " (strict)" : ""} — ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
