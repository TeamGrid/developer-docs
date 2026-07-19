---
title: Regional endpoints
description: Route TeamGrid API v1 credentials to their home region without cross-region redirects or data movement.
---

TeamGrid API v1 is cell-aware. Official clients derive the regional endpoint from the credential and the destination cell performs the authoritative authentication.

| Region | Endpoint | Current availability |
| --- | --- | --- |
| Germany | `https://api.de.teamgrid.app/v1` | Controlled beta |
| United States | `https://api.us.teamgrid.app/v1` | Maintenance until a regional beta is approved |

The global v0 hosts are not API v1 endpoints during the controlled rollout:

```text
https://api.teamgrid.app
https://api.teamgridapp.com
```

## Routing requirements

- Do not rewrite a regional v1 URL to a global v0 hostname.
- Do not follow a bearer redirect across regions.
- Do not infer authorization from the region and cell hint in the token prefix.
- Let the SDK or CLI derive the endpoint unless you are implementing a direct HTTP client.
- Use a base URL override only for a controlled staging or loopback environment.

Business data, credential hashes, audit records, and write delivery stay in the owning cell. The global edge does not persist bearer credentials or request payloads.
