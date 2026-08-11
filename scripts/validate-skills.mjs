#!/usr/bin/env node
/**
 * Self-contained validator for the selat-skills repo (no dependencies).
 * Validates every skill in skills/ against the Agent Skill SOP and checks
 * index.json consistency. Errors fail CI (exit 1); warnings are advisory.
 *
 *   node scripts/validate-skills.mjs
 */
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = join(ROOT, "skills");
const SCHEMA = "selat-skill/v1";
const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
const NAME_RE = /^[a-z0-9][a-z0-9-]*$/;
const REQUIRED_SECTIONS = ["When To Use", "Workflow", "Inputs And Outputs", "Gotchas", "Validation", "References"];

let errors = 0;
let warnings = 0;
const err = (s, m) => { errors++; console.error(`  ✗ [${s}] ${m}`); };
const warn = (s, m) => { warnings++; console.warn(`  ⚠ [${s}] ${m}`); };

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
  if (m.params && typeof m.params !== "object") err(name, "manifest.params must be an object");
}

// Dependency-free guard for the frontmatter YAML failures that render-break on
// GitHub. We don't full-parse YAML (no deps in this repo), but we catch the
// classes that have actually bitten us: tabs in indentation, and an unquoted
// top-level scalar whose value contains ": " (a colon-space, which YAML reads as
// a nested mapping → "mapping values are not allowed here").
function lintFrontmatter(name, fm) {
  const lines = fm.split(/\r?\n/);
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
  // manifest.json (required)
  if (!existsSync(join(dir, "manifest.json"))) err(name, "missing manifest.json");
  else {
    let m;
    try { m = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")); }
    catch { err(name, "manifest.json is not valid JSON"); }
    if (m) validateManifest(name, m);
  }
  // SKILL.md (required)
  if (!existsSync(join(dir, "SKILL.md"))) err(name, "missing SKILL.md");
  else {
    const md = readFileSync(join(dir, "SKILL.md"), "utf8");
    const fm = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const nm = fm && fm[1].match(/^name:\s*(.+)$/m);
    if (!nm) err(name, "SKILL.md missing YAML frontmatter name");
    else if (nm[1].trim() !== name) err(name, `SKILL.md frontmatter name "${nm[1].trim()}" must equal folder "${name}"`);
    if (!/^description:\s*\S/m.test(md)) err(name, "SKILL.md frontmatter missing description");
    if (!fm) err(name, "SKILL.md missing YAML frontmatter (--- ... --- at top)");
    else lintFrontmatter(name, fm[1]);
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
  // references/endpoints.md (recommended)
  if (!existsSync(join(dir, "references", "endpoints.md"))) warn(name, "missing references/endpoints.md");
}

const dirs = readdirSync(SKILLS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();

// index.json consistency
let indexNames = [];
try {
  const idx = JSON.parse(readFileSync(join(ROOT, "index.json"), "utf8"));
  indexNames = (idx.skills || []).map((s) => s.name);
} catch { err("index.json", "missing or not valid JSON"); }

for (const name of dirs) {
  validateSkill(name);
  if (!indexNames.includes(name)) err(name, "not listed in index.json");
}
for (const n of indexNames) if (!dirs.includes(n)) err(n, `listed in index.json but has no skills/${n}/ folder`);

// Lint frontmatter of guidance skills under meta/ too (they render on GitHub but
// aren't payment skills, so they skip the per-skill checks above).
const META_DIR = join(ROOT, "meta");
if (existsSync(META_DIR)) {
  for (const d of readdirSync(META_DIR, { withFileTypes: true }).filter((x) => x.isDirectory())) {
    const p = join(META_DIR, d.name, "SKILL.md");
    if (!existsSync(p)) continue;
    const fm = readFileSync(p, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) err(`meta/${d.name}`, "SKILL.md missing YAML frontmatter");
    else lintFrontmatter(`meta/${d.name}`, fm[1]);
  }
}

console.log(`\n${errors ? "✗" : "✓"} validated ${dirs.length} skills against ${SCHEMA} — ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
