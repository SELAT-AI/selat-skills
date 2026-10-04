#!/usr/bin/env node
/**
 * Regenerate index.json and the README skills table from skills/<name>/manifest.json.
 *
 *   npm run catalog
 *
 * Run it after adding or editing a skill (and after rebasing a skill PR: a
 * catalog conflict is resolved by taking either side and re-running this).
 * The validator fails CI when either file is out of date.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, buildCatalog, indexJson, spliceReadme } from "./lib/catalog.mjs";

const { index, table } = buildCatalog();
writeFileSync(join(ROOT, "index.json"), indexJson(index), "utf8");

const readmePath = join(ROOT, "README.md");
const next = spliceReadme(readFileSync(readmePath, "utf8"), table);
if (next == null) {
  console.error("README.md is missing the generated-table markers; add them around the skills table first.");
  process.exit(1);
}
writeFileSync(readmePath, next, "utf8");
console.log(`✓ wrote index.json and README.md skills table (${index.skills.length} skills)`);
