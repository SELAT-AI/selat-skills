# ClawHub pattern scan

Scanned on 2026-06-30 from `https://clawhub.ai`.

## Similar Skills

| Skill | Useful Pattern |
|---|---|
| `pskoett/self-improving-agent` | Logs learnings, errors, feature requests, and promotes durable lessons into project memory. |
| `ivangdavila/self-improving` | Uses correction signals, self-reflection, tiered memory, namespace isolation, conflict resolution, and promotion/demotion rules. |
| `halthelobster/proactive-agent` | Frames the agent as a proactive partner with working buffers, recurring checks, and continuous-improvement loops. |
| `spclaudehome/skill-vetter` | Adds a security-first vetting protocol before installing or trusting third-party skills. |
| `chindden/skill-creator` | Treats skills as modular onboarding guides for specialized workflows and tool integrations. |

## Design Choices Adopted

- Capture corrections, errors, feature requests, and knowledge gaps immediately.
- Reflect after meaningful work and convert repeated lessons into durable rules.
- Keep memory tiered and scoped: global, domain, project, and archive.
- Vet third-party skills and generated skills before activation.
- Keep every evolution step reviewable.

## Design Choices Rejected

- No inference from silence.
- No secret or raw transcript storage.
- No automatic funding or paid endpoint execution.
- No invisible self-modification of the skill's own instructions.
- No installation of third-party skills without source and permission review.
