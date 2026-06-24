# Contributing a skill

A skill wraps one or more SELAT catalogue endpoints into a named, installable
capability, paid via [`selat-pay`](https://github.com/SELAT-AI/selat-pay) and the
SELAT Router. Skills are **declarative JSON manifests** (no executable code)
authored to the [Agent Skill SOP](references/agent-skill-authoring-sop.md).

## The full guide lives in the `skill-creator` skill

The complete, maintained contribution guide — define → scaffold → discover
endpoints → author → validate → verify → register → submit, plus the gotchas, CI
rules, and guidelines — is the **[`meta/skill-creator`](meta/skill-creator/SKILL.md)**
skill. Open it (or run it in any compatible agent) and it walks you through the
whole loop. Its references cover the [manifest
schema](meta/skill-creator/references/manifest-reference.md), [endpoint discovery
and the `serviceUrl` rule](meta/skill-creator/references/endpoint-discovery.md),
and the [submission checklist](meta/skill-creator/references/submission-checklist.md).

## Quick reference

```bash
selat skill new my-skill --dir skills          # 1. scaffold
#   …edit the files (replace every TODO)…       # 2. author
selat skill validate ./skills/my-skill         # 3. static SOP check
selat skill verify   ./skills/my-skill [--pay] # 4. live-402 check (the gate)
selat skill register ./skills/my-skill         # 5. add index.json entry
npm run validate                               # 6. whole-repo check (what CI runs)
selat skill submit   ./skills/my-skill         # 7. open the PR
```

`verify` writes a `.selat/verify-receipt.json` that `submit` attaches to the PR
and that gates merge — the live 402 is the source of truth, not the catalogue. See
[`meta/skill-creator`](meta/skill-creator/SKILL.md) for the detailed steps.
