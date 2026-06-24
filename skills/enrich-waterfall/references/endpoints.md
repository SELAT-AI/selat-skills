# enrich-waterfall — endpoints

Every endpoint below is probe-verified live-payable over MPP via the SELAT Router (`selat-pay --probe-only`). Caps are a 5 USDC spending filter, not the live price.

| Merchant | Endpoint | Live price |
|---|---|---|
| tomba | `GET mpp.orthogonal.com/tomba/v1/enrich` | ~ |
| tomba | `GET mpp.orthogonal.com/tomba/v1/people/find` | ~ |
| tomba | `GET mpp.orthogonal.com/tomba/v1/combined/find` | ~ |
| apollo | `POST mpp.orthogonal.com/apollo/api/v1/people/match` | $0.0105 |
| coresignal | `GET mpp.orthogonal.com/coresignal/v2/employee_clean/collect/${linkedinUrl}` | ~ |
| coresignal | `GET mpp.orthogonal.com/coresignal/v2/employee_multi_source/collect/${linkedinUrl}` | ~ |
| peopledatalabs | `GET mpp.orthogonal.com/peopledatalabs/v5/person/enrich` | ~ |
| apollo | `GET mpp.orthogonal.com/apollo/api/v1/organizations/enrich` | ~ |
| coresignal | `GET mpp.orthogonal.com/coresignal/v2/company_clean/enrich` | ~ |
| company-enrich | `GET mpp.orthogonal.com/company-enrich/companies/enrich` | $0.012862 |
| company-enrich | `POST mpp.orthogonal.com/company-enrich/companies/enrich` | $0.012862 |
| ocean-io | `POST mpp.orthogonal.com/ocean-io/v2/enrich/company` | $0.0105 |
| predictleads | `GET mpp.orthogonal.com/predictleads/v3/companies/${domain}` | ~ |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-finder` | $0.01365 |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-enrichment` | $0.01365 |
| sixtyfour | `POST mpp.orthogonal.com/sixtyfour/find-email` | $0.0525 |
| company-enrich | `GET mpp.orthogonal.com/company-enrich/companies/enrich` | $0.012862 |
| company-enrich | `POST mpp.orthogonal.com/company-enrich/companies/enrich` | $0.012862 |
| predictleads | `GET mpp.orthogonal.com/predictleads/v3/companies/${domain}` | ~ |
| aviato | `GET mpp.orthogonal.com/aviato/company/enrich` | ~ |
| tomba | `GET mpp.orthogonal.com/tomba/v1/linkedin` | ~ |
| contactout | `GET mpp.orthogonal.com/contactout/v1/linkedin/enrich` | ~ |
| fiber | `POST mpp.orthogonal.com/fiber/v1/twitter-handle-to-linkedin/single` | $0.063 |
| fiber | `POST mpp.orthogonal.com/fiber/v1/twitter/profile` | $0.042 |
| fiber | `POST mpp.orthogonal.com/fiber/v1/instagram/profile` | $0.042 |
| fiber | `POST mpp.orthogonal.com/fiber/v1/tiktok/profile` | $0.042 |
| aviato | `GET mpp.orthogonal.com/aviato/social/person/posts` | ~ |
| aviato | `GET mpp.orthogonal.com/aviato/social/company/posts` | ~ |
| sixtyfour | `POST mpp.orthogonal.com/sixtyfour/enrich-lead` | $0.105 |
| company-enrich | `GET mpp.orthogonal.com/company-enrich/companies/workforce` | ~ |
| predictleads | `GET mpp.orthogonal.com/predictleads/v3/companies/${domain}/financing_events` | ~ |
| predictleads | `GET mpp.orthogonal.com/predictleads/v3/companies/${domain}/news_events` | ~ |
| predictleads | `GET mpp.orthogonal.com/predictleads/v3/companies/${domain}/job_openings` | ~ |
| predictleads | `GET mpp.orthogonal.com/predictleads/v3/companies/${domain}/connections` | ~ |
| tomba | `GET mpp.orthogonal.com/tomba/v1/technology` | ~ |
| predictleads | `GET mpp.orthogonal.com/predictleads/v3/companies/${domain}/technology_detections` | ~ |
| brand-dev | `GET mpp.orthogonal.com/brand-dev/v1/brand/retrieve` | ~ |
| brand-dev | `GET mpp.orthogonal.com/brand-dev/v1/brand/naics` | ~ |
| predictleads | `GET mpp.orthogonal.com/predictleads/v3/companies/${domain}/technology_detections` | ~ |
| contactout | `GET mpp.orthogonal.com/contactout/v1/email/enrich` | ~ |
| contactout | `GET mpp.orthogonal.com/contactout/v1/people/linkedin` | ~ |
| contactout | `POST mpp.orthogonal.com/contactout/v1/people/enrich` | $0.5775 |
| peopledatalabs | `GET mpp.orthogonal.com/peopledatalabs/v5/person/identify` | ~ |
| coresignal | `GET mpp.orthogonal.com/coresignal/v2/company_multi_source/enrich` | ~ |
| sixtyfour | `POST mpp.orthogonal.com/sixtyfour/find-phone` | $0.315 |
| contactout | `GET mpp.orthogonal.com/contactout/v1/people/linkedin` | ~ |
| contactout | `GET mpp.orthogonal.com/contactout/v1/linkedin/enrich` | ~ |
| contactout | `GET mpp.orthogonal.com/contactout/v1/email/enrich` | ~ |
| contactout | `POST mpp.orthogonal.com/contactout/v1/people/enrich` | $0.5775 |
| hunter | `POST hunter.mpp.paywithlocus.com/hunter/email-verifier` | $0.0084 |
| fiber | `POST mpp.orthogonal.com/fiber/v1/validate-email/single` | $0.021 |
