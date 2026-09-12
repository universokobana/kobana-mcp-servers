[< Decisions](../index.md)

# MD-006 — Publishing is the last step of a security fix, not packaging hygiene

**Date:** 2026-09-12
**Origin:** Discovered while planning [CV1.DS1](../../roadmap/cv1-release-and-consumers/cv1-ds1-version-truth-and-publish/index.md):
the PSQ-001 fix had been merged for a month and never published.

---

**Context:** the survey that opened CV1 assumed the release gap was a convenience
problem — consumers waiting longer than necessary for a timeout fix. Checking the
actual published artifacts showed something worse.

Commit `688209d` (2026-08-11) migrated `http-server.ts` to stateless Streamable HTTP
to close PSQ-001, and bumped `1.0.1` → `1.1.0`. That version was never published.
Verified by unpacking the published tarballs from npm:

| Package | Published | SSE refs in `dist/http-server.js` | `Math.random()` session id | `start:http` script |
|---|---|---|---|---|
| `kobana-mcp-admin` | 1.0.1 | 5 | yes | yes |
| `kobana-mcp-payment` | 1.0.1 | 5 | yes | yes |
| `kobana-mcp-charge` | 1.0.1 | 5 | yes | yes |
| `kobana-mcp-transfer` | 1.0.1 | 5 | yes | yes |

So the artifact a user installs still contains the vulnerability described in MD-002:
a session id from `Math.random()` (~46 bits, not a CSPRNG), published in a response
header, readable cross-origin under wildcard CORS, authorizing tool calls that execute
against the real Kobana API using the server's own `KOBANA_ACCESS_TOKEN` — reachable by
the documented `npm run start:http` path.

**Scope of real exposure.** Both known first-party consumers use **stdio**, not HTTP:
`kadu` spawns `npx -y kobana-mcp-*`, and `kia-desktop` runs `node <entrypoint>`. Neither
is exposed through this path. The exposed population is anyone who followed the
documented HTTP mode from a published package — unknown, since these are public npm
packages.

**Decision:**

- **(1) A security fix is not done when it is merged. It is done when it is
  published.** The Definition of Done's release item is not administrative; for a
  security change it is the whole point.
- **(2) A security fix gets a publish of its own**, not a wait for the next feature
  release to bundle it.
- **(3) Publishing latency is tracked.** The gap between a security commit landing on
  `main` and the version carrying it appearing on npm is a number we can state. One
  month is the current baseline, and it was discovered by accident rather than
  reported by anything.
- **(4) Retroactive honesty.** The PSQ-001 CHANGELOG entry describes the vulnerability
  and its fix in detail while the vulnerable artifact stayed installable. When
  CV1.DS1 publishes, the changelog says so plainly rather than quietly implying the
  fix had been available since August.

**Consequence:**

- CV1 is reframed: not "consumers wait too long" but "the vulnerable artifact is the
  one people install". This is why CV1 precedes tests and CI in the roadmap.
- CV1.DS2 (release workflow on tags) gains a reason beyond convenience: a manual
  publish that depends on someone remembering is exactly the mechanism that failed
  here.
- Whether to file a public advisory for the affected published versions is a
  **Navigator decision**, not the Driver's, and is raised explicitly in CV1.DS1's
  plan.

**Status:** Active.
