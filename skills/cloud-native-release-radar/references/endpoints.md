# cloud-native-release-radar — endpoints

Both endpoints are SELAT-native catalogue services on `catalog.selat.ai`. They use x402 settlement through Circle Gateway and require no body.

## Official account recent posts

| Field | Value |
|---|---|
| Method and URL | `GET https://catalog.selat.ai/twitter/user/last_tweets?userName=${handle}` |
| Required query field | `userName`: string, Twitter/X handle without `@` |
| Live registry price | Approximately `0.001 USDC` |
| Manifest cap | `0.005 USDC` |

## Community advanced search

| Field | Value |
|---|---|
| Method and URL | `GET https://catalog.selat.ai/twitter/tweet/advanced_search?query=${query}&queryType=Latest` |
| Required query field | `query`: string; supports Twitter/X search terms and operators |
| Fixed query field | `queryType=Latest` |
| Live registry price | Approximately `0.001 USDC` |
| Manifest cap | `0.005 USDC` |

Schema provenance: both endpoint shapes and parameter names are used by the accepted `twitter-research` skill and are marked reachable in the repository reliability registry.

Verification status: the checked-in `.selat/verify-receipt.json` (`selat-verify/v1`, `paidMode: false`) shows `reachable: false` / `error: "no x402/MPP challenge"` for both steps. That result comes from `selat skill verify` on Windows, where the verifier routes `node.exe` through a `cmd.exe` escaping wrapper that mangles the generated `selat-pay` call — it is a known tooling bug on this platform, not a finding about either endpoint, and it is not evidence of a successful or failed free probe. The two `selat-pay ... --probe-only` commands under Validation below were run directly (bypassing the broken wrapper) and returned live x402 challenges within the per-step `maxAmount`; that is the actual free-probe evidence for this PR. No paid verification has been performed — a maintainer should run `selat skill verify --pay` (or the manual `selat-pay` paid equivalent) in a non-Windows environment before merge.

