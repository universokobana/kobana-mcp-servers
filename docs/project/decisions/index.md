[< Project](../roadmap/index.md)

# Decision Registry — `MD`

Decisions owned by this repository carry the prefix **MD** (MCP Decision) and are
recorded here at the moment they are taken.

`MD-001` through `MD-005` are **retroactive**: they were real decisions, already
enforced in code, but had lived only in commit messages, code comments and the
CHANGELOG. Recording them at adoption makes them findable; their dates are the dates
they were actually taken, not the date they were written down.

## Cross-repository citation

Decisions owned by the Kia registries — `D<n>` in `kia-desktop`, `BD<n>` in
`kia-backend` — are cited here **by bare code only, never by URL**. Those documents
live in internal repositories; this one is public, so a link would 404 for outside
readers and leak internal structure.

## Registry

| Code | Decision | Date | Status |
|------|----------|------|--------|
| [MD-001](md001-refuse-http-redirects/index.md) | Refuse HTTP redirects in `KobanaApiClient` | 2026-06-15 | Active |
| [MD-002](md002-stateless-http-auth-per-request/index.md) | Stateless Streamable HTTP; authenticate every request | 2026-08-11 | Active |
| [MD-003](md003-summary-endpoint-is-the-only-aggregation-authority/index.md) | Never recompute money totals client-side | 2026-08-24 | Active |
| [MD-004](md004-no-branch-protection/index.md) | No branch protection on `main` for now | 2026-09-12 | Active |
| [MD-005](md005-client-duplication-accepted/index.md) | The duplicated API client stays duplicated for now | 2026-09-12 | Active |
| [MD-006](md006-publishing-is-a-security-obligation/index.md) | Publishing is the last step of a security fix, not packaging hygiene | 2026-09-12 | Active |
