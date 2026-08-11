---
name: cloud-native-release-radar
description: Use this skill when the user wants current community signals about a release, upgrade problem, CVE, or security advisory for Kubernetes, Terraform, Argo CD, Istio, Cilium, Helm, or another cloud-native/DevOps project. Cross-checks the project's official Twitter/X account with broader community search through SELAT-native direct endpoints and produces an operator-focused signal brief with explicit uncertainty.
license: Apache-2.0
compatibility: Requires the selat CLI, selat-pay >= 0.7.0, and a funded Circle Gateway balance.
metadata:
  author: Messi304
  version: "1.0"
  rail: direct
  kind: multi
---

# cloud-native-release-radar

## When To Use

Use when an operator needs a current, corroborated brief before upgrading or reviewing a cloud-native dependency. Typical requests mention the latest release, release notes, upgrade risk, breaking changes, deprecations, CVEs, or security advisories for a named project.

Do not present social posts as authoritative release documentation. Use the skill as an early-warning and community-signal layer, then tell the user which claims still need confirmation against project-owned release notes or advisories.

## Workflow

1. Tell the user that the two-step run costs up to `0.01 USDC` under the manifest cap and ask for approval before spending.
2. Install: `selat skill install cloud-native-release-radar`.
3. Run: `selat skill run cloud-native-release-radar --handle kubernetesio --query "Kubernetes release security advisory CVE upgrade"`.
4. Compare the official account's recent posts with the wider community search. Separate official announcements from user reports, rumors, and repeated copies of the same post.
5. Produce a concise operator brief with:
   - versions, releases, or advisories mentioned by the official account;
   - upgrade failures, regressions, or operational concerns reported by users;
   - security or CVE mentions and affected versions when stated;
   - links grouped as official-account or community sources;
   - conflicts, stale results, and facts that could not be verified.
6. Tell the user the actual charged amount and clearly label any step that timed out or returned a non-200 response.

## Inputs And Outputs

| Param | Required | Default | Description |
|---|---|---|---|
| `handle` | yes | `kubernetesio` | Official project Twitter/X handle without `@` |
| `query` | yes | `Kubernetes release security advisory CVE upgrade` | Community search query |

Outputs: recent posts from the official account and latest matching community posts. The agent synthesizes them into an operator-focused signal brief; the endpoints do not return a normalized changelog and social activity is not proof of a release or vulnerability.

## Gotchas

- Social search is not verification. Recommend checking the project's release, documentation, repository, and security pages before an upgrade decision.
- Results may mix prereleases, old supported branches, managed-service versions, and the upstream project. State which one each version refers to.
- Absence of a security result does not prove that no advisory exists.
- Both calls are paid before upstream validation. Keep the default project meaningful and do not add guessed request fields.
- The caps are spending ceilings, not quoted prices. Stop and ask again if a live quote exceeds them.

## Validation

Free probes:

```bash
selat-pay GET "https://catalog.selat.ai/twitter/user/last_tweets?userName=kubernetesio" --chain base --probe-only
selat-pay GET "https://catalog.selat.ai/twitter/tweet/advanced_search?query=Kubernetes%20release%20security%20advisory%20CVE%20upgrade&queryType=Latest" --chain base --probe-only
```

A valid probe reports a live payment challenge within the per-step cap. A successful paid run reports HTTP 200 for both steps; report and preserve any charged failure instead of silently retrying it.

## References

- `manifest.json` — declarative payment recipe.
- [`references/endpoints.md`](references/endpoints.md) — endpoint schemas, prices, and provenance.
- `../../references/agent-skill-authoring-sop.md` — repository authoring standard.
