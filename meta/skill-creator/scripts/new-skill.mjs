#!/usr/bin/env node
/**
 * Scaffold a new selat-skills skill skeleton.
 *
 * Creates <dir>/<name>/{manifest.json, SKILL.md, evals/evals.json,
 * references/endpoints.md} with valid templates you then fill in.
 *
 * Usage:
 *   node new-skill.mjs <kebab-name> [--rail direct|routed|mixed]
 *                                   [--kind single|multi]
 *                                   [--dir skills]
 *                                   [--author your-org]
 *   node new-skill.mjs --help
 *
 * Non-interactive. Prints what it wrote to stdout; errors to stderr.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

function parse(argv) {
  const o = { rail: "routed", kind: "multi", dir: "skills", author: "your-org" };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") return { help: true };
    else if (a === "--rail") o.rail = argv[++i];
    else if (a === "--kind") o.kind = argv[++i];
    else if (a === "--dir") o.dir = argv[++i];
    else if (a === "--author") o.author = argv[++i];
    else rest.push(a);
  }
  o.name = rest[0];
  return o;
}

const HELP = `Scaffold a new selat-skills skill.

  node new-skill.mjs <kebab-name> [--rail direct|routed|mixed] [--kind single|multi]
                                  [--dir skills] [--author your-org]

Creates <dir>/<name>/{manifest.json, SKILL.md, evals/evals.json, references/endpoints.md}.`;

const o = parse(process.argv.slice(2));
if (o.help || !o.name) { console.log(HELP); process.exit(o.name ? 0 : 1); }
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(o.name)) {
  console.error(`error: name "${o.name}" must be kebab-case (lowercase, hyphens)`); process.exit(1);
}
if (!["direct", "routed", "mixed"].includes(o.rail)) { console.error(`error: --rail must be direct|routed|mixed`); process.exit(1); }
if (!["single", "multi"].includes(o.kind)) { console.error(`error: --kind must be single|multi`); process.exit(1); }

const root = join(o.dir, o.name);
if (existsSync(root)) { console.error(`error: ${root} already exists`); process.exit(1); }
mkdirSync(join(root, "evals"), { recursive: true });
mkdirSync(join(root, "references"), { recursive: true });

const railNote = o.rail === "direct" ? "Circle nanopayment / Gateway-batched, DIRECT"
  : o.rail === "mixed" ? "DIRECT + ROUTED MPP" : "MPP, ROUTED via the SELAT Router";

const manifest = {
  schema: "selat-skill/v1",
  name: o.name,
  description: `TODO one line — what ${o.name} does (${railNote}).`,
  maxAmount: "5.00",
  params: {
    example: { required: false, default: "stripe.com", description: "TODO describe this input" },
  },
  steps: [
    {
      label: `TODO step — <merchant> (${railNote})`,
      rail: o.rail,
      method: "GET",
      // IMPORTANT: use the catalogue serviceUrl, not the provider url.
      url: "https://mpp.orthogonal.com/<merchant>/<path>?key=${example}",
      maxAmount: "5.00",
    },
  ],
};

const skillMd = `---
name: ${o.name}
description: Use this skill when the user wants TODO — include trigger phrases, keywords, and adjacent wording (under 1024 chars). ${railNote}.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0${o.rail === "direct" ? "" : ", and a reachable SELAT Router (SELAT_ROUTER_URL)"}.
metadata:
  author: ${o.author}
  version: "1.0"
  rail: ${o.rail}
  kind: ${o.kind}
---

# ${o.name}

## When To Use

TODO when to reach for this skill.

## Workflow

1. Install: \`selat skill install ${o.name}\`
2. Run: \`selat skill run ${o.name} [--example stripe.com]\`
3. The CLI compiles each manifest step into a \`selat-pay\` call and prints a per-step ✓/✗ summary.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| \`example\` | no | \`stripe.com\` | TODO |

Outputs: TODO describe the returned shape.

## Gotchas

- Steps target the catalogue \`serviceUrl\`, not the provider host.
- POST params go in \`body\`; GET params in the query string.
- \`maxAmount\` is a spending filter, not the price.

## Validation

> \`--chain base\` below is only the flag \`selat-pay\` requires for a probe — probing reads a free, chain-independent quote and never settles. A paid run resolves the settlement chain from your funded Circle Gateway balance, not the manifest.

- Probe without paying: \`selat-pay GET "<serviceUrl>/<path>?..." --chain base --probe-only\`
- A successful run prints \`status=200\` per step and an ✓ summary.

## References

- \`manifest.json\` — the machine-readable payment recipe this skill runs.
- \`references/endpoints.md\` — the catalogue endpoints this skill calls.
- \`../../references/agent-skill-authoring-sop.md\` — authoring standard.
`;

const evals = {
  skill_name: o.name,
  evals: [
    {
      id: "example-1",
      prompt: "TODO a realistic user request that should trigger and use this skill",
      expected_output: "TODO what success looks like",
      assertions: ["The output includes TODO", "The skill called the expected endpoint(s)"],
    },
  ],
};

const endpointsMd = `# ${o.name} — endpoints

| Merchant | Endpoint | Price |
|---|---|---|
| TODO | \`GET <serviceUrl>/<path>\` | $TODO |
`;

writeFileSync(join(root, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
writeFileSync(join(root, "SKILL.md"), skillMd);
writeFileSync(join(root, "evals", "evals.json"), JSON.stringify(evals, null, 2) + "\n");
writeFileSync(join(root, "references", "endpoints.md"), endpointsMd);

console.log(`Scaffolded ${root}/`);
for (const f of ["manifest.json", "SKILL.md", "evals/evals.json", "references/endpoints.md"]) console.log(`  ${f}`);
console.log(`\nNext: fill the TODOs, then validate + probe (see references/submission-checklist.md).`);
