# cloud-native-release-radar — endpoints

Both endpoints are SELAT-native catalogue services on `catalog.selat.ai`. They use direct x402 settlement through Circle Gateway and require no body.

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

Schema provenance: both endpoint shapes and parameter names are used by the accepted `twitter-research` skill and are marked reachable in the repository reliability registry. Live free probes are recorded in this skill's verification receipt.

