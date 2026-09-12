[< Story](index.md)

# Plan — CV1.DS1 Version truth and the first deliberate publish

## Pull

Pulled as the first story of [CV1](../index.md), ahead of tests and CI, because the
survey that opened the CV found that the gap is not latency but exposure: the
vulnerable artifact is still the installable one (MD-006).

Technical Story level, not Delivery Story: the work is a substrate correction plus a
release, with no user-visible product surface to expand.

## Prepare

**Established facts** (all verified 2026-09-12, not assumed):

| Fact | Evidence |
|---|---|
| Nine of ten packages are unpublished | `npm view kobana-mcp-<pkg> version` vs each `package.json`: all but `financial` are `1.1.0` local against `1.0.0`–`1.0.2` published |
| `1.1.0` is the PSQ-001 security release | `git log -p mcp-transfer/package.json`: commit `688209d` bumps `1.0.1` → `1.1.0` in the same commit that migrates to stateless HTTP |
| The published artifact is still vulnerable | `npm pack kobana-mcp-{admin,payment,charge,transfer}@1.0.1` then inspect `dist/http-server.js`: 5 SSE references, 1 `Math.random()`, and `start:http` present in `scripts` |
| 37 hardcoded version literals | `grep -rn "version: '1.0.0'\|kobana-mcp-server/1.0.0" mcp-*/src`, across all ten packages |
| Both first-party consumers use stdio | `kadu/.mcp.json` spawns `npx -y`; `kia-desktop` runs `node <entrypoint>` — so neither is exposed via the HTTP path |
| `resolveJsonModule` is already enabled | every `mcp-*/tsconfig.json` |

**Risks:**

1. **Publishing ten packages by hand is the same mechanism that already failed.** The
   mitigation is a scripted, verified sequence with a dry run, not care.
2. **`kia-desktop`'s override has a version guard that fails the build on mismatch —
   by design.** The moment we publish, its build breaks until the override is removed.
   That is intended, but it means the cross-repo step is not optional follow-up; it is
   part of this story's completion.
3. **A version bump that is wrong in the other direction.** If a package's local
   `1.1.0` contains changes nobody reviewed for release, publishing it ships them.
   Requires reading the diff between each published version and `main` before
   publishing — see DD3.
4. **`rootDir: ./src` and reading `package.json`.** The manifest sits outside
   `rootDir`, so the import strategy has to survive compilation without restructuring
   `dist/` (DD1) — `dist/` layout is a contract for `kia-desktop`, whose vendoring
   copies specific file paths.

## Scope

