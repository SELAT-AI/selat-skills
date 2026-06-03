# SOP: Authoring Agent Skills

## Purpose

Create Agent Skills that are portable, reliable, easy for agents to activate, and safe to distribute across compatible agent runtimes.

## Scope

Use this SOP for new skills and major revisions to existing skills. An Agent Skill is a directory containing a required `SKILL.md`, plus optional `scripts/`, `references/`, `assets/`, and eval files.

## 1. Define The Skill

1. Start from real expertise: a completed task, internal runbook, API docs, recurring workflow, issue history, or known failure cases.
2. Confirm the skill adds something the agent would not reliably know already: domain rules, project conventions, fragile procedures, edge cases, templates, scripts, or validation steps.
3. Keep the scope coherent. One skill should cover one reusable unit of work, not an entire department's knowledge base.

## 2. Create The Directory

Use this structure:

```text
skill-name/
├── SKILL.md
├── scripts/
├── references/
├── assets/
└── evals/
```

Required:

- `SKILL.md`

Optional:

- `scripts/` for reusable executable logic
- `references/` for detailed docs loaded on demand
- `assets/` for templates, examples, schemas, or static files
- `evals/` for trigger and output-quality tests

## 3. Write `SKILL.md` Frontmatter

The frontmatter must include `name` and `description`.

```yaml
---
name: skill-name
description: Use this skill when the user needs [task/capability], especially when [trigger contexts, keywords, adjacent phrasing].
license: Apache-2.0
compatibility: Requires Node.js 18+ and network access.
metadata:
  author: my-org
  version: "1.0"
---
```

Rules:

- `name` must match the folder name.
- Use lowercase letters, numbers, and hyphens only.
- Keep `description` under 1024 characters.
- Include `license` for distributable skills.
- Include `compatibility` only when runtime requirements matter.

## 4. Write The Skill Body

Keep `SKILL.md` concise and operational. Recommended sections:

```md
# skill-name

## When To Use
## Workflow
## Available Scripts
## Inputs And Outputs
## Gotchas
## Validation
## References
```

Writing standards:

- Prefer procedures over declarations.
- Provide defaults, not menus.
- Include gotchas the agent would otherwise miss.
- Use checklists for multi-step work.
- Include output templates when format matters.
- Move long detail into `references/`.
- Keep `SKILL.md` under roughly 500 lines / 5,000 tokens.

## 5. Use Progressive Disclosure

Put only always-needed instructions in `SKILL.md`.

Use references like:

```md
Read `references/api-errors.md` only if the API returns a non-200 response.
Use `assets/report-template.md` when generating the final report.
```

Avoid vague pointers like "see references for more."

## 6. Add Scripts When They Improve Reliability

Use scripts when logic is repeated, brittle, mechanical, or easier to validate in code.

Script requirements:

- Accept inputs via flags, environment variables, or stdin.
- Never rely on interactive prompts.
- Provide `--help`.
- Print structured data to stdout.
- Print progress and errors to stderr.
- Use meaningful exit codes.
- Support `--dry-run` for destructive or stateful actions.
- Pin dependency versions where possible.

## 7. Optimize The Description

Create about 20 trigger eval prompts:

- 8-10 should trigger.
- 8-10 should not trigger.
- Include near misses, casual wording, file paths, typos, and realistic context.

Iterate:

1. Run trigger evals.
2. Identify false negatives and false positives.
3. Revise the description.
4. Re-test with train and validation splits.
5. Stop when validation performance stabilizes.

## 8. Evaluate Skill Output Quality

Create `evals/evals.json`:

```json
{
  "skill_name": "skill-name",
  "evals": [
    {
      "id": "example-1",
      "prompt": "Realistic user request",
      "expected_output": "What success looks like",
      "files": ["evals/files/input.ext"],
      "assertions": [
        "The output includes X",
        "The generated file is valid JSON",
        "The report includes at least 3 recommendations"
      ]
    }
  ]
}
```

For each eval:

- Run with the skill.
- Run without the skill or against the previous version.
- Capture outputs, timing, token usage, and grading.
- Prefer programmatic checks for mechanical assertions.
- Use human review for subjective quality.

## 9. Validate Before Release

Before distribution:

- Validate frontmatter and naming.
- Run all scripts with `--help`.
- Run trigger evals.
- Run output-quality evals.
- Check that references resolve.
- Confirm license and third-party rights language.
- Confirm secrets, tokens, private data, and local-only paths are absent.

## 10. Release Checklist

- [ ] Folder name matches `name`.
- [ ] `description` is specific, intent-based, and under 1024 characters.
- [ ] `SKILL.md` is concise and procedural.
- [ ] Long content moved to `references/`.
- [ ] Scripts are non-interactive and documented.
- [ ] Dependencies and compatibility are declared.
- [ ] Evals cover trigger behavior and output quality.
- [ ] License is declared.
- [ ] Third-party API/trademark disclaimer is included if relevant.
- [ ] Skill has been tested in at least one compatible agent runtime.

## Sources

- [Agent Skills Overview](https://agentskills.io/home)
- [Specification](https://agentskills.io/specification)
- [Best Practices](https://agentskills.io/skill-creation/best-practices)
- [Optimizing Descriptions](https://agentskills.io/skill-creation/optimizing-descriptions)
- [Evaluating Skills](https://agentskills.io/skill-creation/evaluating-skills)
- [Using Scripts](https://agentskills.io/skill-creation/using-scripts)
