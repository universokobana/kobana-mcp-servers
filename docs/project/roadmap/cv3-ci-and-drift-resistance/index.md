[< Roadmap](../index.md)

# CV3 — The codebase resists drift

**Status:** ⚪ Planned

---

## Capability Value

Mechanical decay — formatting drift, dead exports, divergent copies, stale
lockfiles, advisories nobody reads — is caught by a machine rather than by whoever
happens to notice.

## Starting point

There is **no `.github/` directory**. The `gitStream.cm` check that appeared on the
two pull requests merged on 2026-09-12 comes from the organization, not from this
repository, and it reported `skipping` both times. There is no ruleset on `main`,
at organization or repository level — verified, not assumed.

There is also no Prettier configuration, no ESLint configuration and no
`.editorconfig`. Nine per-package `package-lock.json` files coexist with an npm
workspaces declaration that expects one, and two packages (`mcp-help`, `mcp-site`)
are absent from the `workspaces` list entirely, so the root build silently skips
them.

Per [MD-004](../../decisions/md004-no-branch-protection/index.md), branch protection
is deliberately **not** part of this CV. The gate is the local one; CI reports, it
does not block.

## Candidate Stories

| Code | Story | Type | Outcome | Status |
|------|-------|------|---------|--------|
| CV3.DS1 | CI workflow — `Checks` and `Tests` | Technical Story | Two jobs reporting on every PR and push, named to match the Kia convention so a future ruleset needs no rename. Typecheck is green across all packages today, so this lands green | ⚪ Candidate |
| CV3.DS2 | Prettier, ESLint and the pre-push hook | Technical Story | One mechanical reformat commit, then formatting drift dies locally in seconds instead of in CI | ⚪ Candidate |
| CV3.DS3 | Daily dependency audit, off the PR path | Technical Story | Advisories reported on a schedule, because a published advisory is not a function of anybody's diff | ⚪ Candidate |
| CV3.DS4 | Lockfile and workspace consolidation | Technical Story | One root lockfile; every package inside `workspaces` or documented as deliberately outside | ⚪ Candidate |
| CV3.DS5 | Dead-export audit (knip) | Technical Story | An exported symbol nothing reaches fails the build, with named exceptions carrying reasons | ⚪ Candidate |

## Done Condition

A push that would have degraded the repository is stopped or reported by a machine,
and the classes of decay listed above have an owner that is not human memory.
