# Endpoints - company-hiring-radar

Every endpoint below is served by the Fantastic Jobs merchant on the Orthogonal MPP gateway (`mpp.orthogonal.com`) and is paid via the SELAT Router (MPP on Tempo / tempo-native). Live price per first-page request $0.42 (probe-verified 2026-08-13). The 402 challenge is served only at the payable gateway host - never at the provider host `data.fantastic.jobs`.

| Step | Method | URL | Rail | ~Price |
|---|---|---|---|---|
| 1 | GET | `https://mpp.orthogonal.com/fantastic-jobs/v1/active-ats?time_frame=7d&limit=25&organization=OpenAI&include_basic_organization_details=true` | MPP on Tempo | $0.42 |
| 2 | GET | `https://mpp.orthogonal.com/fantastic-jobs/v1/active-jb?time_frame=7d&limit=25&organization=OpenAI` | MPP on Tempo | $0.42 |
| 3 | GET | `https://mpp.orthogonal.com/fantastic-jobs/v1/modified-ats?limit=25&organization=OpenAI` | MPP on Tempo | $0.42 |

- **Provider:** Fantastic Jobs (`data.fantastic.jobs`) - indexes new ATS jobs hourly from 54 ATS platforms across 200k+ companies, plus LinkedIn, Wellfound, and Y Combinator board postings, with 20+ AI enrichments per job.
- **Payment:** routed via the SELAT Router (MPP on Tempo / tempo-native outbound).
- **Payable host:** `mpp.orthogonal.com` is the MPP gateway - the 402 challenge is served there, not at the provider host `data.fantastic.jobs`.

## Params (from the gateway's self-describing 400 response and the /v1/active-ats OpenAPI)

### active-ats and active-jb

| Param | Type | Required | Notes |
|---|---|---|---|
| `time_frame` | string | yes | `1h`, `24h`, `7d`, or `6m` |
| `limit` | integer | yes | 1-1000 (manifest uses 25); default 1000 |
| `organization` | string | no | exact org name(s), comma-separated |
| `organization_slug` | string | no | LinkedIn org slug(s), comma-separated |
| `title` | string | no | natural-language title search (quotes for exact phrase, OR for alternatives) |
| `location` | string | no | natural-language location search (full country names) |
| `description` / `description_format` | string | no | combined title+description search; `text` or `html` |
| `source` | string | no | `active-jb`: `linkedin`, `wellfound`, `ycombinator`; `active-ats`: ATS names (greenhouse, lever.co, workday, ...) |
| `ai_experience_level` | string | no | `0-2`, `2-5`, `5-10`, `10+` |
| `ai_work_arrangement` | string | no | `On-site`, `Hybrid`, `Remote OK`, `Remote Solely` |
| `ai_employment_type` | string | no | `FULL_TIME`, `PART_TIME`, `CONTRACTOR`, `INTERN`, ... |
| `seniority` | string | no | `active-jb` only: Entry level, Mid-Senior level, Director, ... |
| `has_salary` | string | no | `true` for jobs with salary info only |
| `include_basic_organization_details` | string | no | `true` for inline LinkedIn company fields |
| `offset` / `cursor` | string | no | pagination; continuation pages need top-level `parentRequestId` |

### modified-ats

| Param | Type | Required | Notes |
|---|---|---|---|
| `limit` | integer | yes | 1-100 (manifest uses 25) |
| `organization` | string | no | exact org name(s) |
| `date_modified_gte` / `date_modified_lt` | string | no | ISO 8601 modification window |
| `title`, `location`, `source`, `description_format` | string | no | same semantics as above |
| `include_basic_organization_details` | string | no | `true` for inline company fields |

Note: GET query params are inherently strings - keep `limit` as a literal integer in the URL (the gateway parses it).