As stated in [`index.md`](index.md#scope).

## Non-Goals

As stated in [`index.md`](index.md#out-of-scope). Emphatically: no tag workflow
(CV1.DS2), no new behavior, no `help`/`site` fencing.

## Design Decisions

**DD1 — How the version is read.** Do **not** `import pkg from '../package.json'`.
With `rootDir: ./src`, TypeScript would need the manifest inside the root or would
restructure `dist/`, and `kia-desktop` copies exact paths out of `dist/` (its override
lists `dist/config.js`, `dist/api/client.js`, `dist/tools/statement-transactions.js`).
Changing the output layout would break a consumer to fix a version string.

Instead, read it at runtime relative to the compiled file:

```ts
// src/version.ts
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The single version authority: this package's own manifest. */
export const VERSION: string = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'), 'utf8')
).version;
```

`dist/version.js` sits one level below the manifest, so `..` resolves correctly in the
published tarball. `files: ["dist", "README.md"]` already ships `package.json` (npm
always includes it), so this works from an installed package, not only from a checkout.

**DD2 — What the `User-Agent` becomes.** Today `kobana-mcp-server/1.0.0` — generic name,
wrong version. It becomes `kobana-mcp-<package>/<version>`, e.g.
`kobana-mcp-financial/1.2.1`. This is a **wire-visible change**: Kobana's own logs will
start seeing new User-Agent strings. Low risk (the header is not authenticated against),
but it is a change to what we send, so it is named rather than slipped in.

**DD3 — Version numbers are chosen by reading the diff, not by rule.** For each
package, diff the published version against `main` and choose:

- `financial`: `1.2.0` → `1.2.1`. Published `1.2.0` already matches `main` except for
  the timeout fence, which is a fix. Patch.
- the other nine: local `1.1.0` is already a minor bump over published `1.0.x` and
  already contains the security migration. Publish `1.1.1` — the existing `1.1.0`
  content plus the timeout fence — rather than publishing `1.1.0` and immediately
  following with `1.1.1`.

**Do not blanket-bump.** Each package's diff is read first; if any carries something
that should not ship, it is held back and named. This is the step whose absence caused
the incident.

**DD4 — The changelog tells the truth.** Per MD-006 item 4, each package's changelog
says the stateless-HTTP fix was merged 2026-08-11 and published on this date, and that
versions `1.0.0`–`1.0.2` remained vulnerable in the interim. No quiet implication that
it was available in August.

**DD5 — `mcp-help` and `mcp-site` are published too, without their timeout fix.** They
are in the same state (unpublished `1.1.0`) and carry the same PSQ-001 fix. Withholding
a security fix from them because a *different* fix is pending would be backwards. Their
missing timeout fence stays TD-002/TD-003, named in their changelog entries as known.

## Implementation Approach

Ordered so that each step is verifiable before the irreversible one:

1. **`src/version.ts`** added to each package (DD1). Ten near-identical files —
   consistent with MD-005, which accepts duplication across packages; a shared module
   is not extracted here.
2. **Replace the 37 literals** — `server.ts`, `http-server.ts` (×2 each), and the
   client `User-Agent` (DD2) — importing `VERSION`.
3. **The lockstep test.** This is the story's durable artifact. It is the first test in
   the repository, so it also establishes the harness CV2 will build on — a minimal
   vitest setup, parametrized over packages per MD-005, asserting that no built file
   contains a version literal disagreeing with its manifest. Scope discipline: the
   harness arrives *because this story needs it*, not as a smuggled CV2.
4. **Typecheck and build all ten**, including the two outside `workspaces`.
5. **Read ten diffs, choose ten versions** (DD3). Present the table for approval before
   any publish.
6. **Dry run:** `npm publish --dry-run` per package; inspect the file list.
7. **Publish**, then immediately verify by unpacking from the registry (not from the
   local build) that the vulnerable pattern is gone and the fence is present.
8. **Cross-repo:** delete `kia-desktop`'s override directory, rebuild, confirm its
   version guard is satisfied and its bundle still produces `kia-node`.

## Test Strategy

- **Lockstep test (new, automated):** for every package, the built `dist/` contains no
  version literal that disagrees with `package.json`. Fails today by construction —
  written red first.
- **Handshake check (manual):** run one package over stdio, complete `initialize`,
  read `serverInfo.version`.
- **Tarball check (manual, the important one):** after publishing, `npm pack` each
  package **from the registry** and assert the fixed transport is present and
  `Math.random()`/SSE are absent. Verifying the local build proves nothing about what
  consumers install — that distinction is the whole lesson of this story.
- **Consumer check (manual, cross-repo):** `kia-desktop` builds with the override
  deleted.

No test is added for the timeout fence here; that is CV2.DS1's scope, and this story
does not change that behavior.

## Validation Route

See [`test-guide.md`](test-guide.md) for copy-pasteable commands.

## Open question for the Navigator

**Does the month of published-but-vulnerable artifacts warrant a public security
advisory?**

The facts: PSQ-001 was fixed 2026-08-11 and is still absent from npm; the exploitable
path needs no token (`parseConfig` falls back to the process's own
`KOBANA_ACCESS_TOKEN`); these are public packages with unknown installers; both known
first-party consumers use stdio and are therefore **not** affected.

Options: (a) publish the fix silently, since no known consumer was exposed; (b) publish
plus a plain changelog statement (the current plan, DD4); (c) (b) plus a GitHub security
advisory and a deprecation notice on the affected versions.

This is a disclosure judgment with reputational and user-safety weight on both sides,
so it is explicitly **not** the Driver's call. MD-006 records that the decision belongs
here.

## Checkpoint

Implementation must not start until the Navigator approves this plan — including the
disclosure question above and the version table in DD3.
