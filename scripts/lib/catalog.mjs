/**
 * Catalog derivation shared by build-catalog.mjs (writes) and
 * validate-skills.mjs (checks). Every skill's manifest.json is the source of
 * truth; index.json and the README skills table are generated from it, so a
 * skill PR only ever touches its own skills/<name>/ folder.
 *
 * deriveIndexEntry mirrors selat-cli lib/skill-registry.mjs deriveIndexEntry so
 * `selat skill register` and `npm run catalog` produce the same entry.
 */
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const SKILLS = join(ROOT, "skills");
export const INDEX_SCHEMA = "selat-skills-index/v1";
export const README_BEGIN = "<!-- BEGIN GENERATED SKILLS TABLE: edit skills/<name>/manifest.json, then run `npm run catalog` -->";
export const README_END = "<!-- END GENERATED SKILLS TABLE -->";
const SUMMARY_MAX = 110;

export function skillDirs() {
  return readdirSync(SKILLS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name)
    .sort();
}

export function loadManifest(name) {
  const p = join(SKILLS, name, "manifest.json");
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; }
}

/** Same derivation as selat-cli deriveIndexEntry. */
export function deriveIndexEntry(manifest) {
  const rails = [...new Set((manifest.steps || []).map((s) => s.rail).filter(Boolean))];
  const rail = rails.length === 0 ? "routed" : rails.length === 1 ? rails[0] : "mixed";
  const kind = (manifest.steps || []).length > 1 ? "multi" : "single";
  return { name: manifest.name, rail, kind, description: manifest.description || "" };
}

/** README one-liner: manifest.summary if set, else the description's first sentence, shortened. */
export function summaryOf(manifest) {
  if (typeof manifest.summary === "string" && manifest.summary.trim()) return manifest.summary.trim();
  const first = String(manifest.description || "").split(/(?<=[.!?])\s+(?=[A-Z(])/)[0].trim();
  if (first.length <= SUMMARY_MAX) return first;
  const cut = first.slice(0, SUMMARY_MAX + 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:—–-]+$/, "") + "…";
}

const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");

/** Build { index, table } from the manifests on disk. Skills whose manifest is missing/invalid are skipped (the validator reports them). */
export function buildCatalog() {
  const manifests = skillDirs().map(loadManifest).filter((m) => m && m.name);
  const index = { schema: INDEX_SCHEMA, skills: manifests.map(deriveIndexEntry) };
  const rows = manifests.map((m) => {
    const e = deriveIndexEntry(m);
    return `| [${e.name}](skills/${e.name}/SKILL.md) | ${cell(e.rail)} | ${e.kind} | ${cell(summaryOf(m))} |`;
  });
  const table = [
    README_BEGIN,
    "",
    `${manifests.length} skills. Generated from each skill's \`manifest.json\` (rail and kind are derived from its steps).`,
    "",
    "| Skill | Rail | Kind | What it does |",
    "|---|---|---|---|",
    ...rows,
    "",
    README_END,
  ].join("\n");
  return { index, table };
}

export const indexJson = (index) => JSON.stringify(index, null, 2) + "\n";

/** Replace the generated block in README text. Returns null if the markers are missing. */
export function spliceReadme(readme, table) {
  const a = readme.indexOf(README_BEGIN);
  const b = readme.indexOf(README_END);
  if (a === -1 || b === -1 || b < a) return null;
  return readme.slice(0, a) + table + readme.slice(b + README_END.length);
}
